import { ByteStream } from '@/btclib/util/ByteStream';
import { Script } from '../../btclib/script/Script';
import { bytesToHex, integerToLittleEndian, littleEndianToInteger } from '@/btclib/util/helper';
import { TxOutLE } from '@/types/tx';

export default class TxOut {
  amount: number;
  scriptPubkey: Script;

  constructor(value: number, scriptPubkey?: Script) {
    this.amount = value;
    this.scriptPubkey = scriptPubkey ?? new Script();
  }

  toBytes() {
    const stream = new ByteStream();

    stream.write(integerToLittleEndian(this.amount, 8));
    stream.write(this.scriptPubkey.toBytes());

    return stream.toBytes();
  }

  formatLE(): TxOutLE {
    return {
      amount: bytesToHex(integerToLittleEndian(this.amount, 8)),
      scriptPubkey: this.scriptPubkey.formatLE(),
    };
  }

  static fromStream(stream: ByteStream) {
    const amount = Number(littleEndianToInteger(stream.read(8)));
    const scriptPubkey = Script.fromStream(stream);

    return new TxOut(amount, scriptPubkey);
  }
}
