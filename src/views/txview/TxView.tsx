import TextEditor from './textEditor/TextEditor';
import TxHexView from './txHexView/TxHexView';

import './txview.css';

export default function TxView() {
  return (
    <div className="txview-container">
      <TextEditor />
      <TxHexView />
    </div>
  );
}
