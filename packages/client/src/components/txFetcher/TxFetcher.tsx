import { useState, useRef, useEffect } from 'react';
import { useTxStore } from '@state/txStore';
import { useFetchTx } from '@/hooks/useFetchTx';
import ColoredText from '@/components/coloredText/ColoredText';
import Tx from '@/btclib/transaction/Tx';
import { useScriptEditorStore } from '@/state/scriptEditorStore';
import { useScriptDebugger } from '@/hooks/useScriptDebugger';
import { UnlockingScriptBuilder } from '@/btclib/script/UnlockingScriptBuilder';
import { buildTxMetadata } from '@/btclib/util/txMetadataBuilder';
import AlertIcon from '@assets/icons/alert.svg?react';
import { SvgTooltip } from '@/views/scriptView/debugControls/DebugControls';
import { CopyHover } from '../copyHover/CopyHover';

const DEMO_TX_IDS = [
  'e827a366ad4fc9a305e0901fe1eefc7e9fb8d70655a079877cf1ead0c3618ec0', // P2PK
  '0b6461de422c46a221db99608fcbe0326e4f2325ebf2a47c9faf660ed61ee6a4', // P2PKH
  '09afa3b1393f99bb01aa754dd4b89293fd8d6c9741488b537d14f7f81de1450e', // P2SH
  'cf6be35f265301446c57c470173b87e73d2e085145882d1eaf37260e894bca61', // P2WPKH
  'b38a88b073743bcc84170071cff4b68dec6fb5dc0bc8ffcb3d4ca632c2c78255', // P2WSH
  'a55bd4d4ebd319ab2990c356e16cab1eeb52a93c414b869a606dc0add61d725a', // P2SH-P2WPKH
  '55c7c71c63b87478cd30d401e7ca5344a2e159dc8d6990df695c7e0cb2f82783', // P2SH-P2WSH
];

const DEMO_OPTIONS = [
  { value: 0, label: 'P2PK' },
  { value: 1, label: 'P2PKH' },
  { value: 2, label: 'P2SH' },
  { value: 3, label: 'P2WPKH' },
  { value: 4, label: 'P2WSH' },
  { value: 5, label: 'P2SH-P2WPKH' },
  { value: 6, label: 'P2SH-P2WSH' },
];

type DemoTxsDropdownProps = {
  fetchDemo: (demoTx: number) => void;
  selectedDemo: number | null;
};

function DemoTxsDropdown({ fetchDemo, selectedDemo }: DemoTxsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedLabel = selectedDemo !== null ? DEMO_OPTIONS[selectedDemo]?.label : null;

  return (
    <div className="flex flex-col gap-2" ref={dropdownRef}>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
        Demo Transactions
      </span>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg text-sm text-left hover:border-[#3a3a3a] transition-colors cursor-pointer"
        >
          <span className={selectedLabel ? 'text-[#f7931a]' : 'text-gray-500'}>
            {selectedLabel || 'Select a demo tx...'}
          </span>
          <svg
            className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-[#1a1a1a] border border-[#2a2a2a] rounded-lg shadow-xl overflow-hidden">
            {DEMO_OPTIONS.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  fetchDemo(option.value);
                  setIsOpen(false);
                }}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-[#252525] transition-colors cursor-pointer ${selectedDemo === option.value
                  ? 'text-[#f7931a] bg-[#f7931a]/10'
                  : 'text-gray-300'
                  }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-2">
      <div className="w-5 h-5 border-2 border-[#f7931a]/30 border-t-[#f7931a] rounded-full animate-spin" />
    </div>
  );
}

type TxFetcherProps = {
  includeDemoTxs?: boolean;
  includeTaprootWarning?: boolean;
  includeInputSelector?: boolean;
  buildScript?: boolean; // whether or not the script state variables should be set
};

export function TxFetcher({ includeDemoTxs, includeTaprootWarning, includeInputSelector, buildScript }: TxFetcherProps) {
  const { reset: resetTxStore, setTransaction, setParents, setTx, setTxMetadata } = useTxStore();
  const { fetchTransaction, error, isLoading } = useFetchTx();
  const { reset, stopDebugger } = useScriptDebugger();

  const [txid, setTxid] = useState('');
  const [selectedDemoTx, setSelectedDemoTx] = useState<number | null>(null);

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

    const response = await fetchTransaction(txidf || txid);
    if (!response) {
      alert('Failed to fetch transaction');
      return;
    }

    setTransaction(response.transaction);
    setParents(response.parents);

    // Create and store the custom Tx for byte encoding display
    const customTx = Tx.fromHex(response.transaction.toHex());
    setTx(customTx);

    // Build and store TxMetadata for script execution
    const metadata = buildTxMetadata(response.transaction, response.parents);
    setTxMetadata(metadata);

    if (response && buildScript) {
      // const tx = Tx.fromHex(response.hex);
      // const script = UnlockingScriptBuilder.buildUnlockingScript({ tx: tx, txMetadata: response.txJson, selectedInputIndex: 0 });

      // setScript(script);
      // setScriptASM(script.toString());
      // setScriptHex(script.toHex(false, false));

      // setSelectedInput(0);
      // // setTxMetadata(response.txJson);
      // setTx(tx);
    }
  };

  const handleReset = () => {
    reset();
    resetTxStore();
    setSelectedDemoTx(null);
    setTxid('');
  };

  const content = (
    <div className="flex flex-col gap-4">
      {includeDemoTxs && <DemoTxsDropdown fetchDemo={fetchDemo} selectedDemo={selectedDemoTx} />}

      {/* Divider */}
      {includeDemoTxs && <div className="h-px bg-[#2a2a2a]" />}

      {/* Transaction Fetcher */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            Fetch Transaction
          </span>
          {includeTaprootWarning && (
            <SvgTooltip tooltipContent="Taproot transactions not currently supported">
              <AlertIcon height={12} width={12} className="text-[#f7931a] opacity-60" />
            </SvgTooltip>
          )}
        </div>

        <input
          placeholder="Enter transaction ID..."
          type="text"
          value={txid}
          onChange={(e) => setTxid(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleFetch()}
          className={`w-full px-3 py-2 bg-[#1a1a1a] border rounded-lg text-sm text-gray-200 placeholder-gray-600 focus:outline-none focus:border-[#f7931a]/50 transition-colors ${error ? 'border-red-500/50' : 'border-[#2a2a2a]'
            }`}
        />

        {error && <p className="text-red-400 text-xs">{error}</p>}

        <div className="flex flex-row gap-2">
          <button
            onClick={() => handleFetch()}
            disabled={isLoading || !txid}
            className="flex-1 px-3 py-1.5 bg-[#f7931a] hover:bg-[#f7931a]/90 disabled:bg-[#f7931a]/30 disabled:cursor-not-allowed rounded-lg text-sm font-medium text-white transition-colors cursor-pointer"
          >
            Fetch
          </button>
          <button
            onClick={handleReset}
            className="flex-1 px-3 py-1.5 bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#3a3a3a] rounded-lg text-sm text-gray-400 hover:text-gray-300 transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {isLoading && <LoadingSpinner />}

      <TxDetails includeInputSelector={includeInputSelector} />
    </div>
  );

  if (!buildScript) {
    return (
      <div className="flex flex-col p-4 min-w-[280px] max-w-[320px] bg-gradient-to-b from-[#1a1a1a] to-[#151515] rounded-xl border border-[#2a2a2a] h-fit">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#2a2a2a]">
          <div className="w-2 h-2 rounded-full bg-[#f7931a]" />
          <span className="text-sm font-semibold text-white">Transaction Fetcher</span>
        </div>
        {content}
      </div>
    );
  }

  return content;
}

type TxDetailsProps = { includeInputSelector?: boolean };

function TxDetails({ includeInputSelector }: TxDetailsProps) {
  const { tx, selectedInput, txMetadata, setSelectedInput } = useTxStore();
  const { txid } = txMetadata || {};
  const { setScript, setScriptASM, setScriptHex } = useScriptEditorStore();

  const isCoinbase = tx?.isCoinbase;
  const showInputs = txMetadata && !isCoinbase && includeInputSelector;

  const buildScriptForInput = (inputIndex: number) => {
    if (!tx || !txMetadata) return;

    const script = UnlockingScriptBuilder.buildUnlockingScript({
      tx: tx,
      txMetadata: txMetadata,
      selectedInputIndex: inputIndex,
    });

    setScript(script);
    setScriptASM(script.toString());
    setScriptHex(script.toHex(false, false));
  };

  const handleSelectInput = (inputIndex: number) => {
    setSelectedInput(inputIndex);
    buildScriptForInput(inputIndex);
  };

  // Automatically build script for input 0 when transaction is loaded
  useEffect(() => {
    if (tx && txMetadata && !isCoinbase && includeInputSelector) {
      buildScriptForInput(selectedInput);
    }
  }, [txMetadata?.txid]); // Only run when a new transaction is loaded

  if (!txMetadata) return null;

  return (
    <div className="flex flex-col gap-3">
      {/* Divider */}
      <div className="h-px bg-[#2a2a2a]" />

      {/* Tx Info */}
      <div className="flex flex-col gap-2">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
          Loaded Transaction
        </span>
        <div className="flex items-center gap-2">
          <CopyHover>
            <span className="text-sm text-[#22c55e] font-mono truncate max-w-[200px]" title={txid}>
              {txid}
            </span>
          </CopyHover>
        </div>

        {isCoinbase && (
          <div className="px-2 py-1 bg-[#0ea5e9]/10 rounded text-xs">
            <ColoredText color="var(--sky-blue)">Coinbase Transaction</ColoredText>
          </div>
        )}
      </div>

      {/* Input Selector */}
      {showInputs && (
        <div className="flex flex-col gap-2">
          <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-500">
            Select Input
          </span>
          <div className="flex flex-col gap-1 max-h-[150px] overflow-y-auto">
            {txMetadata.vin.map((input, i) => {
              const isActive = i === selectedInput;
              return (
                <button
                  key={i}
                  onClick={() => handleSelectInput(i)}
                  className={`flex items-center gap-2 px-2 py-1.5 rounded-lg text-left transition-all cursor-pointer ${isActive
                    ? 'bg-[#f7931a]/10 border border-[#f7931a]/30'
                    : 'bg-[#1a1a1a] border border-transparent hover:border-[#2a2a2a]'
                    }`}
                >
                  <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${isActive ? 'bg-[#f7931a]/20 text-[#f7931a]' : 'bg-[#252525] text-gray-500'
                    }`}>
                    {i}
                  </span>
                  <span className="text-xs text-purple-400 font-medium">
                    {input.prevout?.scriptpubkey_type}
                  </span>
                  <CopyHover>
                    <span className={`text-xs font-mono truncate max-w-[120px] ${isActive ? 'text-[#22c55e]' : 'text-gray-500'
                      }`}>
                      {input.txid}
                    </span>
                  </CopyHover>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
