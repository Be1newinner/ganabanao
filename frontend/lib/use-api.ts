"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, type PageMeta } from "./api";

/**
 * Loads an API path on mount and whenever it changes. `refreshEvery` re-fetches
 * on a timer while `shouldRefresh(data)` is true — used only while a job is
 * still running, so a finished page makes no background requests.
 */
export function useApi<T>(
  path: string | null,
  opts: { refreshEvery?: number; shouldRefresh?: (data: T) => boolean } = {}
) {
  const [data, setData] = useState<T | undefined>();
  const [meta, setMeta] = useState<PageMeta | undefined>();
  const [error, setError] = useState<ApiError | undefined>();
  const [loading, setLoading] = useState(!!path);
  const optsRef = useRef(opts);
  optsRef.current = opts;

  const load = useCallback(async () => {
    if (!path) return;
    try {
      const res = await api.get<T>(path);
      setData(res.data);
      setMeta(res.meta);
      setError(undefined);
    } catch (err) {
      setError(err instanceof ApiError ? err : new ApiError(String(err), 0));
    } finally {
      setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    setLoading(!!path);
    void load();
  }, [load, path]);

  useEffect(() => {
    const { refreshEvery, shouldRefresh } = optsRef.current;
    if (!refreshEvery || data === undefined || !shouldRefresh?.(data)) return;
    const timer = setTimeout(() => void load(), refreshEvery);
    return () => clearTimeout(timer);
  }, [data, load]);

  return { data, meta, error, loading, reload: load, setData };
}
