import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';
import { useEffect, useRef, useState } from 'react';
import { ScriptMode } from '../ace-modes/ScriptMode';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import './script-editor.css';
import { Range } from 'ace-builds';
import { initialTemplate, useDebugStore } from '@/state/debugStore';
import { compileScript } from '@/crypto/script/scriptCompiler';
import { IAceEditor } from 'react-ace/lib/types';

const SCRIPT_MODE = new ScriptMode();
const PC_MARKER_CLASS = 'debug-program-counter';

interface ScriptEditorProps {}
export function ScriptEditor({}: ScriptEditorProps) {
  const editorRef = useRef<AceEditor>(null);
  const pcMarkerRef = useRef<number | null>(null);

  const { reset, setScript, programCounter, script } = useDebugStore();

  const [userText, setUserText] = useState<string>(initialTemplate);
  const [compileError, setCompileError] = useState<string | null>(null);

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current.editor;
      clearPCMarker(editor);
      highlightCurrentToken(editor);
    }
  }, [programCounter, script]);

  const handleChange = (value: string) => {
    try {
      const script = compileScript(value);
      // If there are no compile errors, reset the debugger
      setScript(script);
      setCompileError(null);
      reset();
    } catch (error) {
      console.error(error);
      setCompileError(error instanceof Error ? error.message : 'Unknown error');
    }

    setUserText(value);
  };

  // This is so dumb, but it works.
  const highlightCurrentToken = (editor: IAceEditor) => {
    const session = editor.session;

    let instruction = 0;

    for (let row = 0; row < session.getLength(); row++) {
      const tokens = session.getTokens(row);
      let colIndex = 0;

      for (let token = 0; token < tokens.length; token++) {
        let aceToken = tokens[token];
        if (aceToken.type === 'keyword' || aceToken.type === 'constant.numeric') {
          if (instruction === programCounter) {
            pcMarkerRef.current = editor.session.addMarker(
              new Range(row, colIndex, row, colIndex + aceToken.value.length),
              PC_MARKER_CLASS,
              'text'
            );
            return;
          }

          instruction++;
        }

        colIndex += tokens[token].value.length;
      }
    }
  };

  const clearPCMarker = (editor: IAceEditor) => {
    if (pcMarkerRef.current) {
      editor.session.removeMarker(pcMarkerRef.current);
      pcMarkerRef.current = null;
    }
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
