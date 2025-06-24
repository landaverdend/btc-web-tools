import Tx from '@/crypto/transaction/Tx';
import { create } from 'zustand';

type TxMetadata = {
  txid: string;
  lockType: string;
};

interface TxState {
  txMetadata?: TxMetadata;
  setTxMetadata: (txMetadata: TxMetadata) => void;

  tx?: Tx;
  setTx: (tx: Tx) => void;

  selectedInput?: number;
  setSelectedInput: (input: number) => void;

  prevScriptPubkey?: string;
  setPrevScriptPubkey: (prevScriptPubkey: string) => void;

  reset: () => void;
}

export const useTxStore = create<TxState>((set) => ({
  txMetadata: undefined,
  setTxMetadata: (txMetadata: TxMetadata) => set({ txMetadata }),

  tx: undefined,
  setTx: (tx: Tx) => set({ tx }),

  selectedInput: undefined,
  setSelectedInput: (input: number) => set({ selectedInput: input }),

  prevScriptPubkey: undefined,
  setPrevScriptPubkey: (prevScriptPubkey: string) => set({ prevScriptPubkey }),

  reset: () => set({ tx: undefined, selectedInput: undefined, prevScriptPubkey: undefined }),
}));
