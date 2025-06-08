import { littleEndianToInteger } from './helper';

export class ByteStream {
  private bytes: Uint8Array;
  private position: number = 0;

  constructor(bytes?: Uint8Array) {
    this.bytes = bytes ?? new Uint8Array();
  }

  read(length: number) {
    const result = this.bytes.slice(this.position, this.position + length);
    this.position += length;
    return result;
  }

  readVarInt() {
    const firstByte = this.read(1)[0];

    // Oxfd means the next 2 bytes are a 16-bit integer
    if (firstByte === 0xfd) {
      return littleEndianToInteger(this.read(2));
    } else if (firstByte === 0xfe) {
      return littleEndianToInteger(this.read(4));
    } else if (firstByte === 0xff) {
      return littleEndianToInteger(this.read(8));
    } else {
      return firstByte;
    }
  }

  // Concatenate bytes to the end of the stream.
  write(bytes: Uint8Array) {
    this.bytes = new Uint8Array([...this.bytes, ...bytes]);
  }

  toBytes() {
    return this.bytes;
  }

  getPosition() {
    return this.position;
  }

  setPosition(position: number) {
    this.position = position;
  }
}
