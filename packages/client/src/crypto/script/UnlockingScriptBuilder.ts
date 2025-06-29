import { OP_CODES } from '../op/op';
import { bytesToHex } from '../util/helper';
import { TxContext } from './execution/executionContext';
import { Script } from './Script';
import { compileScript } from './scriptCompiler';

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
      case 'p2wpkh':
        return this.buildP2WPKH(lockingScript, txContext);
      case 'p2sh':
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
        description: '-------REDEEM SCRIPT-------',
        startIndex: scriptsig.cmds.length + pubkey.cmds.length,
        endIndex: scriptsig.cmds.length + pubkey.cmds.length + redeemScript.cmds.length,
      });
    }

    fullScript.type = pubkey.type;
    return fullScript;
  }

  static fillP2PKHTemplate(witnessData: Uint8Array[], pubkeyHash: Uint8Array) {
    let template = new Script();

    template = template.add(
      new Script([...witnessData, OP_CODES.OP_DUP, OP_CODES.OP_HASH160, pubkeyHash, OP_CODES.OP_EQUALVERIFY, OP_CODES.OP_CHECKSIG])
    );

    return template;
  }

  static buildP2WPKH(lockingScript: Script, txContext: TxContext) {
    const { tx, selectedInputIndex } = txContext;

    // Extract the sig/pubkey from the witness stack.
    const witnessItems = tx.witnessData!.stack[selectedInputIndex];
    witnessItems.forEach((item) => {
      console.log(bytesToHex(item));
    });

    // const witnessPubKey = Script.fromBytes(witnessItems[1]);

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
