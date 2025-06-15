import { Script } from '@/crypto/script/Script';
import { create } from 'zustand/react';

interface DebugState {
  script: Script;
  stack: string[];
  altStack: string[];

  currentCmd: number;

  setScript: (script: Script) => void;
  setStack: (stack: string[]) => void;
  setAltStack: (altStack: string[]) => void;
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
  setStack: (stack: string[]) => set({ stack }),
  setAltStack: (altStack: string[]) => set({ altStack }),

  setCurrentCmd: (currentCmd: number) => set({ currentCmd }),
  getCurrentCmd: () => get().script.getCmd(get().currentCmd),

  reset: () => set({ currentCmd: 0, stack: [], altStack: [] }),
}));
