import { ScriptEditor } from './scriptEditor/ScriptEditor';

import './script-view.css';
import { Stack } from './stack/Stack';

import Stepover from '@assets/icons/stepover.svg?react';
import Play from '@assets/icons/play.svg?react';
import Reset from '@assets/icons/reset.svg?react';
import { useScriptDebugger } from '@/hooks/useScriptDebugger';
import { useDebugStore } from '@/state/debugStore';

export default function ScriptView() {
  const { reset, setStatus } = useDebugStore();
  const { step } = useScriptDebugger();

  return (
    <div>
      {/* <div>
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
      </div> */}
      <div className="flex-row script-view-container">
        <ScriptEditor />
        <div className="flex-column debug-controls-container">
          <h3>Controls</h3>
          <div className="flex-row control-dock">
            <Play onClick={() => {}} height={24} width={24} style={{ fill: 'var(--soft-green)' }} />
            <Stepover
              onClick={() => {
                const status = step();
                setStatus(status);
              }}
              height={20}
              width={20}
              style={{ fill: 'var(--sky-blue)' }}
            />
            <Reset
              onClick={() => {
                reset();
              }}
              height={22}
              width={22}
            />
          </div>
        </div>
        <Stack />
      </div>
    </div>
  );
}
