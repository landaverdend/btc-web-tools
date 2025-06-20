import { ByteStream } from '@/crypto/util/ByteStream';
import { Script } from '../script/Script';
import { bytesToHex, encodeVarInt, hexToBytes, integerToLittleEndian, littleEndianToInteger } from '@/crypto/util/helper';
import { FormattedTxIn, TxInLE } from '@/types/tx';

export default class TxIn {
  txid: Uint8Array;
  vout: number; // index of the output in the previous transaction...
  scriptSig: Script;
  sequence: number;

  constructor(prevTx: Uint8Array, prevIndex: number, sequence: number, scriptSig?: Script) {
    this.txid = prevTx;
    this.vout = prevIndex;
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

  formatLE(): TxInLE {
    return {
      txid: bytesToHex(this.txid.reverse()),
      vout: bytesToHex(integerToLittleEndian(this.vout, 4)),
      sequence: bytesToHex(integerToLittleEndian(this.sequence, 4)),
      scriptSig: this.scriptSig.formatLE(),
    };
  }

  format(): FormattedTxIn {
    const copy = new Uint8Array(this.txid);
    return {
      txid: bytesToHex(copy.reverse()),
      vout: this.vout,
      sequence: this.sequence,
      scriptSig: this.scriptSig.format(),
    };
  }

  toBytes() {
    const stream = new ByteStream();
    const copy = new Uint8Array(this.txid);

    stream.write(copy.reverse());
    stream.write(integerToLittleEndian(this.vout, 4));
    stream.write(this.scriptSig.toBytes());
    stream.write(integerToLittleEndian(this.sequence, 4));

    return stream.toBytes();
  }

  static fromJson(json: FormattedTxIn) {
    const txid = hexToBytes(json.txid);
    const vout = json.vout;
    const sequence = json.sequence;
    const scriptSig = Script.fromJson(json.scriptSig);

    return new TxIn(txid, vout, sequence, scriptSig);
  }
}
