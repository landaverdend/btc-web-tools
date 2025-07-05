import { ExecutionContext } from '@/btclib/script/execution/executionContext';
import { ScriptExecutionStatus } from '@/btclib/script/execution/scriptExecutionEngine';
import { Script } from '@/btclib/script/Script';
import { create } from 'zustand';

interface ExecutionState {
  executionContext: ExecutionContext;
  updateFromEngine: (ctx: ExecutionContext) => void;
  executionStatus: ScriptExecutionStatus;
  setExecutionStatus: (status: ScriptExecutionStatus) => void;
}

export const useExecutionStore = create<ExecutionState>((set) => ({
  executionContext: {
    script: new Script(),
    stack: [],
    altStack: [],
    redeemStack: [],
    programCounter: 0,
    jumpTable: {},
  },
  executionStatus: 'Not Started',
  updateFromEngine: (ctx: ExecutionContext) => {
    set({ executionContext: ctx });
  },
  setExecutionStatus: (status: ScriptExecutionStatus) => {
    set({ executionStatus: status });
  },
}));
