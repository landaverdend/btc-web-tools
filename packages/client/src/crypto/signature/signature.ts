import { ByteStream } from '../util/ByteStream';
import { bigEndianToInteger } from '../util/helper';

export class Signature {
  r: bigint;
  s: bigint;

  constructor(r: bigint, s: bigint) {
    this.r = r;
    this.s = s;
  }

  toBytes() {
    // const rBytes = integerToBigEndian(this.r, 32);
  }

  static fromDer(der: Uint8Array) {
    const stream = new ByteStream(der);

    const compound = stream.read(1);

    if (compound[0] !== 0x30) {
      throw new Error('Bad Signature');
    }

    const length = stream.read(1)[0];
    if (length + 2 !== der.length) {
      throw new Error('Bad Signature Length');
    }

    const marker = stream.read(1)[0];
    if (marker !== 0x02) {
      throw new Error('Bad Signature');
    }

    const rLength = stream.read(1)[0];
    const r = bigEndianToInteger(stream.read(rLength));

    const marker2 = stream.read(1)[0];
    if (marker2 !== 0x02) {
      throw new Error('Bad Signature');
    }

    const sLength = stream.read(1)[0];
    const s = bigEndianToInteger(stream.read(sLength));

    if (der.length !== 6 + rLength + sLength) {
      throw new Error('Signature too long');
    }

    return new Signature(r, s);
  }
}
