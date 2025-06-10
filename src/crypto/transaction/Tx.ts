import { ByteStream } from '@/util/ByteStream';
import { bytesToHex, encodeVarInt, hexToBytes, integerToLittleEndian, littleEndianToInteger } from '@/util/helper';
import { Script } from '../script/Script';
import { FormattedTx } from '@/types/tx';
export default class Tx {
  version: number;
  inputs: TxIn[];
  outputs: TxOut[];
  locktime: number;

  constructor(version: number, inputs: TxIn[], outputs: TxOut[], locktime: number) {
    this.version = version;
    this.inputs = inputs;
    this.outputs = outputs;
    this.locktime = locktime;
  }

  /**
   * Parse a tx from a hex string: https://en.bitcoin.it/wiki/Transaction
   * @param hex - hex string of a transaction
   */
  static fromHex(hex: string) {
    const stream = new ByteStream(hexToBytes(hex));

    const version = Number(littleEndianToInteger(stream.read(4))); // First 4 bytes are the version
    const inputCount = stream.readVarInt(); // Var int can take up to 9 bytes

    const inputs: TxIn[] = [];
    for (let i = 0; i < inputCount; i++) {
      inputs.push(TxIn.fromStream(stream));
    }

    const outputs: TxOut[] = [];
    const outputCount = stream.readVarInt();

    for (let i = 0; i < outputCount; i++) {
      outputs.push(TxOut.fromStream(stream));
    }

    const locktime = Number(littleEndianToInteger(stream.read(4)));

    return new Tx(version, inputs, outputs, locktime);
  }

  /**
   * Format the tx in hex and little endian format.
   **/
  formatLE() {
    return {
      version: bytesToHex(integerToLittleEndian(this.version, 4)),
      inputs: this.inputs.map((input) => input.formatLE()),
      outputs: this.outputs.map((output) => output.formatLE()),
      locktime: bytesToHex(integerToLittleEndian(this.locktime, 4)),
    };
  }

  /**
   * Format the tx in a json-friendly readable format
   * @returns
   */
  format(): FormattedTx {
    return {
      version: this.version,
      inputs: this.inputs.map((i) => i.format()),
      outputs: this.outputs.map((o) => o.format()),
      locktime: this.locktime,
    };
  }

  toHex() {
    return bytesToHex(this.toBytes());
  }

  toBytes() {
    const stream = new ByteStream();

    stream.write(integerToLittleEndian(this.version, 4));
    const inputCount = this.inputs.length;
    stream.write(encodeVarInt(inputCount));

    for (const input of this.inputs) {
      stream.write(input.toBytes());
    }

    const outputCount = this.outputs.length;
    stream.write(encodeVarInt(outputCount));

    for (const output of this.outputs) {
      stream.write(output.toBytes());
    }

    stream.write(integerToLittleEndian(this.locktime, 4));

    return stream.toBytes();
  }
}

export class TxIn {
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

    stream.write(this.prevTx.reverse());
    stream.write(integerToLittleEndian(this.prevIndex, 4));
    stream.write(this.scriptSig.toBytes());
    stream.write(integerToLittleEndian(this.sequence, 4));

    return stream.toBytes();
  }
}

export class TxOut {
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

  formatLE() {
    return {
      amount: bytesToHex(integerToLittleEndian(this.amount, 8)),
      scriptPubkey: this.scriptPubkey.formatLE(),
    };
  }

  format() {
    return {
      amount: this.amount,
      scriptPubkey: this.scriptPubkey.format(),
    };
  }

  static fromStream(stream: ByteStream) {
    const amount = Number(littleEndianToInteger(stream.read(8)));
    const scriptPubkey = Script.fromStream(stream);

    return new TxOut(amount, scriptPubkey);
  }
}
