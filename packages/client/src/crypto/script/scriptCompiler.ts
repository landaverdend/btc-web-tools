import { OP_CODES } from '@/crypto/op/op';
import { Script } from '@/crypto/script/Script';
import { hexToBytes } from '@/crypto/util/helper';
import { JumpTable } from './execution/ExecutionContext';

type ControlFrame = {
  type: 'conditional' | 'unconditional';
  index: number;
};

export function compileScript(scriptText: string, txInContext = false) {
  scriptText = removeComments(scriptText);

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

  const theScript = new Script(parsedCommands);

  validateScript(theScript, txInContext);

  return theScript;
}

function removeComments(scriptText: string) {
  return scriptText.replace(/\/\/.*$/gm, '').replace(/^\s*[\r\n]/gm, '');
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

function validateScript(script: Script, txInContext = false) {
  const cmds = script.cmds;
  if (cmds.includes(OP_CODES.OP_CHECKSIGVERIFY) || cmds.includes(OP_CODES.OP_CHECKSIG)) {
    if (!txInContext) {
      throw new Error('OP_CHECKSIGVERIFY/OP_CHECKSIG require a Tx to be provided.');
    }
  }

  validatePushBytes(script);
}

// Validate that the push bytes are the correct length.
function validatePushBytes(script: Script) {
  const cmds = script.cmds;
  for (let i = 0; i < cmds.length; i++) {
    const cmd = cmds[i];

    if (typeof cmd === 'number' && cmd >= 1 && cmd <= 75) {
      if (i + 1 >= cmds.length) throw new Error('Pushbyte command is not followed by data');

      const nextCmd = cmds[i + 1];
      if (!(nextCmd instanceof Uint8Array)) throw new Error('Pushbyte command is not followed by data');
      if (nextCmd.length !== cmd) {
        throw new Error(`OP_PUSHBYTES${cmd} expects ${cmd} bytes, but got ${nextCmd.length}`);
      }
      i++; // skip next command since we already validated it...
    }
  }
}
