import { OP_CODE_FUNCTIONS } from '@/btclib/op/op';
import { ExecutionContext } from '../executionContext';
import { StepStrategy } from '../scriptExecutionEngine';

export class StandardStepStrategy implements StepStrategy {
  step(executionContext: ExecutionContext): boolean {
    const cmd = executionContext.script.getCmd(executionContext.programCounter);

    let result = false;
    if (typeof cmd === 'number') {
      result = this.executeOpCode(cmd, executionContext);
    } else {
      result = this.executePushData(cmd, executionContext);
    }

    // For OP_PUSHDATA1-75, we need to increment the program counter by 2 because we're pushing the OPCODE + DATA.
    if (typeof cmd === 'number' && cmd > 0 && cmd < 76) {
      executionContext.programCounter += 2;
    } else {
      executionContext.programCounter++;
    }

    return result;
  }

  executeOpCode(cmd: number, executionContext: ExecutionContext): boolean {
    const func = OP_CODE_FUNCTIONS[cmd];

    let result = false;

    result = func(executionContext);

    return result;
  }

  executePushData(data: Uint8Array, executionContext: ExecutionContext): boolean {
    executionContext.stack.push(data);
    return true;
  }
}
