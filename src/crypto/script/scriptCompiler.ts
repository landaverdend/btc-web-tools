import { OP_CODES } from '@/crypto/op/op';
import { Script, ScriptCommand } from '@/crypto/script/Script';
import { hexToBytes } from '@/crypto/util/helper';

export function compileScript(scriptText: string) {
  // Split by whitespace and filter out empty strings
  const commands = scriptText
    .trim()
    .split(/\s+/)
    .filter((cmd) => cmd.length > 0)
    .map((cmd) => (cmd.startsWith('OP') ? cmd.toUpperCase() : cmd));

  const parsedCommands = commands.map((cmd) => {
    // Validate command and throw any errors if invalid.
    validateCommand(cmd);

    // Check if OP CODE
    if (cmd.startsWith('OP_')) {
      return OP_CODES[cmd];
    }

    // otherwise treat as hex data.
    let bytes: Uint8Array;

    if (cmd.startsWith('0x')) {
      bytes = hexToBytes(cmd);
    } else {
      // base 10
      const num = parseInt(cmd, 10);
      bytes = hexToBytes(num.toString(16));
    }

    return bytes;
  });

  validateScript(parsedCommands);

  return new Script(parsedCommands);
}

function validateCommand(cmd: string) {
  if (cmd.startsWith('OP_')) {
    if (OP_CODES[cmd] === undefined) {
      throw new Error(`Unrecognized opcode: ${cmd}`);
    }

    return; // exit early if valid op code
  }

  const isValidNumber = isValidHex(cmd) || isValidBase10(cmd);
  if (!isValidNumber) {
    throw new Error(`Invalid number value: ${cmd}`);
  }
}

export function isValidHex(hex: string) {
  return /^0x[0-9a-fA-F]+$/.test(hex);
}

export function isValidBase10(num: string) {
  return /^[0-9]+$/.test(num);
}

function isConditional(cmd: ScriptCommand) {
  return cmd === 99 || cmd === 100;
}

function validateScript(script: ScriptCommand[]) {
  validateConditionals(script);
}

// Go through the whole script and validate that the conditional statements are well formed.
function validateConditionals(script: ScriptCommand[]) {
  const ifStack = [];
  let depth = 0;
  const elseSet = new Set<number>([]); // set of depths where OP_ELSE has been seen.

  for (let i = 0; i < script.length; i++) {
    const cmd = script[i];

    if (isConditional(cmd)) {
      ifStack.push(cmd);
      depth++;
    }

    // OP_ENDIF
    if (cmd === 104) {
      if (ifStack.length === 0) {
        throw new Error('Unbalanced OP_IF/OP_ENDIF');
      }
      ifStack.pop();
      elseSet.delete(depth);
      depth--;
    }

    // OP_ELSE
    if (cmd === 103) {
      if (elseSet.has(depth)) {
        throw new Error('Multiple OP_ELSE statements');
      }
      if (ifStack.length === 0) {
        throw new Error('OP_ELSE without OP_IF');
      }
      elseSet.add(depth);
    }

    if (depth < 0) {
      throw new Error('Unbalanced OP_IF/OP_ENDIF');
    }
  }

  if (ifStack.length > 0 || depth !== 0) {
    throw new Error('Unbalanced OP_IF/OP_ENDIF');
  }
}
