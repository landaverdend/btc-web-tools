import { ScriptEditor } from './scriptEditor/ScriptEditor';

import './script-view.css';
import { useDebugStore } from '@/state/debugStore';
import { Stack } from './stack/Stack';
import { useScriptDebugger } from '@hooks/useScriptDebugger';

export default function ScriptView() {
  const { reset, setStatus } = useDebugStore();
  const { step } = useScriptDebugger();

  return (
    <div>
      <div>
        <div className="flex-column">
          <h1>Debug Controls (WIP)</h1>
        </div>

        <div className="flex-row">
          <button
            onClick={() => {
              const result = step();
              setStatus(result);
            }}>
            Step
          </button>
          <button onClick={() => {}}>Run</button>
          <button>Pause</button>
          <button
            onClick={() => {
              reset();
            }}>
            Reset
          </button>
        </div>
      </div>
      <div className="flex-row script-view-container">
        <ScriptEditor />

        <Stack />
      </div>
    </div>
  );
}
