import { ByteStream } from '@/util/ByteStream';
import { bytesToHex, encodeVarInt, hexToBytes, integerToLittleEndian, littleEndianToInteger } from '@/util/helper';
import { FormattedTx } from '@/types/tx';
import TxIn from './TxIn';
import TxOut from './TxOut';
export default class Tx {
  version: number;

  // https://bitcoincore.org/en/segwit_wallet_dev/
  isSegwit: boolean;
  witnesses?: TxWitness[];

  inputs: TxIn[];
  outputs: TxOut[];
  locktime: number;

  constructor(version: number, inputs: TxIn[], outputs: TxOut[], locktime: number, isSegwit = false, witnesses?: TxWitness[]) {
    this.version = version;
    this.inputs = inputs;
    this.outputs = outputs;
    this.locktime = locktime;

    this.isSegwit = isSegwit;
    if (isSegwit) {
      this.witnesses = witnesses;
    }
  }

  /**
   * Parse a tx from a hex string: https://en.bitcoin.it/wiki/Transaction
   * @param hex - hex string of a transaction
   */
  static fromHex(hex: string) {
    const stream = new ByteStream(hexToBytes(hex));

    const version = Number(littleEndianToInteger(stream.read(4))); // First 4 bytes are the version

    // TODO: check if segwit

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

    // TODO: add witness support

    const locktime = Number(littleEndianToInteger(stream.read(4)));

    return new Tx(version, inputs, outputs, locktime);
  }

  static fromJson(json: FormattedTx) {
    const tx = new Tx(
      json.version,
      json.inputs.map((i) => TxIn.fromJson(i)),
      json.outputs.map((o) => TxOut.fromJson(o)),
      json.locktime
    );
    return tx;
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

// TODO: add witness support/parsing
export class TxWitness {
  stack: Uint8Array[]; // stack of witness data.

  constructor(stack: Uint8Array[]) {
    this.stack = stack;
  }

  // https://bitcoincore.org/en/segwit_wallet_dev/

  static fromStream(stream: ByteStream) {}
}
