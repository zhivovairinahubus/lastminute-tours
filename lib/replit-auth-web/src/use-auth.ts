import { useState, useEffect, useCallback } from "react";
import type { AuthUser } from "@workspace/api-client-react";

export type { AuthUser };

interface AuthState {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
}

function getAuthApiUrl(path: string): string {
  const base = (import.meta.env.BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";
  return `${base}/api${path}`;
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(getAuthApiUrl("/auth/user"), { credentials: "include" })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<{ user: AuthUser | null }>;
      })
      .then((data) => {
        if (!cancelled) {
          setUser(data.user ?? null);
          setIsLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setUser(null);
          setIsLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(() => {
    const base = (import.meta.env.BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";
    window.location.href = `${base}/api/login?returnTo=${encodeURIComponent(`${base}/`)}`;
  }, []);

  const logout = useCallback(() => {
    const base = (import.meta.env.BASE_URL as string | undefined)?.replace(/\/+$/, "") ?? "";
    window.location.href = `${base}/api/logout`;
  }, []);

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
  };
}
