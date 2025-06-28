import { OP_CODE_FUNCTIONS, OP_CODES, OpContext } from '@/crypto/op/op';
import { ExecutionContext } from '../ExecutionContext';
import { StepStrategy } from '../scriptExecutionEngine';
import { Script } from '../../Script';

export class StandardStepStrategy implements StepStrategy {
  step(executionContext: ExecutionContext): boolean {
    const cmd = executionContext.script.getCmd(executionContext.programCounter);

    let result = false;
    if (typeof cmd === 'number') {
      result = this.executeOpCode(cmd, executionContext);
    } else {
      result = this.executePushData(cmd, executionContext);
    }

    executionContext.programCounter++;

    return result;
  }

  executeOpCode(cmd: number, executionContext: ExecutionContext): boolean {
    const func = OP_CODE_FUNCTIONS[cmd];

    // build the op context
    const opContext: OpContext = {
      stack: executionContext.stack,
      altStack: executionContext.altStack,
      cmds: executionContext.script.cmds,
      programCounter: executionContext.programCounter,
      conditionFrames: executionContext.conditionFrames,
      tx: executionContext.txContext?.tx,
      selectedInput: executionContext.txContext?.selectedInputIndex,
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
        executionContext.conditionFrames.pop();
        executionContext.programCounter++;
        break;
      case OP_CODES.OP_CHECKSIGVERIFY:
      case OP_CODES.OP_CHECKSIG:
        const { txMetadata, selectedInputIndex, tx } = executionContext.txContext!;
        const prevScriptPubkey = txMetadata!.vin[selectedInputIndex].prevout!.scriptpubkey;
        const sighash = tx?.sighash(selectedInputIndex, Script.fromHex(prevScriptPubkey));
        opContext.sighash = sighash;
        console.log('sighash', sighash);
        result = func(opContext);
        break;
      default:
        result = func(opContext);
        break;
    }

    return result;
  }

  executePushData(data: Uint8Array, executionContext: ExecutionContext): boolean {
    executionContext.stack.push(data);
    return true;
  }
}
