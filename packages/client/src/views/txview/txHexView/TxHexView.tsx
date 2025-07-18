import './tx-hex-view.css';
import { PlacesType, Tooltip } from 'react-tooltip';
import { createPortal } from 'react-dom';
import { TxInLE, TxOutLE, WitnessDataLE } from '@/types/tx';
import { useTxStore } from '@/state/txStore';
import { Flex } from 'antd';

const COLORS = {
  version: 'var(--soft-purple)',
  varInts: 'var(--soft-green)',
  witnessMarker: '#38bdf8',
  witnessFlag: '#38bdf8',
  inputs: '#d4d4d8',
  outputs: 'var(--soft-orange)',
  witnesses: 'var(--soft-red)',
  locktime: 'var(--sky-blue)',
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

type TXHVProps = {};
export default function TxHexView({}: TXHVProps) {
  const { tx } = useTxStore();

  const txLE = tx?.formatLE() ?? undefined;

  // Only build the tx if we don't have an active error on that string
  return (
    <Flex vertical id="test" className="tx-hex-view-container" align="center">
      <div className="flex-row header-panel">Byte Encoding</div>

      <p className="tx-bytes">
        {txLE && (
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
            <InputBytes inputs={txLE.inputs} />

            <Bytefield bytes={txLE.outputCount} color={COLORS.varInts} toolTips={[{ content: 'Output Count', place: 'top' }]} />
            <OutputBytes outputs={txLE.outputs} />

            <WitnessBytes witnesses={txLE.witnesses} />
            <Bytefield bytes={txLE.locktime} color={COLORS.locktime} toolTips={[{ content: 'Transaction Locktime' }]} />
          </>
        )}
      </p>
    </Flex>
  );
}

function InputBytes({ inputs }: { inputs: TxInLE[] }) {
  return (
    <>
      {inputs.map(({ txid, vout, scriptSig, sequence }, i) => {
        const txnum = { content: `Input ${i}` };
        return (
          <>
            <Bytefield
              key={txid}
              bytes={txid}
              color={COLORS.inputs}
              toolTips={[txnum, { content: 'Transaction ID', place: 'top' }]}
            />
            <Bytefield
              key={vout}
              bytes={vout}
              color={COLORS.inputs}
              toolTips={[txnum, { content: 'Previous Output Index', place: 'top' }]}
            />
            <Bytefield
              bytes={scriptSig.length}
              color={COLORS.inputs}
              toolTips={[txnum, { content: 'Script Signature Length', place: 'top' }]}
            />
            <Bytefield
              key={scriptSig.cmds}
              bytes={scriptSig.cmds}
              color={COLORS.inputs}
              toolTips={[txnum, { content: 'Script Signature', place: 'top' }]}
            />
            <Bytefield
              key={sequence}
              bytes={sequence}
              color={COLORS.inputs}
              toolTips={[txnum, { content: 'Sequence Number', place: 'top' }]}
            />
          </>
        );
      })}
    </>
  );
}

function OutputBytes({ outputs }: { outputs: TxOutLE[] }) {
  return (
    <>
      {outputs.map(({ amount, scriptPubkey }, i) => (
        <>
          <Bytefield
            key={amount}
            bytes={amount}
            color={COLORS.outputs}
            toolTips={[
              { content: `Output: ${i}`, place: 'top' },
              { content: `Amount`, place: 'bottom' },
            ]}
          />
          <Bytefield
            key={scriptPubkey.length}
            bytes={scriptPubkey.length}
            color={COLORS.outputs}
            toolTips={[
              { content: `Output ${i}`, place: 'top' },
              { content: `Script Pubkey Length`, place: 'bottom' },
            ]}
          />
          <Bytefield
            key={scriptPubkey.cmds}
            bytes={scriptPubkey.cmds}
            color={COLORS.outputs}
            toolTips={[
              { content: `Output ${i}`, place: 'top' },
              { content: `Script Pubkey`, place: 'bottom' },
            ]}
          />
        </>
      ))}
    </>
  );
}

function WitnessBytes({ witnesses }: { witnesses?: WitnessDataLE[] }) {
  return (
    <>
      {witnesses && (
        <>
          {witnesses.map((witness, i) => {
            const witnessNum = { content: `Witness ${i}` };

            return (
              <>
                <Bytefield
                  bytes={witness.stackLength}
                  color={COLORS.witnesses}
                  toolTips={[witnessNum, { content: 'Witness Total Stack Size', place: 'top' }]}
                />
                {witness.stack.map((item, j) => {
                  return (
                    <>
                      <Bytefield
                        bytes={item.itemLength}
                        color={COLORS.witnesses}
                        toolTips={[witnessNum, { content: `Witness Stack Item #${j} Length`, place: 'top' }]}
                      />
                      <Bytefield
                        bytes={item.item}
                        color={COLORS.witnesses}
                        toolTips={[witnessNum, { content: `Witness Stack Item #${j}`, place: 'top' }]}
                      />
                    </>
                  );
                })}
              </>
            );
          })}
        </>
      )}
    </>
  );
}
