import { ByteStream } from '@/btclib/util/ByteStream';
import { bytesToHex, encodeVarInt, hexToBytes, integerToLittleEndian, littleEndianToInteger } from '@/btclib/util/helper';
import { FormattedWitnessStack, TxLE, WitnessDataLE, WitnessItemLE } from '@/types/tx';
import TxIn from './TxIn';
import TxOut from './TxOut';
import { Script } from '../../btclib/script/Script';
import { hash256 } from '../../btclib/hash/hashUtil';

const SIGHASH_ALL = 0x01;
const SIGHASH_NONE = 0x02;
const SIGHASH_SINGLE = 0x03;
const SIGHASH_ANYONECANPAY = 0x80;

export default class Tx {
  version: number;

  isSegwit: boolean;
  isCoinbase: boolean;
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
    segwitData?: { marker: number; flag: number; witnessData: TxWitnessData }
  ) {
    this.version = version;
    this.inputs = inputs;
    this.outputs = outputs;
    this.locktime = locktime;

    this.isCoinbase = this.checkIsCoinbase();

    this.isSegwit = isSegwit;
    if (isSegwit) {
      this.witnessMarker = segwitData?.marker;
      this.witnessFlag = segwitData?.flag;
      this.witnessData = segwitData?.witnessData;
    }
  }

  id() {
    const bytes = this.toBytes();

    return bytesToHex(hash256(bytes).reverse());
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
    let marker, flag;
    if (isSegwit) {
      marker = stream.read(1)[0];
      flag = stream.read(1)[0];
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
      witnessData = TxWitnessData.fromStream(stream, Number(inputCount));
    }

    const locktime = Number(littleEndianToInteger(stream.read(4)));

    return isSegwit
      ? new Tx(
          version,
          inputs,
          outputs,
          locktime,
          isSegwit,
          isSegwit ? { marker: marker!, flag: flag!, witnessData: witnessData! } : undefined
        )
      : new Tx(version, inputs, outputs, locktime);
  }

  sighash(inputIndex: number, prevScriptPubkey: Script) {
    const stream = new ByteStream();
    stream.write(integerToLittleEndian(this.version, 4));
    stream.write(encodeVarInt(this.inputs.length));

    for (let i = 0; i < this.inputs.length; i++) {
      const input = this.inputs[i];

      if (i === inputIndex) {
        const clone = input.clone();
        clone.scriptSig = prevScriptPubkey.clone();
        stream.write(clone.toBytes());
      } else {
        // Pass in original txin with empty script
        stream.write(new TxIn(input.txid, input.vout, input.sequence).toBytes());
      }
    }

    stream.write(encodeVarInt(this.outputs.length));
    for (const output of this.outputs) {
      stream.write(output.toBytes());
    }

    stream.write(integerToLittleEndian(this.locktime, 4));
    stream.write(integerToLittleEndian(SIGHASH_ALL, 4));

    let bytes = stream.toBytes();
    bytes = hash256(bytes);
    return bytes;
  }

  checkIsCoinbase() {
    if (this.inputs.length !== 1) return false;

    const firstInput = this.inputs[0];
    // initial txid is all zeros
    const isAllZeros = firstInput.txid.every((byte) => byte === 0);
    const isMaxVout = firstInput.vout === 0xffffffff;

    return isAllZeros && isMaxVout;
  }

  clone() {
    if (this.isSegwit) {
      return new Tx(this.version, this.inputs, this.outputs, this.locktime, this.isSegwit, {
        marker: this.witnessMarker!,
        flag: this.witnessFlag!,
        witnessData: this.witnessData!,
      });
    }

    return new Tx(this.version, this.inputs, this.outputs, this.locktime);
  }

  /**
   * Format the tx in hex and little endian format.
   **/
  formatLE(): TxLE {
    return {
      version: bytesToHex(integerToLittleEndian(this.version, 4)),

      marker: this.witnessMarker !== undefined ? bytesToHex(integerToLittleEndian(this.witnessMarker, 1)) : undefined,
      flag: this.witnessFlag ? bytesToHex(integerToLittleEndian(this.witnessFlag, 1)) : undefined,

      inputCount: bytesToHex(encodeVarInt(this.inputs.length)),
      inputs: this.inputs.map((input) => input.formatLE()),

      outputCount: bytesToHex(encodeVarInt(this.outputs.length)),
      outputs: this.outputs.map((output) => output.formatLE()),
      locktime: bytesToHex(integerToLittleEndian(this.locktime, 4)),

      witnesses: this.witnessData?.formatLE(),
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
  stack: Uint8Array[][]; // stack of witness data.

  constructor(stack: Uint8Array[][]) {
    this.stack = stack;
  }

  formatLE(): WitnessDataLE[] {
    const toRet: WitnessDataLE[] = [];

    for (const witness of this.stack) {
      const stackLength = bytesToHex(encodeVarInt(witness.length));

      const stackItems: WitnessItemLE[] = [];
      for (const item of witness) {
        const itemLength = bytesToHex(encodeVarInt(item.length));
        const itemBytes = bytesToHex(item);
        stackItems.push({ itemLength, item: itemBytes });
      }

      toRet.push({ stackLength, stack: stackItems });
    }

    return toRet;
  }

  format(): FormattedWitnessStack[] {
    return this.stack.map((witness) => ({
      stackLength: witness.length,
      stack: witness.map((item) => bytesToHex(item)),
    }));
  }

  static fromStream(stream: ByteStream, inputCount: number) {
    const witnessStacks: Uint8Array[][] = [];

    // For each input in the tx
    for (let i = 0; i < inputCount; i++) {
      const witnessItemCount = stream.readVarInt();
      const inputWitnessStack: Uint8Array[] = [];

      for (let j = 0; j < witnessItemCount; j++) {
        const itemLength = stream.readVarInt();
        const witnessItem = stream.read(Number(itemLength));
        inputWitnessStack.push(witnessItem);
      }

      witnessStacks.push(inputWitnessStack);
    }

    return new TxWitnessData(witnessStacks);
  }

  static fromJson(json: FormattedWitnessStack[]) {
    return new TxWitnessData(json.map((item) => item.stack.map((item) => hexToBytes(item))));
  }

  toBytes() {
    const stream = new ByteStream();

    for (const inputWitnessStack of this.stack) {
      stream.write(encodeVarInt(inputWitnessStack.length));

      for (const witnessItem of inputWitnessStack) {
        stream.write(encodeVarInt(witnessItem.length));
        stream.write(witnessItem);
      }
    }

    return stream.toBytes();
  }
}
