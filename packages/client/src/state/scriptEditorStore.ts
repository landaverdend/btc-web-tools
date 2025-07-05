import { Script } from '@/btclib/script/Script';
import { create } from 'zustand';

type CompileError = {
  message: string;
  source: 'asm' | 'hex';
};

interface ScriptEditorState {
  script: Script;
  setScript: (script: Script) => void;

  scriptASM: string;
  setScriptASM: (scriptASM: string) => void;

  scriptHex: string;
  setScriptHex: (scriptHex: string) => void;

  compileError: CompileError | null;
  setCompileError: (compileError: CompileError | null) => void;

  reset: () => void;
}

export const useScriptEditorStore = create<ScriptEditorState>((set, get) => ({
  script: new Script(),
  setScript: (script: Script) => set({ script }),

  scriptASM:
    '// Enter your script here. For hex, use 0x prefix.\n// NOTE: OP_CODES like OP_CHECKSIG and OP_CHECKMULTISIG require a transaction to be fetched. ',
  setScriptASM: (scriptASM: string) => set({ scriptASM }),

  scriptHex: '',
  setScriptHex: (scriptHex: string) => set({ scriptHex }),

  compileError: null,
  setCompileError: (compileError: CompileError | null) => set({ compileError }),

  reset: () => set({ script: new Script(), scriptASM: '', scriptHex: '', compileError: null }),
}));
