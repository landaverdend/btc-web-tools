import './text-editor.css';
import AceEditor from 'react-ace';

// Import the required theme and mode
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';
import { TxViewState } from '../TxView';
import { FormattedTx } from '@/types/tx';
import { validateFormattedTx } from './validation';

type TEProps = {
  txViewState: TxViewState;
  setTxViewState: (txViewState: TxViewState) => void;
};

export default function TextEditor({ txViewState, setTxViewState }: TEProps) {
  const handleChange = (value: string) => {
    try {
      const obj = JSON.parse(value);

      if (validateFormattedTx(obj)) {
        setTxViewState({ ...txViewState, txJson: value, jsonError: false });
      }

    } catch (error) {
      console.error('JSON parse error:', error);
      setTxViewState({ ...txViewState, txJson: value, jsonError: true });
    }
  };

  return (
    <div className="flex-column text-editor-container">
      <div className="flex-row header-panel">Header Panel</div>
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
        style={{ border: txViewState.jsonError ? 'red solid 1px' : 'none' }}
      />
    </div>
  );
}
