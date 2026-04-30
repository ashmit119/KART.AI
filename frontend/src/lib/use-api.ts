/**
 * Reusable hook for client-side data fetching against the Node backend.
 * We use this instead of TanStack route loaders because all data lives on
 * an external API (CORS) — fetching on the client keeps the API client
 * out of SSR and works seamlessly with the JWT in localStorage.
 */
import { useEffect, useState, useCallback, DependencyList } from "react";

export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: DependencyList = [],
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetcher();
      setData(res);
    } catch (e: any) {
      setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  useEffect(() => {
    run();
  }, [run]);

  return { data, loading, error, refresh: run };
}
