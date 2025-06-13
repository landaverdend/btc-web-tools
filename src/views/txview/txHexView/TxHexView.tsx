import Tx from '@/crypto/transaction/Tx';
import './tx-hex-view.css';
import { PlacesType, Tooltip } from 'react-tooltip';
import { useState } from 'react';

type TBProps = {
  bytes: string;
  content: string;
  color: string;
  place?: PlacesType;
};
function Bytefield({ bytes, content, color, place }: TBProps) {
  place = place ?? 'left';

  return (
    <a className="tooltip" data-tooltip-content={content} data-tooltip-place={place} style={{ color }}>
      {bytes}
    </a>
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
    <div className="flex-column tx-hex-view-container">
      <p className="tx-bytes">
        {hexError && txHex}
        {/* If TX exists, spit it out.*/}
        {!hexError && (
          <>
            <Bytefield bytes={txLE.version} content={'Transaction Version'} color={'#c084fc'} place="top" />
            {txLE.marker && <Bytefield bytes={txLE.marker} content={'Witness Marker'} color={'#38bdf8'} place="top" />}
            {txLE.flag && <Bytefield bytes={txLE.flag} content={'Witness Flag'} color={'#38bdf8'} place="top" />}
            {txLE.inputs.map(({ txid, vout, scriptSig, sequence }) => (
              <>
                <Bytefield key={txid} bytes={txid} content={'Input: Previous Transaction Hash'} color={'#d4d4d8'} />
                <Bytefield key={vout} bytes={vout} content={'Input: Previous Output Index'} color={'#d4d4d8'} />
                <Bytefield key={scriptSig.cmds} bytes={scriptSig.cmds} content={'Input: Script Signature'} color={'#d4d4d8'} />
                <Bytefield key={sequence} bytes={sequence} content={'Input: Sequence Number'} color={'#d4d4d8'} />
              </>
            ))}

            {txLE.outputs.map(({ amount, scriptPubkey }, i) => (
              <>
                <Bytefield key={amount} bytes={amount} content={`Output #${i + 1}: Amount`} color={'#fb923c'} />
                <Bytefield
                  key={scriptPubkey.cmds}
                  bytes={scriptPubkey.cmds}
                  content={`Output #${i + 1}: Script Public Key`}
                  color={'#fb923c'}
                />
              </>
            ))}
            {txLE.witnesses &&
              txLE.witnesses.map(({ stackLength, stack }) => (
                <>
                  <Bytefield bytes={stackLength} content={'Witness Stack Size'} color={'#ef4444'} />
                  {stack.map((item, i) => (
                    <Bytefield key={item} bytes={item} content={`Witness Stack Item #${i + 1}`} color={'#ef4444'} />
                  ))}
                </>
              ))}
            <Bytefield bytes={txLE.locktime} content={'Transaction Locktime'} color="purple" />
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

      <Tooltip anchorSelect=".tooltip" style={{ zIndex: 1001 }} />
    </div>
  );
}
