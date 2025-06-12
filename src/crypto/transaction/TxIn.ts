import { ByteStream } from '@/crypto/util/ByteStream';
import { Script } from '../script/Script';
import { bytesToHex, hexToBytes, integerToLittleEndian, littleEndianToInteger } from '@/crypto/util/helper';
import { FormattedTxIn } from '@/types/tx';

export default class TxIn {
  prevTx: Uint8Array;
  prevIndex: number; // index of the output in the previous transaction...
  scriptSig: Script;
  sequence: number;

  constructor(prevTx: Uint8Array, prevIndex: number, sequence: number, scriptSig?: Script) {
    this.prevTx = prevTx;
    this.prevIndex = prevIndex;
    this.sequence = sequence;
    this.scriptSig = scriptSig ?? new Script();
  }

  static fromStream(stream: ByteStream) {
    const prevTx = stream.read(32).reverse(); // Reverse the bytes to get the hash
    const prevIndex = Number(littleEndianToInteger(stream.read(4)));

    const scriptSig = Script.fromStream(stream);
    const sequence = Number(littleEndianToInteger(stream.read(4)));

    return new TxIn(prevTx, prevIndex, sequence, scriptSig);
  }

  formatLE() {
    return {
      prevTx: bytesToHex(this.prevTx.reverse()),
      prevIndex: bytesToHex(integerToLittleEndian(this.prevIndex, 4)),
      sequence: bytesToHex(integerToLittleEndian(this.sequence, 4)),
      scriptSig: this.scriptSig.formatLE(),
    };
  }

  format() {
    return {
      prevTx: bytesToHex(this.prevTx.reverse()),
      prevIndex: this.prevIndex,
      sequence: this.sequence,
      scriptSig: this.scriptSig.format(),
    };
  }

  toBytes() {
    const stream = new ByteStream();
    // console.log('before reverse', bytesToHex(this.prevTx));
    // console.log('after reverse', bytesToHex(this.prevTx.reverse()));
    stream.write(this.prevTx.reverse());
    stream.write(integerToLittleEndian(this.prevIndex, 4));
    stream.write(this.scriptSig.toBytes());
    stream.write(integerToLittleEndian(this.sequence, 4));

    return stream.toBytes();
  }

  static fromJson(json: FormattedTxIn) {
    const prevTx = hexToBytes(json.prevTx);
    const prevIndex = json.prevIndex;
    const sequence = json.sequence;
    const scriptSig = Script.fromJson(json.scriptSig);

    return new TxIn(prevTx, prevIndex, sequence, scriptSig);
  }
}
