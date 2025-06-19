import { Script } from '@/crypto/script/Script';
import { compileScript } from '@/crypto/script/scriptCompiler';
import { create } from 'zustand/react';

export const initialTemplate = 'OP_0\n OP_IF\n OP_2\n OP_ELSE OP_3 OP_ENDIF';

export type ScriptDebuggerResult = 'Success' | 'Failure' | 'Running' | 'Not Started';

// Data on the current branching path (if-else)
export type ConditionFrame = {
  elseIndex?: number; // index of the OP_ELSE instruction.
  endIndex: number; // index of the OP_ENDIF instruction.
};

interface DebugState {
  script: Script;
  stack: Uint8Array[];
  altStack: Uint8Array[];

  status: ScriptDebuggerResult;

  programCounter: number;
  conditionFrames: ConditionFrame[];

  setScript: (script: Script) => void;
  setStack: (stack: Uint8Array[]) => void;
  setAltStack: (altStack: Uint8Array[]) => void;
  setProgramCounter: (currentCmd: number) => void;
  setStatus: (status: ScriptDebuggerResult) => void;

  // Track data about the current branching path.
  setConditionFrames: (conditionFrames: ConditionFrame[]) => void;
  pushConditionFrame: (conditionFrame: ConditionFrame) => void;

  reset: () => void;

  getCurrentCmd: () => number | Uint8Array;
}

export const useDebugStore = create<DebugState>((set, get) => ({
  script: compileScript(initialTemplate),
  stack: [],
  altStack: [],
  programCounter: 0,

  conditionFrames: [],
  status: 'Not Started',

  setConditionFrames: (conditionFrames: ConditionFrame[]) => set({ conditionFrames }),
  pushConditionFrame: (conditionFrame: ConditionFrame) => set({ conditionFrames: [...get().conditionFrames, conditionFrame] }),

  setScript: (script: Script) => set({ script }),
  setStack: (stack: Uint8Array[]) => set({ stack }),
  setAltStack: (altStack: Uint8Array[]) => set({ altStack }),
  setStatus: (status: ScriptDebuggerResult) => set({ status }),
  setProgramCounter: (currentCmd: number) => set({ programCounter: currentCmd }),
  getCurrentCmd: () => get().script.getCmd(get().programCounter),

  reset: () => set({ programCounter: 0, stack: [], altStack: [], status: 'Not Started', conditionFrames: [] }),
}));
