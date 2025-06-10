import './text-editor.css';
import AceEditor from 'react-ace';

// Import the required theme and mode
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';
import { TxViewState } from '../TxView';
import { validateFormattedTx } from './validation';
import Tx from '@/crypto/transaction/Tx';

type TEProps = {
  txViewState: TxViewState;
  setTxViewState: (txViewState: TxViewState) => void;
};

export default function TextEditor({ txViewState, setTxViewState }: TEProps) {
  const { jsonError } = txViewState;

  const handleChange = (value: string) => {
    try {
      const obj = JSON.parse(value);

      if (validateFormattedTx(obj)) {
        const tx = Tx.fromJson(obj);

        setTxViewState({ ...txViewState, txJson: value, jsonError: null, txHex: tx.toHex(), hexError: null });
      }
    } catch (error) {
      setTxViewState({ ...txViewState, txJson: value, jsonError: error instanceof Error ? error.message : 'Invalid JSON' });
    }
  };

  return (
    <div className="flex-column text-editor-container">
      <div className="flex-row header-panel">Header Panel{jsonError && <div className="error-message">{jsonError}</div>}</div>

      <AceEditor
        mode="json"
        theme="twilight"
        value={txViewState.txJson}
        height="100%"
        width="100%"
        onChange={handleChange}
        setOptions={{
          showPrintMargin: false,
          showGutter: true,
          highlightActiveLine: true,
        }}
        style={{ border: jsonError ? 'red solid 1px' : 'none' }}
      />
    </div>
  );
}
