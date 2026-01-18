import Tx from '@/btclib/transaction/Tx';
import { fetchTx } from '@api/api';
import { useState } from 'react';
import * as bitcoin from 'bitcoinjs-lib'

export function useFetchTx() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransaction = async (txid: string) => {
    if (!txid) {
      setError('Missing txid');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchTx(txid);

      const tx = Tx.fromHex(response.hex);
      for (const parent of Object.values(response.parents)) {
        const parentTx = Tx.fromHex(parent);
      }

      setError(null);
      return response;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchTransaction, isLoading, error };
}
