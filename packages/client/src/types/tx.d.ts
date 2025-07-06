export type FormattedScript = {
  cmds: string[];
};

export type ScriptLE = {
  length: string;
  cmds: string;
};

export type TxInLE = {
  txid: string;
  vout: string;

  sequence: string;
  scriptSig: ScriptLE;
};

export type TxOutLE = {
  amount: string;
  scriptPubkey: ScriptLE;
};

export type WitnessDataLE = {
  stackLength: string; // varint
  stack: WitnessItemLE[];
};

export type WitnessItemLE = {
  itemLength: string; // varint
  item: string; // bytes
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
