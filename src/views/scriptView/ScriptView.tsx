import { ScriptEditor } from './scriptEditor/ScriptEditor';

import './script-view.css';
import { useDebugStore } from '@/state/debugStore';
import { Stack } from './stack/Stack';
import { useScriptDebugger } from '@hooks/useScriptDebugger';
import { bytesToHex } from '@/crypto/util/helper';
import { OP_CODE_NAMES } from '@/crypto/op/op';



function OpCodeWidget() {
  const { getCurrentCmd } = useDebugStore();

  const cmd = getCurrentCmd();

  if (typeof cmd === 'number') {
    return <div>{OP_CODE_NAMES[cmd]}</div>;
  }

  return <div>{bytesToHex(cmd)}</div>;
}

export default function ScriptView() {
  const { reset } = useDebugStore();
  const { step } = useScriptDebugger();

  return (
    <div>
      <div>
        <div className="flex-column">
          <h1>Debug Controls (WIP)</h1> <OpCodeWidget />
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

        <Stack />
      </div>
    </div>
  );
}
