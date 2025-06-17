import { OP_CODES } from '@/crypto/op/op';
import { Script } from '@/crypto/script/Script';
import { hexToBytes } from '@/crypto/util/helper';

export function compileScript(scriptText: string) {
  // Split by whitespace and filter out empty strings
  const commands = scriptText
    .trim()
    .split(/\s+/)
    .filter((cmd) => cmd.length > 0)
    .map((cmd) => (cmd.startsWith('OP') ? cmd.toUpperCase() : cmd));

  const formattedCmds = commands.map((cmd) => {
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

  return new Script(formattedCmds);
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
