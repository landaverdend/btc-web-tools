import { TxFormData } from '@/views/txBuilderView/txInputForm/TxInputForm';
import { create } from 'zustand';

export interface TxBuilderState {
  formData: Map<string, TxFormData>; // txid => {utxo, outputs}
  setFormData: (inputs: Map<string, TxFormData>) => void;
}

export const useTxBuilderStore = create<TxBuilderState>((set) => ({
  formData: new Map(),
  setFormData: (inputs: Map<string, TxFormData>) => set({ formData: inputs }),
}));
