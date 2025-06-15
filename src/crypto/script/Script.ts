import { ByteStream } from '@/crypto/util/ByteStream';
import { bytesToHex, encodeVarInt, hexToBytes, integerToLittleEndian, littleEndianToInteger } from '@/crypto/util/helper';
import { OP_CODE_NAMES, OP_CODES } from '../op/op';
import { FormattedScript, ScriptLE } from '@/types/tx';

// A script is just a list of bigint commands.
export class Script {
  cmds: (number | Uint8Array)[];

  constructor(cmds?: (number | Uint8Array)[]) {
    this.cmds = cmds ?? [];

    // Serialize the commands to get the length of the script. Throw out an error if the script is too long.
    this.serializeCommands();
  }

  // Mostly for the debugger. If used by others then maybe move this.
  getCmd(index: number) {
    if (index >= this.cmds.length) {
      return 'End of Script';
    }

    const cmd = this.cmds[index];

    if (typeof cmd === 'number') {
      return OP_CODE_NAMES[cmd];
    }

    return bytesToHex(cmd);
  }

  serializeCommands() {
    let res = new ByteStream();

    for (const cmd of this.cmds) {
      if (typeof cmd === 'number') {
        res.write(integerToLittleEndian(cmd, 1));
      } else {
        const len = cmd.length;

        if (len < 75) {
          res.write(integerToLittleEndian(cmd.length, 1));
        } else if (len > 75 && len < 0x100) {
          res.write(integerToLittleEndian(76, 1));
          res.write(integerToLittleEndian(length, 1));
        } else if (len >= 0x100 && len <= 520) {
          res.write(integerToLittleEndian(77, 1));
          res.write(integerToLittleEndian(len, 2));
        } else {
          throw new Error('Script length is too long.');
        }
        res.write(cmd);
      }
    }

    return res;
  }

  formatLE(): ScriptLE {
    const serialized = this.serializeCommands().toBytes();

    return {
      length: bytesToHex(encodeVarInt(serialized.length)),
      cmds: bytesToHex(serialized),
    };
  }

  format() {
    return {
      cmds: this.cmds.map((cmd) => {
        // OP_Code
        if (typeof cmd === 'number') {
          return OP_CODE_NAMES[cmd];
        }
        // Pushdata
        else {
          return bytesToHex(cmd);
        }
      }),
    };
  }

  toHex() {
    return bytesToHex(this.toBytes());
  }

  toBytes() {
    const bytes = this.serializeCommands().toBytes();

    const varint = encodeVarInt(bytes.length);
    const result = new Uint8Array([...varint, ...bytes]); // prepend varint to the bytes.

    return result;
  }

  static fromJson(json: FormattedScript) {
    const cmds = json.cmds.map((cmd) => {
      if (OP_CODES[cmd] !== undefined) {
        return OP_CODES[cmd] as number;
      } else {
        return hexToBytes(cmd);
      }
    });

    return new Script(cmds);
  }

  static fromStream(stream: ByteStream) {
    const length = stream.readVarInt();
    const cmds: (number | Uint8Array)[] = [];

    let count = 0;
    while (count < length) {
      const current = stream.read(1)[0];
      count++;

      // range(1, 75) means the next n bytes are a pushdata command.
      if (current >= 1 && current <= 75) {
        let n = current;
        cmds.push(stream.read(n));
        count += n;
      }
      // pushdata1 command, next byte is the length of the data...
      else if (current === 76) {
        const dataLength = Number(littleEndianToInteger(stream.read(1)));
        cmds.push(stream.read(dataLength));
        count += dataLength + 1;
      }
      // pushdata2 command. next two bytes are length of the data...
      else if (current === 77) {
        let dataLength = Number(littleEndianToInteger(stream.read(2)));
        cmds.push(stream.read(dataLength));
        count += dataLength + 2;
      }
      // normal opcode.
      else {
        const opcode = current;
        cmds.push(opcode);
      }
    }

    if (count !== length) {
      throw new Error('Parsing script failed.');
    }

    return new Script(cmds);
  }
}
