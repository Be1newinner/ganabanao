"use client";

import { createContext, use, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { api, ApiError } from "./api";
import type { User } from "./types";

/**
 * The signed-in user, loaded from the API once per page load and shared through
 * context. `user` is null when signed out and undefined while loading.
 */
interface SessionValue {
  user: User | null | undefined;
  refresh: () => Promise<User | null>;
  setUser: (user: User | null) => void;
  logout: () => Promise<void>;
}

const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children, scope = "user" }: { children: ReactNode; scope?: "user" | "admin" }) {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const mePath = scope === "admin" ? "/admin/auth/me" : "/auth/me";

  const refresh = useCallback(async () => {
    try {
      const { data } = await api.get<User>(mePath);
      setUser(data);
      return data;
    } catch (err) {
      if (err instanceof ApiError && (err.status === 401 || err.status === 403)) {
        setUser(null);
        return null;
      }
      throw err;
    }
  }, [mePath]);

  const logout = useCallback(async () => {
    await api.post(scope === "admin" ? "/admin/auth/logout" : "/auth/logout").catch(() => undefined);
    setUser(null);
  }, [scope]);

  useEffect(() => {
    refresh().catch(() => setUser(null));
  }, [refresh]);

  const value = useMemo(() => ({ user, refresh, setUser, logout }), [user, refresh, logout]);
  return <SessionContext value={value}>{children}</SessionContext>;
}

export function useSession(): SessionValue {
  const ctx = use(SessionContext);
  if (!ctx) throw new Error("useSession must be used within a SessionProvider");
  return ctx;
}
