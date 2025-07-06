import './text-editor.css';
import AceEditor from 'react-ace';

// Import the required theme and mode
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import { useTxStore } from '@/state/txStore';

type TEProps = {};

export default function TextEditor({}: TEProps) {
  const { txMetadata } = useTxStore();

  return (
    <div className="flex-column text-editor-container">
      <div className="flex-row header-panel">Parsed JSON</div>
      <AceEditor
        mode="json"
        theme="twilight"
        value={txMetadata ? JSON.stringify(txMetadata, null, 2) : ''}
        height="100%"
        width="100%"
        onChange={() => {}}
        setOptions={{
          showPrintMargin: false,
          showGutter: true,
          highlightActiveLine: true,
          enableSearch: true,
        }}
      />
    </div>
  );
}
