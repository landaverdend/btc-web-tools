import { APIResponse, fetchTx, TxJson } from '@api/api';
import { useState } from 'react';
import { Script } from '@/crypto/script/Script';
import Tx from '@/crypto/transaction/Tx';
import { useDebugStore } from '@/state/debugStore';
import { useTxStore } from '@/state/txStore';

export function useFetchTx() {
  const { setScript, setScriptAsm } = useDebugStore();
  const { selectedInput, setTx, setSelectedInput, setPrevScriptPubkey, setTxMetadata } = useTxStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [apiResponse, setApiResponse] = useState<APIResponse | null>(null);

  // The General Idea: Fetch the transaction, set the selected input to zero.
  // Handle the creation of the unlocking script depending on the input type.
  //   - relegate this to a handleInput function
  //      - this function should take in the input, and call the script creation function depending on the locking type.
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

      // When the tx is fetched, set the initial selected input to the first input.
      setSelectedInput(0);

      // Check the locktype of the first selected input.
      const locktype = txJson.vin[0].prevout?.scriptpubkey_type;
      handleLockType(locktype!, response);

      setError(null);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLegacyLockTypes = ({ txJson, serializedTx }: APIResponse) => {
    const inputIndex = selectedInput < txJson.vin.length ? selectedInput : 0;

    const unlockingScript = buildLegacyUnlockingScript(inputIndex, { txJson, serializedTx });
    const tx = Tx.fromHex(serializedTx);

    // Set the global transaction context
    setTx(tx);
    setTxMetadata({ txid: txJson.txid, lockType: txJson.vin[selectedInput!].prevout!.scriptpubkey_type });
    setPrevScriptPubkey(txJson.vin[selectedInput!].prevout!.scriptpubkey);

    // Send updates to script editor and overwrite the current script...
    setScript(unlockingScript);
    setScriptAsm(unlockingScript.toString());
  };

  const handleCoinbaseLockTypes = ({ txJson }: APIResponse) => {
    setTxMetadata({ txid: txJson.txid, lockType: 'N/A', isCoinbase: true });
  };

  const handleLockType = (locktype: string, response: APIResponse) => {
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
      case 'p2sh':
        handleP2SHLockTypes(response);
        break;
      default:
        throw new Error('Unknown locktype');
    }
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

  const handleP2SHLockTypes = (response: APIResponse) => {};

  const buildLegacyUnlockingScript = (inputIndex: number, { txJson }: APIResponse): Script => {
    const input = txJson.vin[inputIndex];

    const pkScript = Script.fromHex(input.prevout!.scriptpubkey, true);
    const sigScript = Script.fromHex(input.scriptsig, true);

    return sigScript.add(pkScript);
  };

  return { fetchTransaction, handleLockType, isLoading, error, apiResponse };
}
