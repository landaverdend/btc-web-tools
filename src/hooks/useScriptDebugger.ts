import { decodeNumber, OP_CODE_FUNCTIONS, OP_CODE_NAMES } from '@/crypto/op/op';
import { bytesToHex } from '@/crypto/util/helper';
import { useDebugStore } from '@/state/debugStore';

export type ScriptDebuggerResult = 'success' | 'failure' | 'incomplete';

export function useScriptDebugger() {
  const { script, currentCmd, setCurrentCmd, stack } = useDebugStore();

  const step = () => {
    // Script end check.
    if (currentCmd >= script.cmds.length) {
      // if stack is empty, or the last item is 0, then the script failed.
      if (stack.length === 0 || decodeNumber(stack.pop()!) === 0) {
        return 'failure';
      }

      return 'success';
    }

    // Get command to run.
    const cmd = script.getCmd(currentCmd);

    // Check whether we push data or do an operation
    if (typeof cmd === 'number') {
      const result = OP_CODE_FUNCTIONS[cmd](stack);

      if (!result) {
        return 'failure';
      }
    } else {
      // if command is a bytearray, push it onto the stack.
      stack.push(cmd);
    }

    // Increment command counter
    setCurrentCmd(currentCmd + 1);

    return 'incomplete';
  };

  const getNextArgument = () => {
    const cmd = script.getCmd(currentCmd);

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
