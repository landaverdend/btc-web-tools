import { decodeNumber, OP_CODE_FUNCTIONS, OP_CODE_NAMES } from '@/crypto/op/op';
import { bytesToHex } from '@/crypto/util/helper';
import { ScriptDebuggerResult, useDebugStore } from '@/state/debugStore';

export function useScriptDebugger() {
  const { script, currentCmd, setCurrentCmd, stack, status } = useDebugStore();

  function step(): ScriptDebuggerResult {
    // Program is already done....
    if (status === 'Success' || status === 'Failure') return status;

    if (currentCmd >= script.cmds.length) {
      // Script end check.
      // if stack is empty, or the last item is 0, then the script failed.
      if (stack.length === 0 || decodeNumber(stack.pop()!) === 0) {
        return 'Failure';
        // setStatus('Failure');
      }

      return 'Success';
      // setStatus('Success');
    }

    // Get command to run.
    const cmd = script.getCmd(currentCmd);

    // Check whether we push data or do an operation
    if (typeof cmd === 'number') {
      const func = OP_CODE_FUNCTIONS[cmd];

      let result = false;
      // OP_IF and OP_NOTIF
      if ([99, 100].includes(cmd)) {
        result = func({ stack, cmds: script.cmds.slice(currentCmd + 1), setCurrentCmd, currentCmd });
      } else {
        result = func({ stack });
      }

      if (!result) {
        return 'Failure';
      }
    } else {
      // if command is a bytearray, push it onto the stack.
      stack.push(cmd);
    }

    // Increment command counter
    setCurrentCmd(currentCmd + 1);
    return 'Running';
    // setStatus('Running');
  }

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
