import { TxMetadata, Vin } from '@/api/api';
import { Script } from '@/crypto/script/Script';
import { bytesToHex } from '@/crypto/util/helper';

const SCRIPT_SIG_DESCRIPTION = '-------SCRIPT SIG-------';
const PUBKEY_DESCRIPTION = '-------PUBKEY-------';
const REDEEM_DESCRIPTION = '-------REDEEM SCRIPT-------';

// Build a script from a response
export function useScriptBuilder() {
  const buildP2PKH = (input: Vin) => {
    const scriptsig = Script.fromHex(input.scriptsig);

    const pubkey = Script.fromHex(input.prevout!.scriptpubkey);

    const result = scriptsig.add(pubkey);

    // Add script section metadata
    result.sections.push(
      {
        type: 'scriptsig',
        description: SCRIPT_SIG_DESCRIPTION,
        startIndex: 0,
        endIndex: scriptsig.cmds.length,
      },
      {
        type: 'pubkey',
        description: PUBKEY_DESCRIPTION,
        startIndex: scriptsig.cmds.length,
        endIndex: scriptsig.cmds.length + pubkey.cmds.length,
      }
    );
    result.type = input.prevout!.scriptpubkey_type;
    return result;
  };

  const buildP2SH = (input: Vin) => {
    const scriptpubkey = Script.fromHex(input.prevout!.scriptpubkey, true);
    const scriptsig = Script.fromHex(input.scriptsig, true);

    // This should always be bytes in any valid transaction context. If not, we have a problem.
    const redeemScriptBytes = scriptsig.cmds[scriptsig.cmds.length - 1] as Uint8Array;
    const redeemScript = Script.fromHex(bytesToHex(redeemScriptBytes));

    const result = scriptsig.add(scriptpubkey).add(redeemScript);

    result.sections.push(
      {
        type: 'scriptsig',
        description: SCRIPT_SIG_DESCRIPTION,
        startIndex: 0,
        endIndex: scriptsig.cmds.length,
      },
      {
        type: 'pubkey',
        description: PUBKEY_DESCRIPTION,
        startIndex: scriptsig.cmds.length,
        endIndex: scriptsig.cmds.length + scriptpubkey.cmds.length,
      },
      {
        type: 'redeem',
        description: REDEEM_DESCRIPTION,
        startIndex: scriptsig.cmds.length + scriptpubkey.cmds.length,
        endIndex: scriptsig.cmds.length + scriptpubkey.cmds.length + redeemScript.cmds.length,
      }
    );

    result.type = 'p2sh';
    return result;
  };

  const buildExecutionScript = (inputIndex: number, tx: TxMetadata) => {
    const input = tx.vin[inputIndex];

    // Coinbase transactions don't have unlocking scripts. Just return the scriptsig
    if (input.is_coinbase) {
      try {
        return Script.fromHex(input.scriptsig, true);
      } catch (error) {
        console.log('Coinbase transaction with invalid script');
        const script = new Script([]);
        script.sections.push({
          type: 'coinbase script',
          description: 'This is a coinbase transaction with an invalid script',
          startIndex: 0,
          endIndex: 1,
        });
        return script;
      }
    }

    const type = input.prevout!.scriptpubkey_type;
    switch (type) {
      case 'p2pkh':
      case 'p2pk':
        return buildP2PKH(input);
      case 'p2sh':
        return buildP2SH(input);
      default:
        throw new Error(`Unsupported script type ${type}`);
    }
  };

  return { buildExecutionScript };
}
