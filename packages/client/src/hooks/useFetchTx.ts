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

      const tx = bitcoin.Transaction.fromHex(response.hex);

      const parents: Record<string, bitcoin.Transaction> = {};

      for (const [key, value] of Object.entries(response.parents)) {
        const parentTx = bitcoin.Transaction.fromHex(value);
        parents[key] = parentTx;
      }

      setError(null);
      return { transaction: tx, parents };
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  return { fetchTransaction, isLoading, error };
}
