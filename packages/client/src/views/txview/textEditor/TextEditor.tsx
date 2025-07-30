import './text-editor.css';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import { useTxStore } from '@/state/txStore';
export default function TextEditor() {
  const { txMetadata } = useTxStore();

  return (
    <div className="flex flex-col sm:w-auto">
      <div className="flex flex-row items-center justify-center relative text-white bg-(--header-gray)">Parsed JSON</div>
      <AceEditor
        mode="json"
        theme="twilight"
        value={txMetadata ? JSON.stringify(txMetadata, null, 2) : ''}
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
