import Tx from '@/crypto/transaction/Tx';
import './tx-hex-view.css';
import { useState } from 'react';
import { PlacesType, Tooltip } from 'react-tooltip';
import { createPortal } from 'react-dom';

const COLORS = {
  version: '#c084fc',
  varInts: '#a3e635',
  witnessMarker: '#38bdf8',
  witnessFlag: '#38bdf8',
  inputs: '#d4d4d8',
  outputs: '#fb923c',
  witnesses: '#ef4444',
  locktime: '#38bdf8',
};

type TBProps = {
  bytes: string;
  color: string;

  toolTips: { content: string; place?: PlacesType }[];
};
function Bytefield({ bytes, color, toolTips }: TBProps) {
  const id = crypto.randomUUID();

  const tooltips = toolTips.map(({ content, place }, i) => {
    return <Tooltip key={i} id={id} style={{ zIndex: 1000 }} place={place ? place : 'left'} content={content} />;
  });

  return (
    <>
      <a id={id} data-tooltip-id={id} style={{ color }}>
        {bytes}
      </a>
      {/* Stupid fucking hack */}
      {createPortal(tooltips, document.body)}
    </>
  );
}

type TXHVProps = {
  tx: Tx;
  setTx: (tx: Tx) => void;
};
export default function TxHexView({ tx, setTx }: TXHVProps) {
  const [txHex, setTxHex] = useState<string>(tx.toHex());
  const [hexError, setHexError] = useState<string | null>(null);

  // Only build the tx if we don't have an active error on that string
  const txLE = tx.formatLE();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTxHex(e.target.value);
    console.log(e.target.value);
    try {
      if (!/^[0-9a-fA-F]+$/.test(e.target.value)) {
        throw new Error('Please enter only hexadecimal characters (0-9, a-f, A-F)');
      }

      let validTx = Tx.fromHex(e.target.value);
      setTx(validTx);
      console.log(validTx);
      setHexError(null);
    } catch (error) {
      console.error(error);
      setHexError(error instanceof Error ? error.message : 'Invalid hex string');
    }
  };

  return (
    <div id="test" className="flex-column tx-hex-view-container">
      <p className="tx-bytes">
        {hexError && txHex}
        {/* If TX exists, spit it out.*/}
        {!hexError && (
          <>
            <Bytefield
              bytes={txLE.version}
              color={COLORS.version}
              toolTips={[{ content: 'Transaction Version', place: 'top' }]}
            />
            {txLE.marker && (
              <Bytefield
                bytes={txLE.marker}
                color={COLORS.witnessMarker}
                toolTips={[{ content: 'Witness Marker', place: 'top' }]}
              />
            )}
            {txLE.flag && (
              <Bytefield bytes={txLE.flag} color={COLORS.witnessFlag} toolTips={[{ content: 'Witness Flag', place: 'top' }]} />
            )}
            <Bytefield bytes={txLE.inputCount} color={COLORS.varInts} toolTips={[{ content: 'Input Count', place: 'top' }]} />
            {txLE.inputs.map(({ txid, vout, scriptSig, sequence }) => (
              <>
                <Bytefield key={txid} bytes={txid} color={COLORS.inputs} toolTips={[{ content: 'Input Transaction ID' }]} />
                <Bytefield
                  key={vout}
                  bytes={vout}
                  color={COLORS.inputs}
                  toolTips={[{ content: 'Input: Previous Output Index' }]}
                />
                <Bytefield
                  key={scriptSig.cmds}
                  bytes={scriptSig.cmds}
                  color={COLORS.inputs}
                  toolTips={[{ content: 'Input: Script Signature' }]}
                />
                <Bytefield
                  key={sequence}
                  bytes={sequence}
                  color={COLORS.inputs}
                  toolTips={[{ content: 'Input: Sequence Number' }]}
                />
              </>
            ))}

            <Bytefield bytes={txLE.outputCount} color={COLORS.varInts} toolTips={[{ content: 'Output Count', place: 'top' }]} />
            {txLE.outputs.map(({ amount, scriptPubkey }, i) => (
              <>
                <Bytefield
                  key={amount}
                  bytes={amount}
                  color={COLORS.outputs}
                  toolTips={[{ content: `Output #${i + 1}: Amount` }]}
                />
                <Bytefield
                  key={scriptPubkey.cmds}
                  bytes={scriptPubkey.cmds}
                  color={COLORS.outputs}
                  toolTips={[{ content: `Output #${i + 1}: Script Public Key` }]}
                />
              </>
            ))}
            {txLE.witnesses &&
              txLE.witnesses.map(({ stackLength, stack }) => (
                <>
                  <Bytefield bytes={stackLength} color={COLORS.witnesses} toolTips={[{ content: 'Witness Stack Size' }]} />
                  {stack.map((item, i) => (
                    <Bytefield
                      key={item}
                      bytes={item}
                      color={COLORS.witnesses}
                      toolTips={[{ content: `Witness Stack Item #${i + 1}` }]}
                    />
                  ))}
                </>
              ))}
            <Bytefield bytes={txLE.locktime} color={COLORS.locktime} toolTips={[{ content: 'Transaction Locktime' }]} />
          </>
        )}
      </p>

      {!hexError && <label style={{ color: 'white' }}>Encoded Transaction</label>}
      {hexError && <label style={{ color: 'red' }}>Error: {hexError}</label>}
      <textarea
        value={txHex}
        onChange={handleChange}
        placeholder="Enter encoded transaction hex..."
        style={{ border: hexError ? '1px solid red' : 'none' }}
      />
    </div>
  );
}
