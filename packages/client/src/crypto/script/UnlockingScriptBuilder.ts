import { OP_CODES } from '../op/op';
import { TxContext } from './execution/executionContext';
import { Script } from './Script';

export class UnlockingScriptBuilder {
  static buildUnlockingScript(txContext: TxContext) {
    const { tx, txMetadata, selectedInputIndex } = txContext;

    // Coinbase transactions don't have unlocking scripts.
    if (tx.isCoinbase) {
      const coinbaseScript = new Script();

      coinbaseScript.sections.push({
        type: 'coinbase',
        description: '-------COINBASE TRANSACTION, NO UNLOCKING SCRIPT-------',
        startIndex: 0,
        endIndex: 0,
      });

      return coinbaseScript;
    }

    // From the input, we need to determine what type of locking script is being used, and based off our current tx,
    // we need to build the unlocking script that will allow us to spend the input.
    const input = txMetadata.vin[selectedInputIndex];

    // Grab the locking script and build it
    const lockingScriptType = stripVersionPrefix(input.prevout!.scriptpubkey_type);
    const lockingScript = Script.fromHex(input.prevout!.scriptpubkey, true);
    lockingScript.type = lockingScriptType;

    switch (lockingScriptType) {
      case 'p2wsh':
        return this.buildP2WSH(lockingScript, txContext);
      case 'p2wpkh':
        return this.buildP2WPKH(lockingScript, txContext);
      case 'p2sh': // can also be wrapped segwit
        return this.buildP2SH(lockingScript, txContext);
      case 'p2pkh':
      case 'p2pk':
        return this.buildP2PKH(lockingScript, txContext);
      default:
        console.error(`Unsupported locking script type: ${lockingScriptType}`);
        throw new Error(`Unsupported locking script type: ${lockingScriptType}`);
    }
  }

  static buildFinalUnlockingScript(scriptsig: Script, pubkey: Script, redeemScript?: Script) {
    let fullScript = scriptsig.add(pubkey);

    if (redeemScript) {
      fullScript = fullScript.add(redeemScript);
    }

    fullScript.sections.push({
      type: 'scriptsig',
      description: '-------SCRIPT SIG-------',
      startIndex: 0,
      endIndex: scriptsig.cmds.length,
    });

    fullScript.sections.push({
      type: 'pubkey',
      description: '-------PUBKEY-------',
      startIndex: scriptsig.cmds.length,
      endIndex: scriptsig.cmds.length + pubkey.cmds.length,
    });

    if (redeemScript) {
      fullScript.sections.push({
        type: 'redeem',
        description: '-------REDEEM SCRIPT (Stack "Reset")-------',
        startIndex: scriptsig.cmds.length + pubkey.cmds.length,
        endIndex: scriptsig.cmds.length + pubkey.cmds.length + redeemScript.cmds.length,
      });
    }

    fullScript.type = pubkey.type;
    return fullScript;
  }

  /**
   * Segwit p2wpkh is just a p2pkh but taking in the witness data. Fill in the template...
   * @param witnessData
   * @param pubkeyHash
   * @returns
   */
  static fillP2PKHTemplate(witnessData: Uint8Array[], pubkeyHash: Uint8Array) {
    let template = new Script();

    template = template.add(
      new Script([
        ...witnessData,
        OP_CODES.OP_DUP,
        OP_CODES.OP_HASH160,
        pubkeyHash,
        OP_CODES.OP_EQUALVERIFY,
        OP_CODES.OP_CHECKSIG,
      ])
    );

    return template;
  }

  // https://medium.com/@ackhor/ch10-5-something-on-p2wsh-unlocking-locking-script-4bced02fe575
  static buildP2WSH(lockingScript: Script, txContext: TxContext) {
    const { tx, selectedInputIndex } = txContext;
    const witnessItems = tx.witnessData!.stack[selectedInputIndex];

    // Locking script should start with OP_0 and be followed by the witness script hash
    if (lockingScript.cmds[0] !== OP_CODES.OP_0) {
      throw new Error('P2WSH locking script is not a valid p2wsh script');
    }

    const witnessScriptBytes = witnessItems[witnessItems.length - 1];

    // First, check to make sure the witness script hash matches the locking script.
    const firstUnlockingScript = new Script([
      witnessScriptBytes,
      OP_CODES.OP_SHA256,
      ...lockingScript.cmds.slice(1),
      OP_CODES.OP_EQUAL,
    ]);

    const redemptionScript = Script.fromBytes(witnessScriptBytes);
    const secondUnlockingScript = new Script([...witnessItems.slice(0, -2)]).add(redemptionScript);

    const result = firstUnlockingScript.add(secondUnlockingScript);

    result.sections.push(
      {
        type: 'checkWitnessScriptHash',
        description: '-------Check Witness Script Hash--------',
        startIndex: 0,
        endIndex: firstUnlockingScript.cmds.length,
      },
      {
        type: 'witnessScript',
        description: '-------Witness Script--------',
        startIndex: firstUnlockingScript.cmds.length,
        endIndex: firstUnlockingScript.cmds.length + secondUnlockingScript.cmds.length,
      }
    );

    result.type = 'p2wsh';
    return secondUnlockingScript;
  }

  static buildP2WPKH(lockingScript: Script, txContext: TxContext) {
    const { tx, selectedInputIndex } = txContext;

    // Extract the sig/pubkey from the witness stack.
    const witnessItems = tx.witnessData!.stack[selectedInputIndex];

    // Combine them into a single script.
    // Grab the public key hash from the locking script.
    const pubkeyHash = lockingScript.cmds[lockingScript.cmds.length - 1] as Uint8Array;

    return this.fillP2PKHTemplate(witnessItems, pubkeyHash);
  }

  static buildP2PKH(lockingScript: Script, txContext: TxContext) {
    const { tx, selectedInputIndex } = txContext;
    const txScriptSig = tx.inputs[selectedInputIndex].scriptSig;

    return this.buildFinalUnlockingScript(txScriptSig, lockingScript);
  }

  static buildP2SH(lockingScript: Script, txContext: TxContext) {
    const isWrapped = txContext.tx.isSegwit;

    if (isWrapped) {
      return this.buildP2SHWrapped(lockingScript, txContext);
    } else {
      return this.buildP2SHUnwrapped(lockingScript, txContext);
    }
  }

  static buildP2SHWrapped(lockingScript: Script, txContext: TxContext) {
    const { tx, selectedInputIndex } = txContext;

    const inputScriptSig = tx.inputs[selectedInputIndex].scriptSig.cmds[0];

    if (!(inputScriptSig instanceof Uint8Array) || inputScriptSig[0] !== OP_CODES.OP_0) {
      throw new Error('Invalid Segwit Wrapping Script!');
    }

    const redeemScriptLength = inputScriptSig[1] as number;

    // P2WPKH is 20 bytes, P2WSH is 32 bytes
    if (redeemScriptLength === 20) {
      return this.buildP2SHWrappedP2WPKH(lockingScript, txContext);
    }
    if (redeemScriptLength === 32) {
      return this.buildP2SHWrappedP2WSH(lockingScript, txContext);
    }

    throw new Error('Invalid redeem script length');
  }

  static buildP2SHWrappedP2WPKH(lockingScript: Script, txContext: TxContext) {
    const { tx, selectedInputIndex } = txContext;
    // parse the scriptsig and stuff

    const scriptSig = tx.inputs[selectedInputIndex].scriptSig;
    const witnessItems = tx.witnessData!.stack[selectedInputIndex];

    // In actual bitcoin, the interpreter looks at the first two bytes to determine the script type. For here, just slice them off..
    const strippedScriptSig = (scriptSig.cmds[0] as Uint8Array).slice(2);
    const witnessScript = this.fillP2PKHTemplate(witnessItems, strippedScriptSig);

    // Build the final script.
    const finalScript = scriptSig.add(lockingScript).add(witnessScript);

    finalScript.sections.push(
      {
        type: 'scriptsig',
        description: '-------SCRIPT SIG-------',
        startIndex: 0,
        endIndex: scriptSig.cmds.length,
      },
      {
        type: 'scriptpubkey',
        description: '-------PUBKEY-------',
        startIndex: scriptSig.cmds.length,
        endIndex: scriptSig.cmds.length + lockingScript.cmds.length,
      },
      {
        type: 'redeem',
        description: "-------P2PKH SCRIPT (Stack 'Reset') -------",
        startIndex: scriptSig.cmds.length + lockingScript.cmds.length,
        endIndex: scriptSig.cmds.length + lockingScript.cmds.length + witnessScript.cmds.length,
      }
    );

    finalScript.type = 'p2sh';
    return finalScript;
  }

  static buildP2SHWrappedP2WSH(lockingScript: Script, txContext: TxContext) {
    const { tx, selectedInputIndex } = txContext;

    // STEP 1: unlocking the first p2sh lock...
    const scriptHash = tx.inputs[selectedInputIndex].scriptSig;
    const witnessData = tx.witnessData!.stack[selectedInputIndex];
    const firstUnlockingScript = scriptHash.add(lockingScript);

    // STEP 2: unlocking the witness script
    const witnessScriptBytes = witnessData[witnessData.length - 1];
    // In actual bitcoin, the interpreter looks at the first two bytes to determine the script type. For here, just slice them off..
    const strippedScriptHash = (scriptHash.cmds[0] as Uint8Array).slice(2); // 20 bytes
    const secondUnlockingScript = new Script([witnessScriptBytes, OP_CODES.OP_SHA256, strippedScriptHash, OP_CODES.OP_EQUAL]);

    // STEP 3: building the witness script
    const witnessItemsWithoutScript = witnessData.slice(0, -2);
    const witnessScript = new Script([...witnessItemsWithoutScript]).add(Script.fromBytes(witnessScriptBytes));
    const finalScript = firstUnlockingScript.add(secondUnlockingScript).add(witnessScript);

    // Get the lengths
    const firstUnlockingScriptLength = firstUnlockingScript.cmds.length;
    const secondUnlockingScriptLength = secondUnlockingScript.cmds.length;
    const witnessScriptLength = witnessScript.cmds.length;

    finalScript.sections.push(
      {
        type: 'scriptsig',
        description: '-------UNLOCKING SCRIPT FOR P2SH-------',
        startIndex: 0,
        endIndex: firstUnlockingScriptLength,
      },
      {
        type: 'scriptpubkey',
        description: '-------UNLOCKING SCRIPT FOR P2WSH-------',
        startIndex: firstUnlockingScriptLength,
        endIndex: secondUnlockingScriptLength + firstUnlockingScriptLength,
      },
      {
        type: 'redeem',
        description: '-------REDEEM SCRIPT FOR P2WSH (Stack "Reset")-------',
        startIndex: firstUnlockingScriptLength + secondUnlockingScriptLength,
        endIndex: firstUnlockingScriptLength + secondUnlockingScriptLength + witnessScriptLength,
      }
    );

    finalScript.type = 'p2sh';
    return finalScript;
  }

  static buildP2SHUnwrapped(lockingScript: Script, txContext: TxContext) {
    const { tx, selectedInputIndex } = txContext;
    const txScriptSig = tx.inputs[selectedInputIndex].scriptSig;

    // This should always be bytes in any valid transaction context. If not, we have a problem.
    const redeemScriptBytes = txScriptSig.cmds[txScriptSig.cmds.length - 1] as Uint8Array;
    const redeemScript = Script.fromBytes(redeemScriptBytes);

    return this.buildFinalUnlockingScript(txScriptSig, lockingScript, redeemScript);
  }
}

function stripVersionPrefix(type: string) {
  return type.replace(/^v\d+_/, '');
}
