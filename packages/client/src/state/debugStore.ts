import { Script } from '@/crypto/script/Script';
import { compileScript } from '@/crypto/script/scriptCompiler';
import { create } from 'zustand/react';

export const initialTemplate = 'OP_0\nOP_NOTIF\nOP_2\nOP_ELSE\nOP_3\nOP_ENDIF';

export type ScriptDebuggerResult = 'Success' | 'Failure' | 'Running' | 'Not Started';

// Data on the current branching path (if-else)
export type ConditionFrame = {
  elseIndex?: number; // index of the OP_ELSE instruction.
  endIndex: number; // index of the OP_ENDIF instruction.
};

interface DebugState {
  script: Script;
  scriptAsm: string;

  stack: Uint8Array[];
  altStack: Uint8Array[];

  status: ScriptDebuggerResult;

  programCounter: number;
  conditionFrames: ConditionFrame[];

  setScript: (script: Script) => void;
  setScriptAsm: (scriptAsm: string) => void;
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
  scriptAsm: initialTemplate,

  conditionFrames: [],
  status: 'Not Started',

  setScriptAsm: (scriptAsm: string) => set({ scriptAsm }),
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
