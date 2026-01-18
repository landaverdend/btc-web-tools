import { fetchTx } from '@api/api';
import { useState } from 'react';

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
