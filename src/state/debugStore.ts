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

  step: () => void;
  reset: () => void;

  getCurrentCmd: () => string;
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

  step: () => set((state) => ({ ...state, currentCmd: state.currentCmd + 1 })),
  reset: () => set({ currentCmd: 0, stack: [], altStack: [] }),

}));
