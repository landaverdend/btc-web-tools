import { Script } from '@/crypto/script/Script';

export function compileScript(scriptText: string) {
  // Split by whitespace and filter out empty strings
  const commands = scriptText
    .trim()
    .split(/\s+/)
    .filter((cmd) => cmd.length > 0)
    .map((cmd) => cmd.toUpperCase());

  const formattedScript = {
    cmds: commands.map((cmd) => {
      if (cmd.startsWith('OP_')) {
        return cmd;
      }

      // otherwise treat as hex data.
      return cmd;
    }),
  };

  return Script.fromJson(formattedScript);
}
