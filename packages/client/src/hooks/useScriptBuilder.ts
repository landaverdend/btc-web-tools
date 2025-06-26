import { TxMetadata, Vin } from '@/api/api';
import { Script } from '@/crypto/script/Script';

// Build a script from a response
export function useScriptBuilder() {
  

  const buildP2PKH = (input: Vin) => {
    const scriptsig = Script.fromHex(input.scriptsig);
    const pubkey = Script.fromHex(input.prevout!.scriptpubkey);

    return scriptsig.add(pubkey);
  };

  const buildExecutionScript = (inputIndex: number, tx: TxMetadata) => {
    const input = tx.vin[inputIndex];

    // Coinbase transactions don't have unlocking scripts. Just return the scriptsig
    if (input.is_coinbase) {
      return Script.fromHex(input.scriptsig, true);
    }

    const type = input.prevout!.scriptpubkey_type;
    switch (type) {
      case 'p2pkh':
      case 'p2pk':
        return buildP2PKH(input);
      default:
        throw new Error(`Unsupported script type ${type}`);
    }
  };

  return { buildExecutionScript };
}
