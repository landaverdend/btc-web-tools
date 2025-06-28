import { TxMetadata } from '@/api/api';
import Tx from '@/crypto/transaction/Tx';
import { Script } from '../Script';

export interface JumpTable {
  [pc: number]: { target: number; type: 'conditional' | 'unconditional' };
}

export type ExecutionContext = {
  script: Script;

  stack: Uint8Array[];
  altStack: Uint8Array[];
  redeemStack: Uint8Array[];
  programCounter: number;

  jumpTable: JumpTable;

  txContext?: TxContext; // not all scripts need a transaction binding them...
  error?: string;
};

export type TxContext = {
  tx: Tx;
  txMetadata: TxMetadata;
  selectedInputIndex: number;
};
