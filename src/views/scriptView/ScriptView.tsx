import { ScriptEditor } from './scriptEditor/ScriptEditor';

import './script-view.css';
import { useDebugStore } from '@/state/debugStore';

export default function ScriptView() {
  const { getCurrentCmd, step, reset } = useDebugStore();

  return (
    <div>
      <div>
        <div className="flex-column">
          <h1>Debug Controls (WIP)</h1> <span>{getCurrentCmd()}</span>
        </div>

        <div className="flex-row">
          <button
            onClick={() => {
              step();
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

        <div className="flex-column" style={{ flex: 1 }}>
          Stack Placeholder
        </div>
      </div>
    </div>
  );
}
