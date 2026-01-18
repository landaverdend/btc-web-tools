
export type Vin = {
  txid: string;
  vout: number;
  prevout?: {
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    value: number;
  };
  scriptsig: string;
  scriptsig_asm: string;
  is_coinbase: boolean;
  sequence: number;
};

export type TxMetadata = {
  txid: string;
  version: number;
  locktime: number;
  vin: Array<Vin>;
  vout: Array<{
    scriptpubkey: string;
    scriptpubkey_asm: string;
    scriptpubkey_type: string;
    value: number;
  }>;
  size: number;
  weight: number;
  fee: number;
  status: {
    confirmed: boolean;
    block_height: number;
    block_hash: string;
    block_time: number;
  };
};

async function fetchTx(txid: string,): Promise<string> {
  const url = `/tx/${txid}`;

  const response = await fetch(url);
  if (response.status !== 200) {
    const errorText = await response.text();

    throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
  }

  return (await response.text());
}

export type Utxo = {
  txid: string;
  value: number;
  vout: number;
  scriptpubkey: string;
  status: {
    confirmed: boolean;
    block_height: number;
    block_time: number;
    block_hash: string;
  };
};

export { fetchTx };
