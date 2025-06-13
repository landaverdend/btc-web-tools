export type FormattedScript = {
  cmds: string[];
};

export type ScriptLE = {
  cmds: string;
};

export type FormattedTxIn = {
  txid: string;
  vout: number;
  scriptSig: FormattedScript;
  sequence: number;
};

export type TxInLE = {
  txid: string;
  vout: string;

  sequence: string;
  scriptSig: ScriptLE;
};

export type FormattedTxOut = {
  amount: number;
  scriptPubkey: FormattedScript;
};
export type TxOutLE = {
  amount: string;
  scriptPubkey: ScriptLE;
};

export type FormattedWitnessStack = {
  stackLength: number;
  stack: string[];
};

export type WitnessStackLE = {
  stackLength: string;
  stack: string[];
};

export type FormattedTx = {
  version: number;

  marker?: number;
  flag?: number;
  witnesses?: FormattedWitnessStack[];

  inputs: FormattedTxIn[];
  outputs: FormattedTxOut[];

  locktime: number;
};

export type TxLE = {
  version: string;

  inputCount: string;
  inputs: TxInLE[];

  outputCount: string;
  outputs: TxOutLE[];
  locktime: string;

  marker?: string;
  flag?: string;
  witnesses?: WitnessStackLE[];
};
