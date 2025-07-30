import { useState } from 'react';
import { useTxStore } from '@state/txStore';
import { useFetchTx } from '@/hooks/useFetchTx';
import ColoredText from '@/components/coloredText/ColoredText';
import Tx from '@/btclib/transaction/Tx';
import { useScriptEditorStore } from '@/state/scriptEditorStore';
import { useScriptDebugger } from '@/hooks/useScriptDebugger';
import { UnlockingScriptBuilder } from '@/btclib/script/UnlockingScriptBuilder';
import AlertIcon from '@assets/icons/alert.svg?react';
import { SvgTooltip } from '@/views/scriptView/debugControls/DebugControls';
import { Flex, Select, Spin } from 'antd';

const DEMO_TX_IDS = [
  'e827a366ad4fc9a305e0901fe1eefc7e9fb8d70655a079877cf1ead0c3618ec0', // P2PK
  '0b6461de422c46a221db99608fcbe0326e4f2325ebf2a47c9faf660ed61ee6a4', // P2PKH
  '09afa3b1393f99bb01aa754dd4b89293fd8d6c9741488b537d14f7f81de1450e', // P2SH
  'cf6be35f265301446c57c470173b87e73d2e085145882d1eaf37260e894bca61', // P2WPKH
  'b38a88b073743bcc84170071cff4b68dec6fb5dc0bc8ffcb3d4ca632c2c78255', // P2WSH
  'a55bd4d4ebd319ab2990c356e16cab1eeb52a93c414b869a606dc0add61d725a', // P2SH-P2WPKH
  '55c7c71c63b87478cd30d401e7ca5344a2e159dc8d6990df695c7e0cb2f82783', // P2SH-P2WSH
];

import type { SelectProps } from 'antd';
import { CopyHover } from '../copyHover/CopyHover';

type LabelRender = SelectProps['labelRender'];
const labelRender: LabelRender = (props) => {
  const { label, value } = props;

  if (label) {
    return value;
  }

  return <span>None Selected</span>;
};

type DemoTxsDropdownProps = {
  fetchDemo: (demoTx: number) => void;
};
function DemoTxsDropdown({ fetchDemo }: DemoTxsDropdownProps) {
  const handleSelect = (value: string) => {
    switch (value) {
      case 'P2PK':
        fetchDemo(0);
        break;
      case 'P2PKH':
        fetchDemo(1);
        break;
      case 'P2SH':
        fetchDemo(2);
        break;
      case 'P2WPKH':
        fetchDemo(3);
        break;
      case 'P2WSH':
        fetchDemo(4);
        break;
      case 'P2SH-P2WPKH':
        fetchDemo(5);
        break;
      case 'P2SH-P2WSH':
        fetchDemo(6);
        break;
      default:
        break;
    }
  };

  const options = [
    { value: 'P2PK', label: 'P2PK' },
    { value: 'P2PKH', label: 'P2PKH' },
    { value: 'P2SH', label: 'P2SH' },
    { value: 'P2WPKH', label: 'P2WPKH' },
    { value: 'P2WSH', label: 'P2WSH' },
    { value: 'P2SH-P2WPKH', label: 'P2SH-P2WPKH' },
    { value: 'P2SH-P2WSH', label: 'P2SH-P2WSH' },
  ];

  return (
    <div className="flex flex-col justify-center items-center gap-5">
      <span className="text-(--soft-orange) text-lg">Demo Transactions</span>
      <Select className="w-4/5" options={options} labelRender={labelRender} onSelect={handleSelect}></Select>{' '}
    </div>
  );
}

type TxFetcherProps = {
  includeDemoTxs?: boolean;
  includeTaprootWarning?: boolean;
  includeInputSelector?: boolean;
};
export function TxFetcher({ includeDemoTxs, includeTaprootWarning, includeInputSelector }: TxFetcherProps) {
  // Global State variables
  const { reset: resetTxStore, setSelectedInput, setTxMetadata, setTx } = useTxStore();
  const { setScript, setScriptASM, setScriptHex } = useScriptEditorStore();

  // Hooks
  const { fetchTransaction, error, isLoading } = useFetchTx();
  const { reset, stopDebugger } = useScriptDebugger();

  // Local State Variables
  const [txid, setTxid] = useState('');
  const [_, setSelectedDemoTx] = useState<number | null>(null);

  const fetchDemo = (demoTx: number) => {
    const txid = DEMO_TX_IDS[demoTx];
    setTxid(txid);
    handleFetch(txid);
    setSelectedDemoTx(demoTx);
  };

  const handleFetch = async (txidf?: string) => {
    stopDebugger();
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
      setTx(tx);
    }
  };

  return (
    <div className="flex flex-0.5 flex-col items-center p-2 gap-5 h-fit w-full sm:w-auto rounded-md bg-(--header-gray)">
      {includeDemoTxs && <DemoTxsDropdown fetchDemo={fetchDemo} />}

      <h3 className="flex flex-col items-center text-white text-lg font-bold">
        Transaction Fetcher
        {includeTaprootWarning && (
          <SvgTooltip tooltipContent="Taproot Transactions not currently supported">
            <AlertIcon height={16} width={16} className="alert-icon" />
          </SvgTooltip>
        )}
      </h3>

      <div className="flex flex-col gap-3  items-center">
        <label htmlFor="txid" className="flex flex-col items-start gap-2 w-full">
          <span className="text-white text-md">Transaction ID</span>
          <input
            id="txid"
            placeholder="Transaction ID"
            type="text"
            value={txid}
            onChange={(e) => setTxid(e.target.value)}
            className={` bg-white rounded-md p-[5px] w-full  ${error ? 'border-red-500' : 'border-gray-300'}`}
          />
          {error && <p className="text-red-500">{error}</p>}
        </label>

        <div className="flex flex-row gap-2 w-full">
          <button
            onClick={() => handleFetch()}
            className="flex-1 bg-amber-500 rounded-md text-white p-0.5 hover:opacity-80 cursor-pointer">
            Fetch
          </button>
          <button
            onClick={() => {
              reset();
              resetTxStore();
              setSelectedDemoTx(null);
            }}
            id="reset"
            className="flex-1 bg-(--soft-red) rounded-md p-0.5 text-white hover:opacity-80 cursor-pointer">
            Reset
          </button>
        </div>
      </div>

      {isLoading && <Spin />}

      <TxDetails includeInputSelector={includeInputSelector} />
    </div>
  );
}

type TxDetailsProps = { includeInputSelector?: boolean };
function TxDetails({ includeInputSelector }: TxDetailsProps) {
  // Global state imports
  const { tx, selectedInput, txMetadata, setSelectedInput } = useTxStore();
  const { txid } = txMetadata || {};
  const { setScript, setScriptASM, setScriptHex } = useScriptEditorStore();

  // Hooks
  const isCoinbase = tx?.isCoinbase;
  const showInputs = txMetadata && !isCoinbase && includeInputSelector;

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
    <div className="flex flex-col items-start gap-1 w-full">
      {txMetadata && (
        <div className="flex flex-col">
          <div className="flex flex-row items-center justify-center w-full gap-2 truncate">
            <span className="text-white">Tx ID: </span>
            <CopyHover>
              <span className="text-(--soft-green) truncate max-w-[300px] inline-block">{txid}</span>
            </CopyHover>
          </div>

          {isCoinbase && (
            <div className="tx-metadata">
              <ColoredText color="var(--sky-blue)">Coinbase Transaction</ColoredText>
            </div>
          )}
        </div>
      )}

      {showInputs && (
        <Flex vertical className="input-selection" gap={5}>
          Input Select
          {txMetadata.vin.map((input, i) => {
            return (
              <div key={i} className={`txin-item ${i === selectedInput ? 'active' : ''}`} onClick={() => handleSelectInput(i)}>
                <ColoredText color="var(--soft-purple)">{input.prevout?.scriptpubkey_type}</ColoredText>:{' '}
                <CopyHover>{input.txid}</CopyHover>
              </div>
            );
          })}
        </Flex>
      )}
    </div>
  );
}
