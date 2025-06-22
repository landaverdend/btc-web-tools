async function fetchTx(txid: string, testnet = false) {
  const url = `/tx/${txid}${testnet ? '?testnet=true' : ''}`;

  const response = await fetch(url);
  if (response.status !== 200) {
    const errorText = await response.text();

    throw new Error(`HTTP ${response.status}: ${response.statusText}${errorText ? ` - ${errorText}` : ''}`);
  }

  const text = await response.text();

  return text;
}

export { fetchTx };
