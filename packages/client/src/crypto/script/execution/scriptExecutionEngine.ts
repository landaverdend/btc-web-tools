import { DebugState } from '@/state/debugStore';
import { TxState } from '@/state/txStore';
import { Script, ScriptCommand } from '../Script';
import { decodeNumber, OP_CODE_FUNCTIONS, OP_CODES, OpContext } from '@/crypto/op/op';

export class ScriptExecutionEngine {
  constructor(private debugState: DebugState, private txState: TxState, private script: Script) {}

  updateContext(debugState: DebugState, txState: TxState) {
    this.debugState = debugState;
    this.txState = txState;
  }

  step() {
    const { programCounter, status } = this.debugState;

    if (this.checkIfDone()) {
      // If status is still running, move forward to either success or failed
      if (status === 'Running') {
        this.setExecutionStatus();
      }
      return;
    }

    // Maybe move this guy...
    this.debugState.setStatus('Running');

    const cmd = this.script.getCmd(programCounter);
    if (typeof cmd === 'number') {
      this.handleOpCode(cmd);
    } else {
      this.handleData(cmd);
    }
  }

  checkIfDone() {
    const { programCounter } = this.debugState;

    if (programCounter >= this.script.cmds.length) {
      return true;
    }
  }

  setExecutionStatus() {
    const { stack } = this.debugState;
    if (stack.length !== 1 || decodeNumber(stack.pop()!) === 0) {
      this.debugState.setStatus('Failure');
    } else {
      this.debugState.setStatus('Success');
    }
  }

  handleOpCode(cmd: number) {
    const { stack, altStack, setProgramCounter, pushConditionFrame, programCounter, conditionFrames } = this.debugState;
    const { tx, selectedInput, txMetadata } = this.txState;

    const func = OP_CODE_FUNCTIONS[cmd];

    const opContext: OpContext = {
      stack: stack,
      altStack: altStack,
      cmds: this.script.cmds,
      setProgramCounter: setProgramCounter,
      programCounter,
      pushConditionFrame,
      tx: tx,
      selectedInput: selectedInput,
    };

    let result = false;

    switch (cmd) {
      // OP_IF and OP_NOTIF are control flow instructions that increment the program counter inside their own function
      case OP_CODES.OP_IF:
      case OP_CODES.OP_NOTIF:
        result = func(opContext);
        break;
      case OP_CODES.OP_ENDIF:
        result = func(opContext);
        conditionFrames.pop();
        this.incProgramCounter(cmd);
        break;
      case OP_CODES.OP_CHECKSIGVERIFY:
      case OP_CODES.OP_CHECKSIG:
        const prevScriptPubkey = txMetadata!.vin[selectedInput].prevout!.scriptpubkey;
        const sighash = tx?.sighash(selectedInput, Script.fromHex(prevScriptPubkey));
        opContext.sighash = sighash;
        result = func(opContext);
        this.incProgramCounter(cmd);
        break;
      default:
        result = func(opContext);
        this.incProgramCounter(cmd);
        break;
    }

    if (!result) {
      this.debugState.setStatus('Failure');
    }
  }

  handleData(data: Uint8Array) {
    const { stack } = this.debugState;
    stack.push(data);
    this.incProgramCounter(data);
  }

  incProgramCounter(cmd: ScriptCommand) {
    const { conditionFrames, programCounter, setProgramCounter } = this.debugState;

    // Check if we're at a condition index. If we are, then jump to the next control point.
    if (conditionFrames.length > 0) {
      const { elseIndex, endIndex } = conditionFrames[conditionFrames.length - 1];

      if (programCounter === elseIndex) {
        setProgramCounter(endIndex);
        return;
      }
    }

    // Skip over OP_PUSHBYTES commands by 2.
    if (typeof cmd === 'number' && cmd > 0 && cmd <= 75) {
      setProgramCounter(programCounter + 2);
    } else {
      setProgramCounter(programCounter + 1);
    }
  }
}
