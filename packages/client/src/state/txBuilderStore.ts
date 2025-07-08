import { TxInputFormData } from '@/views/txBuilderView/txInputForm/TxInputForm';
import { create } from 'zustand';

export interface TxBuilderState {
  formData: Map<string, TxInputFormData>;
  setFormData: (inputs: Map<string, TxInputFormData>) => void;
}

export const useTxBuilderStore = create<TxBuilderState>((set) => ({
  formData: new Map(),
  setFormData: (inputs: Map<string, TxInputFormData>) => set({ formData: inputs }),
}));
