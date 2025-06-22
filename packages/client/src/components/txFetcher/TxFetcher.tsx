import { useState } from 'react';
import './tx-fetcher.css';
import { fetchTx } from '@/api/api';
import Tx from '@/crypto/transaction/Tx';

export function TxFetcher() {
  const [txid, setTxid] = useState('');
  const [testnet, setTestnet] = useState(false);

  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!txid) {
      setError('Missing transaction ID');
      return;
    }

    try {
      const tx = await fetchTx(txid, testnet);
      const txObj = Tx.fromHex(tx);

      console.log(txObj);

      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
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

        <button onClick={handleSubmit}>Fetch</button>
      </div>
    </div>
  );
}
