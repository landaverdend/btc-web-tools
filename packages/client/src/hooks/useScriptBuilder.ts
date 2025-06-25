import { Script } from '@/crypto/script/Script';
import Tx from '@/crypto/transaction/Tx';

// Build a script from a response
export function useScriptBuilder() {
  const buildExecutionScript = (inputIndex: number, tx: Tx) => {
    // coinbase transactions don't have unlocking scripts. Just return the scriptsig...
    if (tx.isCoinbase) {
      return tx.inputs[0].scriptSig.clone();
    }

    return new Script();
  };

  return { buildExecutionScript };
}
