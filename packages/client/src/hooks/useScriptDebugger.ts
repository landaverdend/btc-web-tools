import { ScriptExecutionEngine } from '@/crypto/script/execution/scriptExecutionEngine';
import { useExecutionStore } from '@/state/executionStore';
import { useScriptEditorStore } from '@/state/scriptEditorStore';
import { useTxStore } from '@/state/txStore';
import { useEffect } from 'react';

export function useScriptDebugger() {
  const { script } = useScriptEditorStore();
  const { tx, txMetadata, selectedInput } = useTxStore();
  const { updateFromEngine, setExecutionStatus } = useExecutionStore();

  const engine = ScriptExecutionEngine.getInstance();

  // Rebuild the execution engine whenever the script or tx context changes.
  // NOTE: this will be called multiple times since this hook is used in multiple places.
  // TODO: figure out a better way to handle this.
  useEffect(() => {
    ScriptExecutionEngine.updateInstance(script, tx, txMetadata, selectedInput);
    setExecutionStatus(engine.executionStatus);
  }, [script, tx, txMetadata, selectedInput]);

  function getNextArgument() {
    return ScriptExecutionEngine.getInstance().getNextArgFormatted();
  }

  // Send changes out to zustand for component rerendering
  function updateGlobalState() {
    // Update the UI
    updateFromEngine(engine.context);
    setExecutionStatus(engine.executionStatus);
  }

  function step() {
    engine.step();

    updateGlobalState();
  }

  function reset() {
    engine.resetExecutionContext();

    updateGlobalState();
  }

  return {
    step,
    getNextArgument,
    reset,
  };
}
