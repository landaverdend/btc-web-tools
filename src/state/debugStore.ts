import { Script } from '@/crypto/script/Script';
import { compileScript } from '@/crypto/script/scriptCompiler';
import { create } from 'zustand/react';

export const initialTemplate = 'OP_0 OP_IF OP_2 OP_ELSE OP_3 OP_ENDIF';

export type ScriptDebuggerResult = 'Success' | 'Failure' | 'Running' | 'Not Started';

interface DebugState {
  script: Script;
  stack: Uint8Array[];
  altStack: Uint8Array[];

  status: ScriptDebuggerResult;

  currentCmd: number;

  setScript: (script: Script) => void;
  setStack: (stack: Uint8Array[]) => void;
  setAltStack: (altStack: Uint8Array[]) => void;
  setCurrentCmd: (currentCmd: number) => void;
  setStatus: (status: ScriptDebuggerResult) => void;

  reset: () => void;

  getCurrentCmd: () => number | Uint8Array;
}

export const useDebugStore = create<DebugState>((set, get) => ({
  script: compileScript(initialTemplate),
  stack: [],
  altStack: [],
  currentCmd: 0,

  status: 'Not Started',

  setScript: (script: Script) => set({ script }),
  setStack: (stack: Uint8Array[]) => set({ stack }),
  setAltStack: (altStack: Uint8Array[]) => set({ altStack }),
  setStatus: (status: ScriptDebuggerResult) => set({ status }),
  setCurrentCmd: (currentCmd: number) => set({ currentCmd }),
  getCurrentCmd: () => get().script.getCmd(get().currentCmd),

  reset: () => set({ currentCmd: 0, stack: [], altStack: [], status: 'Not Started' }),
}));
