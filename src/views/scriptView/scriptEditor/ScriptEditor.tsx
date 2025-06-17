import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';
import { useRef, useState } from 'react';
import { ScriptMode } from '../ace-modes/ScriptMode';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import './script-editor.css';
import { Range } from 'ace-builds';
import { initialTemplate, useDebugStore } from '@/state/debugStore';
import { compileScript } from '@/crypto/script/scriptCompiler';

const SCRIPT_MODE = new ScriptMode();

interface ScriptEditorProps {}
export function ScriptEditor({}: ScriptEditorProps) {
  const { setScript } = useDebugStore();

  const [userText, setUserText] = useState<string>(initialTemplate);

  const [compileError, setCompileError] = useState<string | null>(null);

  const editorRef = useRef<AceEditor>(null);

  const handleChange = (value: string) => {
    try {
      const script = compileScript(value);
      setScript(script);
      setCompileError(null);
    } catch (error) {
      console.error(error);
      setCompileError(error instanceof Error ? error.message : 'Unknown error');
    }

    setUserText(value);
  };

  // TODO: Highlight current command in editor.
  const highlightLine = (lineNumber: number) => {
    if (!editorRef.current) return;

    const editor = editorRef.current.editor;
    const session = editor.getSession();

    editor.session.addMarker(new Range(0, 0, 1, 5), 'debug-active', 'fullLine');
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
        value={userText}
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
