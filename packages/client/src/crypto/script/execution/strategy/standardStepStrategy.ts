import { OP_CODE_FUNCTIONS } from '@/crypto/op/op';
import { ExecutionContext } from '../ExecutionContext';
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

    executionContext.programCounter++;

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
