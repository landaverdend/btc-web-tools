import { OP_CODES } from '@/crypto/op/op';
import { Script } from '@/crypto/script/Script';
import { hexToBytes } from '@/crypto/util/helper';

export function compileScript(scriptText: string) {
  // Split by whitespace and filter out empty strings
  const commands = scriptText
    .trim()
    .split(/\s+/)
    .filter((cmd) => cmd.length > 0)
    .map((cmd) => cmd.toUpperCase());

  const formattedCmds = commands.map((cmd) => {
    if (cmd.startsWith('OP_')) {
      return OP_CODES[cmd];
    }

    // otherwise treat as hex data.
    return hexToBytes(cmd);
  });

  console.log(formattedCmds);

  return new Script(formattedCmds);
}
