import { Script } from '@/crypto/script/Script';
import { compileScript } from '@/crypto/script/scriptCompiler';
import Tx from '@/crypto/transaction/Tx';
import { create } from 'zustand/react';

const initialTemplate = 'OP_0\nOP_NOTIF\nOP_2\nOP_ELSE\nOP_3\nOP_ENDIF';

export type ScriptDebuggerResult = 'Success' | 'Failure' | 'Running' | 'Not Started';

// Data on the current branching path (if-else)
export type ConditionFrame = {
  elseIndex?: number; // index of the OP_ELSE instruction.
  endIndex: number; // index of the OP_ENDIF instruction.
};

interface DebugState {
  script: Script;
  setScript: (script: Script) => void;

  scriptAsm: string;
  setScriptAsm: (scriptAsm: string) => void;

  tx?: Tx;
  setTx: (tx: Tx) => void;

  prevScriptPubkey?: string; // hex string of the previous script pubkey.
  setPrevScriptPubkey: (prevScriptPubkey: string) => void;

  selectedInput?: number;
  setSelectedInput: (input: number) => void;

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

  getCurrentCmd: () => number | Uint8Array;
}

export const useDebugStore = create<DebugState>((set, get) => ({
  script: compileScript(initialTemplate),
  setScript: (script: Script) => set({ script }),

  tx: undefined,
  setTx: (tx: Tx) => set({ tx }),

  selectedInput: undefined,
  setSelectedInput: (input: number) => set({ selectedInput: input }),

  prevScriptPubkey: undefined,
  setPrevScriptPubkey: (prevScriptPubkey: string) => set({ prevScriptPubkey }),

  stack: [],
  setStack: (stack: Uint8Array[]) => set({ stack }),

  altStack: [],
  setAltStack: (altStack: Uint8Array[]) => set({ altStack }),

  programCounter: 0,
  setProgramCounter: (currentCmd: number) => set({ programCounter: currentCmd }),

  // User inputted script
  scriptAsm: initialTemplate,
  setScriptAsm: (scriptAsm: string) => set({ scriptAsm }),

  conditionFrames: [],
  setConditionFrames: (conditionFrames: ConditionFrame[]) => set({ conditionFrames }),
  pushConditionFrame: (conditionFrame: ConditionFrame) => set({ conditionFrames: [...get().conditionFrames, conditionFrame] }),

  status: 'Not Started',
  setStatus: (status: ScriptDebuggerResult) => set({ status }),

  getCurrentCmd: () => get().script.getCmd(get().programCounter),

  reset: () => set({ programCounter: 0, stack: [], altStack: [], status: 'Not Started', conditionFrames: [] }),
}));
