export type FormattedScript = {
  cmds: string[];
};

export type FormattedTxIn = {
  prevTx: string;
  prevIndex: number;
  scriptSig: FormattedScript;
  sequence: number;
};


export type FormattedTxOut = {
  amount: number;
  scriptPubkey: FormattedScript;
}

export type FormattedTx = {
  version: number;
  inputs: FormattedTxIn[];
  outputs: FormattedTxOut[];
  locktime: number;
};
