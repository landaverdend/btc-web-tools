import { APIResponse, fetchTx, Vin } from '@api/api';
import { ByteStream } from '@crypto/util/ByteStream';
import { encodeVarInt, hexToBytes } from '@/crypto/util/helper';
import { useState } from 'react';
import { Script } from '@/crypto/script/Script';
import Tx from '@/crypto/transaction/Tx';
import { useDebugStore } from '@/state/debugStore';
import { useTxStore } from '@/state/txStore';

export function useFetchTx() {
  const { setScript, setScriptAsm } = useDebugStore();
  const { setTx, setSelectedInput, setPrevScriptPubkey, setTxMetadata } = useTxStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaction = async (txid: string, testnet: boolean) => {
    if (!txid) {
      setError('Missing txid');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchTx(txid, testnet);
      const { txJson } = response;

      // First check if the transaction is a coinbase, if so, escape early.
      if (txJson.vin[0].is_coinbase) {
        handleCoinbaseLockTypes(response);
        return;
      }

      // Check the locktype of the first selected input.
      const locktype = txJson.vin[0].prevout?.scriptpubkey_type;

      switch (locktype) {
        case 'p2pk':
        case 'p2pkh':
          handleLegacyLockTypes(response);
          break;
        case 'p2wpkh':
          handleSegwitLockTypes(txJson.vin[0].prevout!.scriptpubkey);
          break;
        case 'p2tr':
          handleTaprootLockTypes(txJson.vin[0].prevout!.scriptpubkey);
          break;
        default:
          throw new Error('Unknown locktype');
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLegacyLockTypes = ({ txJson, serializedTx }: APIResponse) => {
    const pkScript = Script.fromHex(txJson.vin[0].prevout!.scriptpubkey);
    const sigScript = Script.fromHex(txJson.vin[0].scriptsig);

    const result = sigScript.add(pkScript);
    const tx = Tx.fromHex(serializedTx);

    // Set the global transaction context
    setTx(tx);
    setSelectedInput(0);
    setTxMetadata({ txid: txJson.txid, lockType: txJson.vin[0].prevout!.scriptpubkey_type });
    setPrevScriptPubkey(txJson.vin[0].prevout!.scriptpubkey);

    // Send updates to script editor and overwrite the current script...
    setScript(result);
    setScriptAsm(result.toString());
  };

  const handleCoinbaseLockTypes = ({ txJson, serializedTx }: APIResponse) => {
    const tx = Tx.fromHex(serializedTx);

    setTxMetadata({ txid: txJson.txid, lockType: txJson.vin[0].prevout!.scriptpubkey_type });
  };

  const handleSegwitLockTypes = (scriptPubkey: string) => {
    throw new Error('Segwit not implemented!');
  };

  const handleTaprootLockTypes = (scriptPubkey: string) => {
    throw new Error('Taproot not implemented!');
  };

  return { fetchTransaction, isLoading, error };
}
