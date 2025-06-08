import Tx from '@/crypto/transaction/Tx';
import './tx-hex-view.css';

type TXHVProps = {
  tx: Tx;
};

export default function TxHexView({ tx }: TXHVProps) {
  return (
    <div className="flex-column tx-hex-view-container">
      <p> {tx.toHex()}</p>
    </div>
  );
}
