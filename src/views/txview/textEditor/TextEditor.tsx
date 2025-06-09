import Tx from '@/crypto/transaction/Tx';
import './text-editor.css';
import AceEditor from 'react-ace';

// Import the required theme and mode
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';

type TEProps = {
  tx: Tx;
  setTx: (tx: Tx) => void;
};

export default function TextEditor({ tx }: TEProps) {
  console.log(tx);
  const handleChange = (value: string) => {
    try {
      const obj = JSON.parse(value);
      console.log(obj);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-column text-editor-container">
      <div className="flex-row header-panel">Header Panel</div>
      <AceEditor
        mode="json"
        theme="twilight"
        value={JSON.stringify(tx.format(), null, 2)}
        height="100%"
        width="100%"
        onChange={handleChange}
        setOptions={{
          showPrintMargin: false,
          showGutter: true,
          highlightActiveLine: true,
        }}
      />
    </div>
  );
}
