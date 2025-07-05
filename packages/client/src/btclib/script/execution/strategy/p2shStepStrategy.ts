import { OP_CODE_FUNCTIONS } from '@/btclib/op/op';
import { ExecutionContext } from '../executionContext';
import { StepStrategy } from '../scriptExecutionEngine';

export class P2SHStepStrategy implements StepStrategy {
  constructor() {}

  step(executionContext: ExecutionContext): boolean {
    const cmd = executionContext.script.getCmd(executionContext.programCounter);

    // scriptsig => pubkey => redeem
    const pubkeySection = executionContext.script.sections.find((section) => section.type === 'scriptsig')!;
    const redeemSection = executionContext.script.sections.find((section) => section.type === 'redeem')!;

    // When we are done running the scriptsig section, save a copy of the stack up to that point...
    if (executionContext.programCounter === pubkeySection?.endIndex) {
      executionContext.redeemStack = executionContext.stack.slice(0, executionContext.stack.length - 1);
    }

    // We hit the redeem section, restore the stack to the saved snapshot...
    if (executionContext.programCounter === redeemSection?.startIndex) {
      executionContext.stack = executionContext.redeemStack;
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
