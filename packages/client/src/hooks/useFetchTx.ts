import { fetchTx } from '@api/api';
import { useState } from 'react';
import { useTxStore } from '@/state/txStore';

export function useFetchTx() {
  const { setSelectedInput } = useTxStore();

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // The General Idea: Fetch the transaction, set the selected input to zero.
  const fetchTransaction = async (txid: string, testnet: boolean) => {
    if (!txid) {
      setError('Missing txid');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetchTx(txid, testnet);

      // Set the initial selected input to zero.
      setSelectedInput(0);

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
