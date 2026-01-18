import './text-editor.css';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import { useTxStore } from '@/state/txStore';
import { useMemo } from 'react';

export default function TextEditor() {
  const { tx } = useTxStore();

  const txJson = useMemo(() => {
    if (!tx) return '';
    return tx.formatLE();
  }, [tx])

  return (
    <div className="flex flex-1 flex-col sm:w-auto">
      <div className="flex flex-row items-center justify-center text-white bg-(--header-gray)">Parsed JSON</div>
      <AceEditor
        mode="json"
        theme="twilight"
        value={JSON.stringify(txJson, null, 2)}
        onChange={() => { }}
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
