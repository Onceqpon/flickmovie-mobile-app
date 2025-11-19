import { useCallback, useEffect, useState } from "react";

const useLoadData = <T>(fetchFunction: () => Promise<T>, autoFetch = true) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    let isMounted = true;
    
    try {
      setLoading(true);
      setError(null);

      const result = await fetchFunction();
      
      if (isMounted) {
        setData(result);
      }
    } catch (err) {
      if (isMounted) {
        setError(
          err instanceof Error ? err : new Error("An unknown error occurred")
        );
      }
    } finally {
      if (isMounted) {
        setLoading(false);
      }
    }

    return () => {
        isMounted = false;
    };
  }, [fetchFunction]);

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (autoFetch) {
      fetchData();
    }
  }, [autoFetch, fetchData]);

  return { data, loading, error, refetch: fetchData, reset };
};

export default useLoadData;