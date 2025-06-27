import { OP_CODE_NAMES } from '@/crypto/op/op';
import { ScriptExecutionEngine } from '@/crypto/script/execution/scriptExecutionEngine';
import { bytesToHex } from '@/crypto/util/helper';
import { useDebugStore } from '@/state/debugStore';
import { useScriptEditorStore } from '@/state/scriptEditorStore';
import { useTxStore } from '@/state/txStore';
import { useMemo } from 'react';

export function useScriptDebugger() {
  const { programCounter } = useDebugStore();
  const { script } = useScriptEditorStore();
  const debugStore = useDebugStore();
  const txStore = useTxStore();

  // Rebuild the execution engine whenever the script or tx context changes.
  const executionEngine = useMemo(() => new ScriptExecutionEngine(debugStore, txStore, script), [script]);

  const getNextArgument = () => {
    const cmd = script.getCmd(programCounter);

    if (typeof cmd === 'number') {
      return OP_CODE_NAMES[cmd];
    }

    return '0x' + bytesToHex(cmd);
  };

  function step() {
    executionEngine.updateContext(debugStore, txStore);
    executionEngine.step();
  }

  return {
    step,
    getNextArgument,
  };
}
