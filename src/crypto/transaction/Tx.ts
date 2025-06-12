import { ByteStream } from '@/crypto/util/ByteStream';
import { bytesToHex, encodeVarInt, hexToBytes, integerToLittleEndian, littleEndianToInteger } from '@/crypto/util/helper';
import { FormattedTx } from '@/types/tx';
import TxIn from './TxIn';
import TxOut from './TxOut';
export default class Tx {
  version: number;

  // https://bitcoincore.org/en/segwit_wallet_dev/
  isSegwit: boolean;
  witnessMarker?: number;
  witnessFlag?: number;
  witnessData?: TxWitnessData;

  inputs: TxIn[];
  outputs: TxOut[];
  locktime: number;

  constructor(
    version: number,
    inputs: TxIn[],
    outputs: TxOut[],
    locktime: number,
    isSegwit = false,
    witnessData?: TxWitnessData
  ) {
    this.version = version;
    this.inputs = inputs;
    this.outputs = outputs;
    this.locktime = locktime;

    this.isSegwit = isSegwit;
    if (isSegwit) {
      this.witnessMarker = 0x00;
      this.witnessFlag = 0x01;
      this.witnessData = witnessData;
    }
  }

  /**
   * Parse a tx from a hex string: https://en.bitcoin.it/wiki/Transaction
   * @param hex - hex string of a transaction
   */
  static fromHex(hex: string) {
    const stream = new ByteStream(hexToBytes(hex));

    const version = Number(littleEndianToInteger(stream.read(4))); // First 4 bytes are the version

    // Check if it's a segwit transaction.
    const isSegwit = stream.peek(1)[0] === 0x00;
    if (isSegwit) {
      const [marker, flag] = stream.read(2);
    }

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

    let witnessData;
    if (isSegwit) {
      witnessData = TxWitnessData.fromStream(stream);
    }

    const locktime = Number(littleEndianToInteger(stream.read(4)));

    return isSegwit
      ? new Tx(version, inputs, outputs, locktime, isSegwit, witnessData)
      : new Tx(version, inputs, outputs, locktime);
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

    if (this.isSegwit) {
      stream.write(integerToLittleEndian(this.witnessMarker!, 1));
      stream.write(integerToLittleEndian(this.witnessFlag!, 1));
    }

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

    if (this.isSegwit) {
      stream.write(this.witnessData!.toBytes());
    }

    stream.write(integerToLittleEndian(this.locktime, 4));

    return stream.toBytes();
  }
}

export class TxWitnessData {
  stack: Uint8Array[]; // stack of witness data.

  constructor(stack: Uint8Array[]) {
    this.stack = stack;
  }

  static fromStream(stream: ByteStream) {
    const length = stream.readVarInt();
    const stack: Uint8Array[] = [];

    for (let i = 0; i < length; i++) {
      const itemLength = stream.readVarInt();
      const stackItem = stream.read(Number(itemLength));
      stack.push(stackItem);
    }

    return new TxWitnessData(stack);
  }

  toBytes() {
    const stream = new ByteStream();

    const length = this.stack.length;
    stream.write(encodeVarInt(length));

    for (const item of this.stack) {
      stream.write(encodeVarInt(item.length));
      stream.write(item);
    }

    return stream.toBytes();
  }
}
