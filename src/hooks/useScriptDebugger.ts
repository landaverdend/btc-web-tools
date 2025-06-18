import { decodeNumber, OP_CODE_FUNCTIONS, OP_CODE_NAMES, OP_CODES, OpContext } from '@/crypto/op/op';
import { bytesToHex } from '@/crypto/util/helper';
import { ScriptDebuggerResult, useDebugStore } from '@/state/debugStore';

export function useScriptDebugger() {
  const { script, programCounter, setProgramCounter, stack, status, conditionFrames, pushConditionFrame } = useDebugStore();

  function step(): ScriptDebuggerResult {
    // Program is already done....
    if (status === 'Success' || status === 'Failure') return status;

    if (programCounter >= script.cmds.length) {
      // Script end check.
      // if stack is empty, or the last item is 0, then the script failed.
      if (stack.length === 0 || decodeNumber(stack.pop()!) === 0) {
        return 'Failure';
      }
      return 'Success';
    }

    // Get command to run.
    const cmd = script.getCmd(programCounter);

    // Check whether we push data or do an operation
    if (typeof cmd === 'number') {
      const func = OP_CODE_FUNCTIONS[cmd];
      // build the op context
      const opContext: OpContext = {
        stack,
        cmds: script.cmds,
        setProgramCounter,
        programCounter,
        pushConditionFrame,
      };

      let result = func(opContext);

      switch (cmd) {
        // OP_IF and OP_NOTIF are control flow instructions that increment the program counter inside their own function
        case OP_CODES.OP_IF:
          break;
        case OP_CODES.OP_ENDIF:
          conditionFrames.pop();
          incProgramCounter();
          break;
        default:
          incProgramCounter();
          break;
      }

      if (!result) {
        return 'Failure';
      }
    } else {
      // if command is a bytearray, push it onto the stack.
      stack.push(cmd);
      incProgramCounter();
    }

    return 'Running';
  }

  function incProgramCounter() {
    // Check if we're at a condition index. If we are, then jump to the next control point.
    if (conditionFrames.length > 0) {
      const { elseIndex, endIndex } = conditionFrames[conditionFrames.length - 1];

      if (programCounter === elseIndex) {
        setProgramCounter(endIndex);
        return;
      }
    }

    setProgramCounter(programCounter + 1);
  }

  const getNextArgument = () => {
    const cmd = script.getCmd(programCounter);

    if (typeof cmd === 'number') {
      return OP_CODE_NAMES[cmd];
    }

    return '0x' + bytesToHex(cmd);
  };

  return {
    step,
    getNextArgument,
  };
}
