import { useState } from 'react';
import './tx-fetcher.css';
import { useTxStore } from '@state/txStore';
import { useFetchTx } from '@/hooks/useFetchTx';
import ColoredText from '@/components/coloredText/ColoredText';
import Tx from '@/crypto/transaction/Tx';
import { useScriptEditorStore } from '@/state/scriptEditorStore';
import { useScriptDebugger } from '@/hooks/useScriptDebugger';
import { UnlockingScriptBuilder } from '@/crypto/script/UnlockingScriptBuilder';
import AlertIcon from '@assets/icons/alert.svg?react';
import { SvgTooltip } from '@/views/scriptView/debugControls/DebugControls';

const DEMO_TX_IDS = [
  'e827a366ad4fc9a305e0901fe1eefc7e9fb8d70655a079877cf1ead0c3618ec0', // P2PK
  '0b6461de422c46a221db99608fcbe0326e4f2325ebf2a47c9faf660ed61ee6a4', // P2PKH
  '09afa3b1393f99bb01aa754dd4b89293fd8d6c9741488b537d14f7f81de1450e', // P2SH
  'cf6be35f265301446c57c470173b87e73d2e085145882d1eaf37260e894bca61', // P2WPKH
  'b38a88b073743bcc84170071cff4b68dec6fb5dc0bc8ffcb3d4ca632c2c78255', // P2WSH
  'a55bd4d4ebd319ab2990c356e16cab1eeb52a93c414b869a606dc0add61d725a', // P2SH-P2WPKH
  '55c7c71c63b87478cd30d401e7ca5344a2e159dc8d6990df695c7e0cb2f82783', // P2SH-P2WSH
];

type TxFetcherProps = {
  includeDemoTxs?: boolean;
};
export function TxFetcher({ includeDemoTxs }: TxFetcherProps) {
  // Global State variables
  const { reset: resetTxStore, setSelectedInput, setTxMetadata, setTx } = useTxStore();
  const { setScript, setScriptASM, setScriptHex } = useScriptEditorStore();

  // Hooks
  const { fetchTransaction, error } = useFetchTx();
  const { reset } = useScriptDebugger();

  // Local State Variables
  const [txid, setTxid] = useState('');
  const [selectedDemoTx, setSelectedDemoTx] = useState<number | null>(null);

  const fetchDemo = (demoTx: number) => {
    const txid = DEMO_TX_IDS[demoTx];
    setTxid(txid);
    handleFetch(txid);
    setSelectedDemoTx(demoTx);
  };

  const handleFetch = async (txidf?: string) => {
    reset();
    resetTxStore();
    const response = await fetchTransaction(txidf || txid, false);

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
      {includeDemoTxs && (
        <div className="flex-column demo-txs-container">
          <div className="demo-txs-title">Demo Transactions</div>
          <ul>
            <li className={selectedDemoTx === 0 ? 'active' : ''} onClick={() => fetchDemo(0)}>
              P2PK
            </li>
            <li className={selectedDemoTx === 1 ? 'active' : ''} onClick={() => fetchDemo(1)}>
              P2PKH
            </li>
            <li className={selectedDemoTx === 2 ? 'active' : ''} onClick={() => fetchDemo(2)}>
              P2SH
            </li>
            <li className={selectedDemoTx === 3 ? 'active' : ''} onClick={() => fetchDemo(3)}>
              P2WPKH
            </li>
            <li className={selectedDemoTx === 4 ? 'active' : ''} onClick={() => fetchDemo(4)}>
              P2WSH
            </li>
            <li className={selectedDemoTx === 5 ? 'active' : ''} onClick={() => fetchDemo(5)}>
              P2SH-P2WPKH
            </li>
            <li className={selectedDemoTx === 6 ? 'active' : ''} onClick={() => fetchDemo(6)}>
              P2SH-P2WSH
            </li>
          </ul>
        </div>
      )}

      <h3 className="flex-row">
        Transaction Fetcher
        <SvgTooltip tooltipContent="Taproot Transactions not currently supported">
          <AlertIcon height={16} width={16} />
        </SvgTooltip>
      </h3>
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

        <div className="flex-row tx-fetcher-buttons">
          <button onClick={() => handleFetch()}>Fetch</button>
          <button
            onClick={() => {
              reset();
              resetTxStore();
              setSelectedDemoTx(null);
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
