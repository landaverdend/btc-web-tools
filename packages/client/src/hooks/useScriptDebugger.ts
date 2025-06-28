import { engine } from '@/crypto/script/execution/scriptExecutionEngine';
import { useExecutionStore } from '@/state/executionStore';
import { useScriptEditorStore } from '@/state/scriptEditorStore';
import { useTxStore } from '@/state/txStore';
import { useEffect } from 'react';

export function useScriptDebugger() {
  const { script } = useScriptEditorStore();
  const { tx, txMetadata } = useTxStore();
  const { updateFromEngine, setExecutionStatus } = useExecutionStore();

  // Rebuild the execution engine whenever the script or tx context changes.

  useEffect(() => {
    console.log('useScriptDebugger useEffect', engine.context);
    engine.updateScript(script);
    engine.updateTx(tx, txMetadata);
    updateFromEngine(engine.context);
    setExecutionStatus(engine.executionStatus);
  }, [script, tx, txMetadata]);

  const getNextArgument = () => {
    return engine.getNextArgFormatted();
  };

  function step() {
    engine.step();
    updateFromEngine(engine.context);
    setExecutionStatus(engine.executionStatus);
  }

  function reset() {
    engine.resetExecutionContext();
    updateFromEngine(engine.context);
    setExecutionStatus(engine.executionStatus);
  }

  return {
    step,
    getNextArgument,
    reset,
  };
}
