import { useState } from 'react';
import './tx-fetcher.css';
import { bytesToHex } from '@/crypto/util/helper';
import { useTxStore } from '@state/txStore';
import { useFetchTx } from '@/hooks/useFetchTx';

export function TxFetcher() {
  const { fetchTransaction, error } = useFetchTx();

  const [txid, setTxid] = useState('');
  const [testnet, setTestnet] = useState(false);

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

        <button onClick={() => fetchTransaction(txid, testnet)}>Fetch</button>
      </div>
      <TxDetails />
    </div>
  );
}

type TxDetailsProps = {};
function TxDetails({}: TxDetailsProps) {
  const { tx, selectedInput, txMetadata, setSelectedInput } = useTxStore();

  if (!tx) return <></>;

  return (
    <div className="flex-column tx-details-container">
      <div className="flex-column tx-metadata-container">
        <div className="tx-metadata">
          Tx ID: <span style={{ color: 'var(--soft-green)' }}>{txMetadata?.txid}</span>
        </div>
        <div className="tx-metadata">
          Lock Type: <span style={{ color: 'var(--soft-red)' }}>{txMetadata?.lockType}</span>
        </div>
      </div>

      <div className="flex-column input-selection">
        Input Select
        {tx.inputs.map((input, i) => {
          return (
            <div key={i} className={`txin-item ${i === selectedInput ? 'active' : ''}`} onClick={() => setSelectedInput(i)}>
              {bytesToHex(input.txid, true)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
