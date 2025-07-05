import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/theme-twilight';
import 'ace-builds/src-noconflict/theme-monokai';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/ext-language_tools';
import * as ace from 'ace-builds/src-noconflict/ace';
import { useCallback, useEffect, useRef, useState } from 'react';
import { ScriptMode } from '../ace-modes/ScriptMode';
import 'ace-builds/src-min-noconflict/ext-searchbox';
import './script-editor.css';
import { Range } from 'ace-builds';
import { compileScript } from '@/btclib/script/scriptCompiler';
import { IAceEditor } from 'react-ace/lib/types';
import { Script } from '@/btclib/script/Script';
import { useScriptEditorStore } from '@/state/scriptEditorStore';
import { useTxStore } from '@/state/txStore';
import { useExecutionStore } from '@/state/executionStore';
import { useScriptDebugger } from '@/hooks/useScriptDebugger';
import { scriptCompleter } from './scriptCompleter';
import BeautifyIcon from '@assets/icons/beautify.svg?react';
import { SvgTooltip } from '../debugControls/DebugControls';

const ASM_SCRIPT_MODE = new ScriptMode();
const PC_MARKER_CLASS = 'debug-program-counter';

interface ScriptEditorProps {}
export function ScriptEditor({}: ScriptEditorProps) {
  // Refs objects
  const editorRef = useRef<AceEditor>(null);
  const pcMarkerRef = useRef<number | null>(null);
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Global State
  const { programCounter } = useExecutionStore().executionContext;
  const { compileError, setScript, scriptASM, setScriptASM, scriptHex, setScriptHex, setCompileError, script } =
    useScriptEditorStore();

  const { tx } = useTxStore();
  const { reset } = useScriptDebugger();
  // Local State
  const [activeTab, setActiveTab] = useState<'asm' | 'hex'>('asm');

  const handleChange = useCallback(
    (value: string) => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Set new timeout for debounced compilation
      debounceTimeoutRef.current = setTimeout(() => {
        /**
         * Try to compile the script.
         *
         * If valid:
         * - update script object
         * - update scriptASM and scriptHex
         * - clear both errors.
         * - reset the debugger state
         *
         * If invalid:
         * - set the error message.
         */
        if (activeTab === 'asm') {
          handleASMChange(value);
        } else {
          handleHexChange(value);
        }
      }, 250);
    },
    [activeTab]
  );

  const handleASMChange = (value: string) => {
    setScriptASM(value);
    try {
      const script = compileScript(value, tx !== undefined);
      setScript(script);
      setScriptHex(script.cmds.length > 0 ? script.toHex(false, false) : '');

      reset();
      setCompileError(null);
    } catch (error) {
      setCompileError({ message: error instanceof Error ? error.message : 'Unknown Error', source: 'asm' });
    }
  };

  const handleHexChange = (value: string) => {
    setScriptHex(value);

    try {
      const script = Script.fromHex(value, true);
      setScript(script);
      setScriptASM(script.toString());

      reset();
      setCompileError(null);
    } catch (error) {
      setCompileError({ message: error instanceof Error ? error.message : 'Unknown Error', source: 'hex' });
    }
  };

  // Program counter changes or new script is added. Clear the previous
  useEffect(() => {
    if (editorRef.current === null) return;

    const editor = editorRef.current.editor;
    clearPCMarker(editor);

    if (activeTab !== 'hex' && compileError === null) {
      highlightCurrentToken(editor);
    }
  }, [programCounter, script, activeTab, scriptASM]);

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

  const beautifyASM = () => {
    const lines = scriptASM.split('\n');
    const beautifiedLines = lines.flatMap((line) => {
      // Find if there's a comment in the line
      const commentIndex = line.indexOf('//');

      if (commentIndex === -1) {
        // No comment - just handle code tokens
        const tokens = line.split(/\s+/).filter((token) => token.trim().length > 0);
        return tokens.length ? [tokens.join('\n')] : [];
      } else {
        // Split into code and comment
        const code = line.substring(0, commentIndex).trim();
        const comment = line.substring(commentIndex).trim();

        const codeTokens = code.split(/\s+/).filter((token) => token.trim().length > 0);

        // Return code tokens (if any) followed by comment on its own line
        return [...(codeTokens.length ? [codeTokens.join('\n')] : []), comment];
      }
    });

    setScriptASM(beautifiedLines.join('\n'));
  };

  const clearPCMarker = (editor: IAceEditor) => {
    if (pcMarkerRef.current) {
      editor.session.removeMarker(pcMarkerRef.current);
      pcMarkerRef.current = null;
    }
  };

  const setupEditorCommands = (editor: IAceEditor) => {
    editor.commands.addCommand({
      name: 'beautifyASM',
      bindKey: { win: 'Alt-Shift-F', mac: 'Alt-Shift-F' },
      exec: beautifyASM,
      readOnly: false,
    });
  };

  useEffect(() => {
    if (editorRef.current) {
      const editor = editorRef.current.editor;
      const langTools = ace.require('ace/ext/language_tools');
      langTools.setCompleters([scriptCompleter]);
      setupEditorCommands(editor);
    }
  }, []);

  return (
    <div className="flex-column script-editor-container">
      <div className="flex-row script-debugger-header">
        <div className="script-tabs">
          <span className={`script-tab ${activeTab === 'asm' ? 'active-tab' : ''}`} onClick={() => setActiveTab('asm')}>
            ASM
          </span>
          <span className={`script-tab ${activeTab === 'hex' ? 'active-tab' : ''}`} onClick={() => setActiveTab('hex')}>
            HEX
          </span>
        </div>

        {compileError && <div className="error-message">{compileError.message}</div>}
        <SvgTooltip tooltipContent="Format ASM: Alt+Shift+F">
          <BeautifyIcon height={24} width={24} className="beautify-icon" onClick={beautifyASM} />
        </SvgTooltip>
      </div>

      <AceEditor
        ref={editorRef}
        mode={ASM_SCRIPT_MODE}
        theme="twilight"
        value={activeTab === 'asm' ? scriptASM : scriptHex}
        height="100%"
        width="100%"
        onChange={handleChange}
        setOptions={{
          showPrintMargin: false,
          showGutter: true,
          highlightActiveLine: true,
          enableSearch: true,
          enableBasicAutocompletion: true,
          enableLiveAutocompletion: true,
          enableSnippets: true,
        }}
      />
    </div>
  );
}
