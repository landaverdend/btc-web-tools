import Tx from '@/crypto/transaction/Tx';
import './tx-hex-view.css';
import { PlacesType, Tooltip } from 'react-tooltip';

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
export default function TxHexView({ tx }: TXHVProps) {
  const transformed = tx.formatLE();

  return (
    <div className="flex-column tx-hex-view-container">
      <p className="tx-bytes">
        <Bytefield bytes={transformed.version} content={'Transaction Version'} color={'red'} place="top" />
        {transformed.inputs.map(({ prevIndex, prevTx, scriptSig, sequence }) => (
          <>
            <Bytefield key={prevTx} bytes={prevTx} content={'Input: Previous Transaction Hash'} color={'rgb(146 190 222)'} />
            <Bytefield key={prevIndex} bytes={prevIndex} content={'Input: Previous Output Index'} color={'rgb(56 141 209)'} />
            <Bytefield key={scriptSig.cmds} bytes={scriptSig.cmds} content={'Input: Script Signature'} color={'#42A5F5'} />
            <Bytefield key={sequence} bytes={sequence} content={'Input: Sequence Number'} color={'rgb(0 92 174)'} />
          </>
        ))}

        {transformed.outputs.map(({ amount, scriptPubkey }, i) => (
          <>
            <Bytefield key={amount} bytes={amount} content={`Output #${i + 1}: Amount`} color={'rgb(255 152 0)'} />
            <Bytefield
              key={scriptPubkey.cmds}
              bytes={scriptPubkey.cmds}
              content={`Output #${i + 1}: Script Public Key`}
              color={'rgb(255 204 0)'}
            />
          </>
        ))}

        <Bytefield bytes={transformed.locktime} content={'Transaction Locktime'} color="purple" />
      </p>

      <Tooltip anchorSelect=".tooltip" style={{ zIndex: 1001 }} />
    </div>
  );
}
