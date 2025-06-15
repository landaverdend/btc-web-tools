import { Script } from '@/crypto/script/Script';
import { create } from 'zustand/react';

interface DebugState {
  script: Script;
  stack: Uint8Array[];
  altStack: Uint8Array[];

  currentCmd: number;

  setScript: (script: Script) => void;
  setStack: (stack: Uint8Array[]) => void;
  setAltStack: (altStack: Uint8Array[]) => void;
  setCurrentCmd: (currentCmd: number) => void;

  reset: () => void;

  getCurrentCmd: () => number | Uint8Array;
}

export const useDebugStore = create<DebugState>((set, get) => ({
  script: new Script(),
  stack: [],
  altStack: [],
  currentCmd: 0,

  setScript: (script: Script) => set({ script }),
  setStack: (stack: Uint8Array[]) => set({ stack }),
  setAltStack: (altStack: Uint8Array[]) => set({ altStack }),

  setCurrentCmd: (currentCmd: number) => set({ currentCmd }),
  getCurrentCmd: () => get().script.getCmd(get().currentCmd),

  reset: () => set({ currentCmd: 0, stack: [], altStack: [] }),
}));
