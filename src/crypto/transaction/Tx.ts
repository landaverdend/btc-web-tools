import { ByteStream } from '@/util/ByteStream';
import { hexToBytes, littleEndianToInteger, readVarInt } from '@/util/helper';

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
    const bytes = hexToBytes(hex);
    const stream = new ByteStream(bytes);

    const version = littleEndianToInteger(stream.read(4));
    const inputCount = readVarInt(bytes.slice(4, 13));

    const inputs = [];
    for (let i = 0; i < inputCount; i++) {

    }
  }
}

export class TxIn {
  prevTx: Tx;
  prevIndex: number; // index of the output in the previous transaction...
  scriptSig: string;
  sequence: number;

  constructor(prevTx: Tx, prevIndex: number, sequence: number, scriptSig?: string) {
    this.prevTx = prevTx;
    this.prevIndex = prevIndex;
    this.sequence = sequence;
    this.scriptSig = scriptSig ?? '';
  }

  toHex() {
    return '';
  }
}

export class TxOut {}
