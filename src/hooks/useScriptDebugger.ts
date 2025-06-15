import { useDebugStore } from '@/state/debugStore';

export function useScriptDebugger() {
  const { script, currentCmd, setCurrentCmd, stack } = useDebugStore();

  const step = () => {
    // Stepped through whole script...
    // TODO: Add whether or not the script was successful (or failed)
    if (currentCmd >= script.cmds.length) {
      return;
    }

    const cmd = script.getCmd(currentCmd);

    // opcode, do the function.
    if (typeof cmd === 'number') {
      console.log(cmd);
    } else {
      // if command is a bytearray, push it onto the stack.
      stack.push(cmd);
    }
    setCurrentCmd(currentCmd + 1);
  };

  return {
    step,
  };
}
