import { ExecutionContext } from '@/crypto/script/execution/ExecutionContext';
import { ScriptExecutionStatus } from '@/crypto/script/execution/scriptExecutionEngine';
import { Script } from '@/crypto/script/Script';
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
    conditionFrames: [],
  },
  executionStatus: 'Not Started',
  updateFromEngine: (ctx: ExecutionContext) => {
    set({ executionContext: ctx });
  },
  setExecutionStatus: (status: ScriptExecutionStatus) => {
    set({ executionStatus: status });
  },
}));
