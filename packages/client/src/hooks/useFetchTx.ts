import { APIResponse, fetchTx, TxJson } from '@api/api';
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
  const [apiResponse, setApiResponse] = useState<APIResponse | null>(null);

  const fetchTransaction = async (txid: string, testnet: boolean) => {
    if (!txid) {
      setError('Missing txid');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchTx(txid, testnet);
      setApiResponse(response);

      const { txJson } = response;

      // First check if the transaction is a coinbase, if so, escape early.
      if (txJson.vin[0].is_coinbase) {
        handleCoinbaseLockTypes(response);
        return;
      }

      // Check the locktype of the first selected input.
      const locktype = txJson.vin[0].prevout?.scriptpubkey_type;

      switch (locktype) {
        case 'p2ms':
          handleP2MSLockTypes(response);
          break;
        case 'p2pk':
        case 'p2pkh':
          handleLegacyLockTypes(response);
          break;
        case 'p2wpkh':
          handleSegwitLockTypes(response);
          break;
        case 'p2tr':
          handleTaprootLockTypes(response);
          break;
        default:
          throw new Error('Unknown locktype');
      }

      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLegacyLockTypes = ({ txJson, serializedTx }: APIResponse) => {
    const unlockingScript = buildLegacyUnlockingScript(0, { txJson, serializedTx });
    const tx = Tx.fromHex(serializedTx);

    // Set the global transaction context
    setTx(tx);
    setSelectedInput(0);
    setTxMetadata({ txid: txJson.txid, lockType: txJson.vin[0].prevout!.scriptpubkey_type });
    setPrevScriptPubkey(txJson.vin[0].prevout!.scriptpubkey);

    // Send updates to script editor and overwrite the current script...
    setScript(unlockingScript);
    setScriptAsm(unlockingScript.toString());
  };

  const handleCoinbaseLockTypes = ({ txJson }: APIResponse) => {
    setTxMetadata({ txid: txJson.txid, lockType: 'N/A', isCoinbase: true });
  };

  const handleSegwitLockTypes = ({}: APIResponse) => {
    throw new Error('Segwit not implemented!');
  };

  const handleTaprootLockTypes = ({}: APIResponse) => {
    throw new Error('Taproot not implemented!');
  };

  const handleP2MSLockTypes = ({}: APIResponse) => {
    throw new Error('P2MS not implemented!');
  };

  const buildLegacyUnlockingScript = (inputIndex: number, { txJson }: APIResponse): Script => {
    const input = txJson.vin[inputIndex];

    const pkScript = Script.fromHex(input.prevout!.scriptpubkey, true);
    const sigScript = Script.fromHex(input.scriptsig, true);

    return sigScript.add(pkScript);
  };

  return { fetchTransaction, buildLegacyUnlockingScript, isLoading, error, apiResponse };
}
