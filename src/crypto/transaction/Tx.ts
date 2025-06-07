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
