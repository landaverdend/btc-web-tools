import { useState } from 'react';
import './tx-fetcher.css';
import { bytesToHex } from '@/crypto/util/helper';
import { useTxStore } from '@state/txStore';
import { useFetchTx } from '@/hooks/useFetchTx';
import ColoredText from '@/components/coloredText/ColoredText';
import { useDebugStore } from '@/state/debugStore';
import { useScriptBuilder } from '@/hooks/useScriptBuilder';
import Tx from '@/crypto/transaction/Tx';

export function TxFetcher() {
  // Global State variables
  const { reset, setScript, setScriptAsm } = useDebugStore();
  const { reset: resetTxStore, setTxMetadata, setTx } = useTxStore();

  // Hooks
  const { fetchTransaction, error } = useFetchTx();
  const { buildExecutionScript } = useScriptBuilder();

  // Local State Variables
  const [txid, setTxid] = useState('');
  const [testnet, setTestnet] = useState(false);

  const handleFetch = async () => {
    const response = await fetchTransaction(txid, testnet);

    if (response) {
      const tx = Tx.fromHex(response.serializedTx);

      // Coinbase transactions don't have unlocking scripts.
      const script = buildExecutionScript(0, tx);

      // Set the script in the editor/debugger.
      setScript(script);
      setScriptAsm(script.toString());

      setTx(tx); // Set the global tx state
      setTxMetadata({ txid: tx.id(), isCoinbase: tx.isCoinbase });

      reset();
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
  const { tx, selectedInput, txMetadata, setSelectedInput } = useTxStore();
  const { txid, lockType, isCoinbase } = txMetadata || {};

  return (
    <div className="flex-column tx-details-container">
      {txMetadata && (
        <div className="flex-column tx-metadata-container">
          <div className="tx-metadata">
            Tx ID: <ColoredText color="var(--soft-green)">{txid}</ColoredText>
          </div>

          {lockType && (
            <div className="tx-metadata">
              Lock Type:
              <ColoredText color="var(--soft-red)">{' ' + lockType}</ColoredText>
            </div>
          )}

          {isCoinbase && (
            <div className="tx-metadata">
              <ColoredText color="var(--sky-blue)">Coinbase Transaction</ColoredText>
            </div>
          )}
        </div>
      )}

      {tx && (
        <div className="flex-column input-selection">
          Input Select
          {tx.inputs.map((input, i) => {
            return (
              <div
                key={i}
                className={`txin-item ${i === selectedInput ? 'active' : ''}`}
                onClick={() => {
                  setSelectedInput(i);
                }}>
                {bytesToHex(input.txid, true)}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
