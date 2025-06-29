import { useState } from 'react';
import './tx-fetcher.css';
import { useTxStore } from '@state/txStore';
import { useFetchTx } from '@/hooks/useFetchTx';
import ColoredText from '@/components/coloredText/ColoredText';
import { useScriptBuilder } from '@/hooks/useScriptBuilder';
import Tx from '@/crypto/transaction/Tx';
import { useScriptEditorStore } from '@/state/scriptEditorStore';
import { useScriptDebugger } from '@/hooks/useScriptDebugger';
import { UnlockingScriptBuilder } from '@/crypto/script/UnlockingScriptBuilder';

export function TxFetcher() {
  // Global State variables
  const { reset: resetTxStore, setSelectedInput, setTxMetadata, setTx } = useTxStore();
  const { setScript, setScriptASM, setScriptHex } = useScriptEditorStore();

  // Hooks
  const { fetchTransaction, error } = useFetchTx();
  const { reset } = useScriptDebugger();

  // Local State Variables
  const [txid, setTxid] = useState('');
  const [testnet, setTestnet] = useState(false);

  const handleFetch = async () => {
    reset();
    resetTxStore();
    const response = await fetchTransaction(txid, testnet);

    if (response) {
      const tx = Tx.fromHex(response.serializedTx);
      const script = UnlockingScriptBuilder.buildUnlockingScript({ tx: tx, txMetadata: response.txJson, selectedInputIndex: 0 });

      // Update the script editor textfields/object
      setScript(script);
      setScriptASM(script.toString());
      setScriptHex(script.toHex(false, false));

      setSelectedInput(0);
      setTxMetadata(response.txJson);
      setTx(tx); // Set the global tx state
    }
  };

  return (
    <div className="flex-column tx-fetcher-container">
      <h3>Transaction Fetcher</h3>

      <div className="flex-column tx-fetcher-input-container">
        <label htmlFor="txid" className="flex-column">
          Transaction ID
          <input
            id="txid"
            placeholder="Transaction ID"
            type="text"
            value={txid}
            onChange={(e) => setTxid(e.target.value)}
            style={{ border: error ? '1px solid red' : 'none' }}
          />
          {error && <p style={{ color: 'red' }}>{error}</p>}
        </label>

        <label htmlFor="testnet" className="flex-row testnet-checkbox">
          Testnet?
          <input id="testnet" type="checkbox" checked={testnet} onChange={(e) => setTestnet(e.target.checked)} />
        </label>
        <div className="flex-row tx-fetcher-buttons">
          <button onClick={handleFetch}>Fetch</button>
          <button
            onClick={() => {
              reset();
              resetTxStore();
            }}
            id="reset">
            Reset
          </button>
        </div>
      </div>
      <TxDetails />
    </div>
  );
}

type TxDetailsProps = {};
function TxDetails({}: TxDetailsProps) {
  // Global state imports
  const { tx, selectedInput, txMetadata, setSelectedInput } = useTxStore();
  const { txid } = txMetadata || {};
  const { setScript, setScriptASM, setScriptHex } = useScriptEditorStore();

  // Hooks
  const isCoinbase = tx?.isCoinbase;
  const showInputs = txMetadata && !isCoinbase;

  const handleSelectInput = (inputIndex: number) => {
    setSelectedInput(inputIndex);

    const script = UnlockingScriptBuilder.buildUnlockingScript({
      tx: tx!,
      txMetadata: txMetadata!,
      selectedInputIndex: inputIndex,
    });

    // Update the script editor textfields/object
    setScript(script);
    setScriptASM(script.toString());
    setScriptHex(script.toHex(false, false));
  };

  return (
    <div className="flex-column tx-details-container">
      {txMetadata && (
        <div className="flex-column tx-metadata-container">
          <div className="tx-metadata">
            Tx ID: <ColoredText color="var(--soft-green)">{txid}</ColoredText>
          </div>

          {isCoinbase && (
            <div className="tx-metadata">
              <ColoredText color="var(--sky-blue)">Coinbase Transaction</ColoredText>
            </div>
          )}
        </div>
      )}

      {showInputs && (
        <div className="flex-column input-selection">
          Input Select
          {txMetadata.vin.map((input, i) => {
            return (
              <div key={i} className={`txin-item ${i === selectedInput ? 'active' : ''}`} onClick={() => handleSelectInput(i)}>
                <ColoredText color="var(--soft-purple)">{input.prevout?.scriptpubkey_type}</ColoredText>: {input.txid}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
