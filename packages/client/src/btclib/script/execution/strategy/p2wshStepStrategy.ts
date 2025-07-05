import { OP_CODE_FUNCTIONS } from '@/btclib/op/op';
import { ExecutionContext } from '../executionContext';
import { StepStrategy } from '../scriptExecutionEngine';

export class P2WSHStepStrategy implements StepStrategy {
  constructor() {}

  step(executionContext: ExecutionContext): boolean {
    const cmd = executionContext.script.getCmd(executionContext.programCounter);

    // scriptsig => pubkey => redeem
    const witnessScriptSection = executionContext.script.sections.find((section) => section.type === 'witnessScript')!;

    // We hit the redeem section, restore the stack to the saved snapshot...
    if (executionContext.programCounter === witnessScriptSection.startIndex) {
      executionContext.stack = [];
    }

    let toRet = true;
    if (typeof cmd === 'number') {
      toRet = OP_CODE_FUNCTIONS[cmd](executionContext);
    } else {
      executionContext.stack.push(cmd);
    }

    // Standard step strategy
    if (typeof cmd === 'number' && cmd > 0 && cmd < 76) {
      executionContext.programCounter += 2;
    } else {
      executionContext.programCounter++;
    }

    return toRet;
  }
}
