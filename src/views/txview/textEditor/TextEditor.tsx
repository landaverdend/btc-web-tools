import './text-editor.css';
import AceEditor from 'react-ace';

// Import the required theme and mode
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';
import { validateFormattedTx } from './validation';
import Tx from '@/crypto/transaction/Tx';
import { useState } from 'react';

type TEProps = {
  tx: Tx;
  setTx: (tx: Tx) => void;
};

export default function TextEditor({ tx, setTx }: TEProps) {
  const [txJson, setTxJson] = useState<string>(JSON.stringify(tx.format(), null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const handleChange = (value: string) => {
    setTxJson(value);

    try {
      const obj = JSON.parse(value);
      if (validateFormattedTx(obj)) {
        const tx = Tx.fromJson(obj);
        setTx(tx);

        setJsonError(null);
      }
    } catch (error) {
      setJsonError(error instanceof Error ? error.message : 'JSON Error');
    }
  };

  return (
    <div className="flex-column text-editor-container">
      <div className="flex-row header-panel">Header Panel{jsonError && <div className="error-message">{jsonError}</div>}</div>

      <AceEditor
        mode="json"
        theme="twilight"
        value={txJson}
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
