import { useState, useEffect, useRef, useCallback } from "react";

export default function useSuspenseCache({ key, fetcher, initial }) {
  const [data, setData] = useState(initial ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const mounted = useRef(true);
  const fetcherRef = useRef(fetcher);

  fetcherRef.current = fetcher;

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const execute = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcherRef.current(forceRefresh);
      if (mounted.current) {
        setData(result);
        setLoading(false);
      }
    } catch (err) {
      if (mounted.current) {
        setError(err);
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    execute();
  }, [key, execute]);

  return { data, loading, error, refresh: () => execute(true), revalidate: () => execute(false) };
}
