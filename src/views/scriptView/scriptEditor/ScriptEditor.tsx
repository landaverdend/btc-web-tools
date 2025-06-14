import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';
import { useState } from 'react';
import { ScriptMode } from '../ace-modes/ScriptMode';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import './script-editor.css';

const SCRIPT_MODE = new ScriptMode();

export function ScriptEditor() {
  const [script, setScript] = useState<string>('');

  const handleChange = (value: string) => {
    setScript(value);
  };

  return (
    <div className="flex-column script-editor-container">
      <div className="flex-row header-panel">Script Debugger</div>

      <AceEditor
        mode={SCRIPT_MODE}
        theme="twilight"
        value={script}
        height="100%"
        width="100%"
        onChange={handleChange}
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
