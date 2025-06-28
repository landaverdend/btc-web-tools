import Tx from '@/crypto/transaction/Tx';
import { Script } from '../Script';
import { TxMetadata } from '@/api/api';
import { OP_CODE_NAMES } from '@/crypto/op/op';
import { bytesToHex } from '@/crypto/util/helper';
import { ExecutionContext, TxContext } from './ExecutionContext';

export type ScriptExecutionStatus = 'Success' | 'Failure' | 'Running' | 'Not Started';

const DEFAULT_CONTEXT: ExecutionContext = {
  script: new Script(),
  stack: [],
  altStack: [],
  redeemStack: [],
  conditionFrames: [],
  programCounter: 0,
};
export class ScriptExecutionEngine {
  context: ExecutionContext;
  executionStatus: ScriptExecutionStatus;

  constructor(script: Script, tx?: Tx, txMetadata?: TxMetadata) {
    let txContext: TxContext | undefined;
    if (tx && txMetadata) {
      txContext = {
        tx: tx,
        txMetadata: txMetadata,
        selectedInputIndex: 0,
      };
    }

    this.executionStatus = 'Not Started';
    this.context = {
      script,
      stack: [],
      altStack: [],
      redeemStack: [],
      programCounter: 0,
      conditionFrames: [],
      txContext,
    };
  }

  updateScript(script: Script) {
    this.context.script = script;
    this.resetStacks();
  }

  updateTx(tx?: Tx, txMetadata?: TxMetadata) {
    if (!tx || !txMetadata) {
      this.context.txContext = undefined;
      this.resetStacks();
      return;
    }

    this.context.txContext = {
      tx,
      txMetadata,
      selectedInputIndex: 0,
    };
    this.resetStacks();
  }

  resetStacks() {
    const { script, txContext } = this.context;

    this.context = {
      script,
      txContext: txContext,
      stack: [],
      altStack: [],
      redeemStack: [],
      programCounter: 0,
      conditionFrames: [],
    };
  }

  step() {
    this.context.programCounter++;

    // Get the command to run.
    const cmd = this.context.script.getCmd(this.context.programCounter);

    this.executionStatus = 'Running';
  }

  getNextArgFormatted() {
    const cmd = this.context.script.getCmd(this.context.programCounter);

    if (typeof cmd === 'number') {
      return OP_CODE_NAMES[cmd];
    }

    return '0x' + bytesToHex(cmd);
  }
}

export const engine = new ScriptExecutionEngine(new Script());
