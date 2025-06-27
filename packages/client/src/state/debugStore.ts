import { create } from 'zustand/react';

export type ScriptDebuggerResult = 'Success' | 'Failure' | 'Running' | 'Not Started';

// Data on the current branching path (if-else)
export type ConditionFrame = {
  elseIndex?: number; // index of the OP_ELSE instruction.
  endIndex: number; // index of the OP_ENDIF instruction.
};

interface DebugState {
  stack: Uint8Array[];
  setStack: (stack: Uint8Array[]) => void;

  altStack: Uint8Array[];
  setAltStack: (altStack: Uint8Array[]) => void;

  status: ScriptDebuggerResult;
  setStatus: (status: ScriptDebuggerResult) => void;

  programCounter: number;
  setProgramCounter: (currentCmd: number) => void;

  // Track data about the current branching path.
  conditionFrames: ConditionFrame[];
  setConditionFrames: (conditionFrames: ConditionFrame[]) => void;
  pushConditionFrame: (conditionFrame: ConditionFrame) => void;

  reset: () => void;
}

export const useDebugStore = create<DebugState>((set, get) => ({
  stack: [],
  setStack: (stack: Uint8Array[]) => set({ stack }),

  altStack: [],
  setAltStack: (altStack: Uint8Array[]) => set({ altStack }),

  programCounter: 0,
  setProgramCounter: (currentCmd: number) => set({ programCounter: currentCmd }),

  conditionFrames: [],
  setConditionFrames: (conditionFrames: ConditionFrame[]) => set({ conditionFrames }),
  pushConditionFrame: (conditionFrame: ConditionFrame) => set({ conditionFrames: [...get().conditionFrames, conditionFrame] }),

  status: 'Not Started',
  setStatus: (status: ScriptDebuggerResult) => set({ status }),

  reset: () =>
    set({
      programCounter: 0,
      stack: [],
      altStack: [],
      status: 'Not Started',
      conditionFrames: [],
    }),
}));
