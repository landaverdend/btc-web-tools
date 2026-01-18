import { TxMetadata } from '@/api/api';
import Tx from '@/btclib/transaction/Tx';
import { create } from 'zustand';
import * as bitcoin from 'bitcoinjs-lib';
export interface TxState {


  txMetadata?: TxMetadata;
  setTxMetadata: (txMetadata: TxMetadata) => void;

  transaction?: bitcoin.Transaction;
  setTransaction: (transaction: bitcoin.Transaction) => void;

  parents?: Record<string, bitcoin.Transaction>;
  setParents: (parents: Record<string, bitcoin.Transaction>) => void;

  tx?: Tx;
  setTx: (tx: Tx) => void;

  selectedInput: number;
  setSelectedInput: (input: number) => void;

  reset: () => void;
}

export const useTxStore = create<TxState>((set) => ({
  transaction: undefined,
  setTransaction: (transaction: bitcoin.Transaction) => set({ transaction }),

  parents: undefined,
  setParents: (parents: Record<string, bitcoin.Transaction>) => set({ parents }),


  txMetadata: undefined,
  setTxMetadata: (txMetadata: TxMetadata) => set({ txMetadata }),

  tx: undefined,
  setTx: (tx: Tx) => set({ tx }),

  selectedInput: 0,
  setSelectedInput: (input: number) => set({ selectedInput: input }),

  reset: () => set({ tx: undefined, transaction: undefined, parents: undefined, selectedInput: 0, txMetadata: undefined }),
}));
