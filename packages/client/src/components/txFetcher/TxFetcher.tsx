import { useState } from 'react';
import './tx-fetcher.css';
import { fetchTx } from '@/api/api';
import { bytesToHex, encodeVarInt, hexToBytes } from '@/crypto/util/helper';
import { ByteStream } from '@/crypto/util/ByteStream';
import { Script } from '@/crypto/script/Script';
import { useDebugStore } from '@/state/debugStore';
import Tx from '@/crypto/transaction/Tx';
import { useTxStore } from '@state/txStore';

export function TxFetcher() {
  const { setScript, setScriptAsm } = useDebugStore();
  const { setTx, setSelectedInput, setPrevScriptPubkey, setTxMetadata } = useTxStore();

  const [txid, setTxid] = useState('');
  const [testnet, setTestnet] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    if (!txid) {
      setError('Missing transaction ID');
      return;
    }

    try {
      const response = await fetchTx(txid, testnet);
      const { serializedTx, txJson } = response;

      const scriptPKBytes = hexToBytes(txJson.vin[0].prevout.scriptpubkey);
      const varint = encodeVarInt(scriptPKBytes.length);

      const scriptSig = hexToBytes(txJson.vin[0].scriptsig);
      const varint2 = encodeVarInt(scriptSig.length);

      // need to prepend the varint to script bytes for stream to read it
      const pkStream = new ByteStream(new Uint8Array([...varint, ...scriptPKBytes]));
      const sigStream = new ByteStream(new Uint8Array([...varint2, ...scriptSig]));

      const pkScript = Script.fromStream(pkStream, true);
      const sigScript = Script.fromStream(sigStream, true);

      const result = sigScript.add(pkScript);
      const tx = Tx.fromHex(serializedTx);

      setTx(tx);
      setSelectedInput(0);
      setTxMetadata({ txid, lockType: txJson.vin[0].prevout.scriptpubkey_type });

      setScript(result);
      setScriptAsm(result.toString());
      setPrevScriptPubkey(txJson.vin[0].prevout.scriptpubkey);

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
