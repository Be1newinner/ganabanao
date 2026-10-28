"use client";

import { useCallback, useEffect, useEffectEvent, useState } from "react";
import { api, ApiError, type PageMeta } from "./api";

interface Result<T> {
  path: string | null;
  data?: T;
  meta?: PageMeta;
  error?: ApiError;
}

const toApiError = (err: unknown) => (err instanceof ApiError ? err : new ApiError(String(err), 0));

/**
 * Loads an API path on mount and whenever it changes. `refreshEvery` re-fetches
 * on a timer while `shouldRefresh(data)` is true — used only while a job is
 * still running, so a finished page makes no background requests.
 *
 * `loading` is true until the current path has loaded; data from a previous
 * path is not shown while a new one loads (e.g. when a filter changes).
 */
export function useApi<T>(
  path: string | null,
  opts: { refreshEvery?: number; shouldRefresh?: (data: T) => boolean } = {}
) {
  const { refreshEvery, shouldRefresh } = opts;
  const [result, setResult] = useState<Result<T>>({ path: null });

  const fetchPath = useCallback(
    (p: string, isCurrent: () => boolean = () => true) =>
      api.get<T>(p).then(
        (res) => isCurrent() && setResult({ path: p, data: res.data, meta: res.meta }),
        (err: unknown) => isCurrent() && setResult((r) => ({ ...r, path: p, error: toApiError(err) }))
      ),
    []
  );

  useEffect(() => {
    if (!path) return;
    let current = true;
    void fetchPath(path, () => current);
    return () => {
      current = false;
    };
  }, [path, fetchPath]);

  const wantsRefresh = useEffectEvent((data: T) => !!refreshEvery && !!shouldRefresh?.(data));

  const fresh = result.path === path;
  const data = fresh ? result.data : undefined;

  useEffect(() => {
    if (!path || !fresh || data === undefined || !wantsRefresh(data)) return;
    let current = true;
    const timer = setTimeout(() => void fetchPath(path, () => current), refreshEvery);
    return () => {
      current = false;
      clearTimeout(timer);
    };
  }, [path, fresh, data, refreshEvery, fetchPath]);

  const reload = useCallback(async () => {
    if (path) await fetchPath(path);
  }, [path, fetchPath]);

  /** Local update after a mutation, e.g. adding a new song or removing a deleted one. */
  const setData = useCallback((update: (prev: T | undefined) => T | undefined) => {
    setResult((r) => ({ ...r, data: update(r.data) }));
  }, []);

  return {
    data,
    meta: fresh ? result.meta : undefined,
    error: fresh ? result.error : undefined,
    loading: !!path && !fresh,
    reload,
    setData,
  };
}
