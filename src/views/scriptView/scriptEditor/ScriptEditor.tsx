import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';
import { useEffect, useRef, useState } from 'react';
import { ScriptMode } from '../ace-modes/ScriptMode';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import './script-editor.css';
import { compileScript } from '../scriptCompiler';
import { Range } from 'ace-builds';

const SCRIPT_MODE = new ScriptMode();

export function ScriptEditor() {
  const [script, setScript] = useState<string>('');

  const [compileError, setCompileError] = useState<string | null>(null);
  const [currentLine, setCurrentLine] = useState<number>(0);

  const editorRef = useRef<AceEditor>(null);

  useEffect(() => {
    highlightLine(currentLine);
  }, []);

  const handleChange = (value: string) => {
    try {
      compileScript(value);
      setCompileError(null);
    } catch (error) {
      console.error(error);
      setCompileError(error instanceof Error ? error.message : 'Unknown error');
    }
    setScript(value);
  };

  const highlightLine = (lineNumber: number) => {
    if (!editorRef.current) return;

    const editor = editorRef.current.editor;
    const session = editor.getSession();
    
    editor.session.addMarker(new Range(0, 0, 1, 5), 'debug-active', 'fullLine');

    setCurrentLine(lineNumber);

    console.log(session.getMarkers());
  };

  return (
    <div className="flex-column script-editor-container">
      <div className="flex-row header-panel">
        Script Debugger {compileError && <div className="error-message">{compileError}</div>}
      </div>

      <AceEditor
        ref={editorRef}
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
