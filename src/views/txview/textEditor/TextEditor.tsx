import './text-editor.css';
import AceEditor from 'react-ace';

// Import the required theme and mode
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';
import { validateFormattedTx } from './validation';
import Tx from '@/crypto/transaction/Tx';
import { useEffect, useRef, useState } from 'react';
import 'ace-builds/src-min-noconflict/ext-searchbox';

type TEProps = {
  tx: Tx;
  setTx: (tx: Tx) => void;
};

export default function TextEditor({ tx, setTx }: TEProps) {
  const [txJson, setTxJson] = useState<string>(JSON.stringify(tx.format(), null, 2));
  const [jsonError, setJsonError] = useState<string | null>(null);

  const isInternalUpdate = useRef(false);

  useEffect(() => {
    // Only update if the change came from outside this component
    if (!isInternalUpdate.current) {
      setTxJson(JSON.stringify(tx.format(), null, 2));
    }
    // Reset the flag after the update
    isInternalUpdate.current = false;
  }, [tx]);

  const handleChange = (value: string) => {
    setTxJson(value);
    try {
      const obj = JSON.parse(value);
      if (validateFormattedTx(obj)) {
        isInternalUpdate.current = true;
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
      <div className="flex-row header-panel">Parsed JSON{jsonError && <div className="error-message">{jsonError}</div>}</div>

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
          enableSearch: true,
        }}
        style={{ border: jsonError ? 'red solid 1px' : 'none' }}
      />
    </div>
  );
}
