import Tx from '@/crypto/transaction/Tx';
import './tx-hex-view.css';

type TXHVProps = {
  tx: Tx;
};

export default function TxHexView({ tx }: TXHVProps) {
  const transformed = tx.format();

  console.log(transformed);

  return (
    <div className="flex-column tx-hex-view-container">
      <p>
        <span style={{ color: 'red' }}>{transformed.version}</span>
        {/* <span style={{ color: 'blue' }}>{transformed.inputs}</span> */}
        {/* <span style={{ color: 'green' }}>{transformed.outputs}</span> */}
        <span style={{ color: 'purple' }}>{transformed.locktime}</span>
      </p>
    </div>
  );
}
