import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';
import { useState } from 'react';
import { ScriptMode } from '../ace-modes/ScriptMode';

const SCRIPT_MODE = new ScriptMode();

export function ScriptEditor() {
  const [script, setScript] = useState<string>('');

  const handleChange = (value: string) => {
    setScript(value);
  };

  return (
    <div>
      <AceEditor
        mode={SCRIPT_MODE}
        theme="twilight"
        value={script}
        height="500px"
        width="500px"
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
