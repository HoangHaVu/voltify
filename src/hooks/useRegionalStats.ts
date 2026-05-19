import { useState, useEffect } from 'react';
import { fetchRegionalLeadCount, fetchTotalLeadCount } from '../services/stats';

export function useRegionalStats(zip: string) {
  const [regionalCount, setRegionalCount] = useState<number>(0);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetchRegionalLeadCount(zip),
      fetchTotalLeadCount(),
    ])
      .then(([regional, total]) => {
        setRegionalCount(regional);
        setTotalCount(total);
      })
      .finally(() => setIsLoading(false));
  }, [zip]);

  return { regionalCount, totalCount, isLoading };
}
