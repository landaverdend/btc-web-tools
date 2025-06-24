import Tx from '@/crypto/transaction/Tx';
import { create } from 'zustand';

interface TxState {
  tx?: Tx;
  setTx: (tx: Tx) => void;

  selectedInput?: number;
  setSelectedInput: (input: number) => void;

  prevScriptPubkey?: string;
  setPrevScriptPubkey: (prevScriptPubkey: string) => void;

  reset: () => void;
}

export const useTxStore = create<TxState>((set) => ({
  tx: undefined,
  setTx: (tx: Tx) => set({ tx }),

  selectedInput: undefined,
  setSelectedInput: (input: number) => set({ selectedInput: input }),

  prevScriptPubkey: undefined,
  setPrevScriptPubkey: (prevScriptPubkey: string) => set({ prevScriptPubkey }),

  reset: () => set({ tx: undefined, selectedInput: undefined, prevScriptPubkey: undefined }),
}));
