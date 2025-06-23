type APITxResponse = {
  txid: string;
  version: number;
  locktime: number;
  vin: Array<{
    txid: string;
    vout: number;
    prevout: {
      scriptpubkey: string;
      scriptpubkey_asm: string;
      scriptpubkey_type: string;
      value: number;
    };
    scriptsig: string;
    scriptsig_asm: string;
    is_coinbase: boolean;
    sequence: number;
  }>;
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

async function fetchTx(txid: string, testnet = false): Promise<APITxResponse> {
  const url = `/tx/${txid}${testnet ? '?testnet=true' : ''}`;

  const response = await fetch(url);
  if (response.status !== 200) {
    const errorText = await response.text();

    throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
  }

  const data = (await response.json()) as APITxResponse;

  return data;
}

export { fetchTx };
