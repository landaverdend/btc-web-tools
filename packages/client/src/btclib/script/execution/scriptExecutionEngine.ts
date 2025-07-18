import Tx from '@/btclib/transaction/Tx';
import { Script } from '../Script';
import { TxMetadata } from '@/api/api';
import { decodeNumber, OP_CODE_NAMES } from '@/btclib/op/op';
import { bytesToHex } from '@/btclib/util/helper';
import { ExecutionContext, TxContext } from './executionContext';
import { StandardStepStrategy } from './strategy/standardStepStrategy';
import { P2SHStepStrategy } from './strategy/p2shStepStrategy';
import { P2WSHStepStrategy } from './strategy/p2wshStepStrategy';

export type ScriptExecutionStatus = 'Success' | 'Failure' | 'Running' | 'Not Started';

export interface StepStrategy {
  step(executionContext: ExecutionContext): boolean;
}

export class ScriptExecutionEngine {
  private static instance: ScriptExecutionEngine;

  context: ExecutionContext;
  executionStatus: ScriptExecutionStatus;
  stepStrategy: StepStrategy;

  private constructor(script: Script, tx?: Tx, txMetadata?: TxMetadata, selectedInput = 0) {
    let txContext: TxContext | undefined;
    if (tx && txMetadata) {
      txContext = {
        tx: tx,
        txMetadata: txMetadata,
        selectedInputIndex: selectedInput,
      };
    }

    this.executionStatus = 'Not Started';
    this.context = {
      script,
      stack: [],
      altStack: [],
      redeemStack: [],
      programCounter: 0,
      txContext,
    };

    // temporary
    this.stepStrategy = new StandardStepStrategy();
    switch (script.type) {
      case 'p2wsh':
        this.stepStrategy = new P2WSHStepStrategy();
        break;
      case 'p2sh':
        this.stepStrategy = new P2SHStepStrategy();
        break;
      default:
        this.stepStrategy = new StandardStepStrategy();
        break;
    }
  }

  resetExecutionContext() {
    const { script, txContext } = this.context;

    this.context = {
      script,
      txContext: txContext,
      stack: [],
      altStack: [],
      redeemStack: [],
      programCounter: 0,
    };

    this.executionStatus = 'Not Started';
  }

  static updateInstance(script: Script, tx?: Tx, txMetadata?: TxMetadata, selectedInput = 0) {
    this.instance = new ScriptExecutionEngine(script, tx, txMetadata, selectedInput);
    return this.instance;
  }

  static getInstance() {
    if (!ScriptExecutionEngine.instance) {
      ScriptExecutionEngine.instance = new ScriptExecutionEngine(new Script());
    }

    return ScriptExecutionEngine.instance;
  }

  step() {
    // Back out if the script has already finished running
    if (this.executionStatus === 'Success' || this.executionStatus === 'Failure') {
      return;
    }

    const success = this.stepStrategy.step(this.context);

    if (!success) {
      this.executionStatus = 'Failure';
    } else {
      this.executionStatus = 'Running';
    }

    // Check if the script has finished running at the start of the step so we can see the last item....
    this.checkEndConditions();
  }

  /* Mostly for testing purposes... */
  run() {
    for (let i = 0; i < this.context.script.cmds.length; i++) {
      this.step();
    }
  }

  isDone() {
    return this.executionStatus === 'Success' || this.executionStatus === 'Failure';
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
