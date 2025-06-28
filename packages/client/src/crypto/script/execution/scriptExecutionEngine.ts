import Tx from '@/crypto/transaction/Tx';
import { Script } from '../Script';
import { TxMetadata } from '@/api/api';
import { decodeNumber, OP_CODE_NAMES, OP_CODES } from '@/crypto/op/op';
import { bytesToHex } from '@/crypto/util/helper';
import { ExecutionContext, JumpTable, TxContext } from './ExecutionContext';
import { StandardStepStrategy } from './strategy/standardStepStrategy';

export type ScriptExecutionStatus = 'Success' | 'Failure' | 'Running' | 'Not Started';

type ControlFrame = {
  type: 'conditional' | 'unconditional';
  index: number;
};
export interface StepStrategy {
  step(executionContext: ExecutionContext): boolean;
}

export class ScriptExecutionEngine {
  context: ExecutionContext;
  executionStatus: ScriptExecutionStatus;
  stepStrategy: StepStrategy;

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
      jumpTable: this.constructJumpTable(script),
      txContext,
    };

    // temporary
    this.stepStrategy = new StandardStepStrategy();
  }

  updateScript(script: Script) {
    this.context.script = script;
    this.resetExecutionContext();
  }

  updateTx(tx?: Tx, txMetadata?: TxMetadata) {
    if (!tx || !txMetadata) {
      this.context.txContext = undefined;
      this.resetExecutionContext();
      return;
    }

    this.context.txContext = {
      tx,
      txMetadata,
      selectedInputIndex: 0,
    };
    this.resetExecutionContext();
  }

  resetExecutionContext() {
    const { script, txContext } = this.context;

    this.context = {
      script,
      txContext: txContext,
      stack: [],
      altStack: [],
      redeemStack: [],
      jumpTable: this.constructJumpTable(script),
      programCounter: 0,
    };

    this.executionStatus = 'Not Started';
  }

  constructJumpTable(script: Script) {
    const jumpTable: JumpTable = {};
    const controlFrames: ControlFrame[] = [];

    for (let i = 0; i < script.cmds.length; i++) {
      const cmd = script.cmds[i];

      switch (cmd) {
        case OP_CODES.OP_IF:
        case OP_CODES.OP_NOTIF:
          controlFrames.push({ type: 'conditional', index: i });
          break;
        case OP_CODES.OP_ELSE:
          if (controlFrames.length === 0) throw new Error('OP_ELSE without conditional');
          const ifEntry = controlFrames.pop()!;
          if (ifEntry.type !== 'conditional') throw new Error('OP_ELSE without conditional');
          jumpTable[ifEntry.index] = { target: i, type: 'conditional' };
          controlFrames.push({ type: 'unconditional', index: i });
          break;
        case OP_CODES.OP_ENDIF:
          if (controlFrames.length === 0) throw new Error('ENDIF without control structure');
          const priorEntry = controlFrames.pop()!;
          jumpTable[priorEntry.index] = { target: i, type: priorEntry.type };
          break;
      }
    }
    return jumpTable;
  }

  step() {
    // Back out if the script has already finished running
    if (this.executionStatus === 'Success' || this.executionStatus === 'Failure') {
      return;
    }

    // Check if the script has finished running at the start of the step so we can see the last item....
    this.checkEndConditions();

    const success = this.stepStrategy.step(this.context);

    if (!success) {
      this.executionStatus = 'Failure';
    } else {
      this.executionStatus = 'Running';
    }
  }

  checkEndConditions() {
    const { script, programCounter, stack } = this.context;

    if (programCounter >= script.cmds.length) {
      // Script end check.
      // if stack is has more than 1 item, or the last item is 0, then the script failed.
      if (stack.length !== 1 || decodeNumber(stack.pop()!) === 0) {
        this.executionStatus = 'Failure';
      } else {
        this.executionStatus = 'Success';
      }
    }
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
