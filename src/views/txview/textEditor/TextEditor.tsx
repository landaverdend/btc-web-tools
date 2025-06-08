import Tx from '@/crypto/transaction/Tx';
import './text-editor.css';
import AceEditor from 'react-ace';

// Import the required theme and mode
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';

type TEProps = {
  tx: Tx;
};

export default function TextEditor({ tx }: TEProps) {
  return (
    <div className="flex-column text-editor-container">
      <div className="flex-row header-panel">Header Panel</div>

      <AceEditor
        mode="json"
        theme="twilight"
        value={JSON.stringify(tx, null, 2)}
        height="100%"
        width="100%"
        setOptions={{
          showPrintMargin: false,
          showGutter: true,
          highlightActiveLine: true,
        }}
      />
    </div>
  );
}
