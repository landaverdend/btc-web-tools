import { TxMetadata } from '@/api/api';
import Tx from '@/crypto/transaction/Tx';
import { create } from 'zustand';

export interface TxState {
  txMetadata?: TxMetadata;
  setTxMetadata: (txMetadata: TxMetadata) => void;

  tx?: Tx;
  setTx: (tx: Tx) => void;

  selectedInput: number;
  setSelectedInput: (input: number) => void;

  reset: () => void;
}

export const useTxStore = create<TxState>((set) => ({
  txMetadata: undefined,
  setTxMetadata: (txMetadata: TxMetadata) => set({ txMetadata }),

  tx: undefined,
  setTx: (tx: Tx) => set({ tx }),

  selectedInput: 0,
  setSelectedInput: (input: number) => set({ selectedInput: input }),

  reset: () => set({ tx: undefined, selectedInput: undefined, txMetadata: undefined }),
}));
