import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { auth as authApi } from "@/lib/api";
import type { AuthUser } from "@/lib/api/auth";

type AuthCtx = {
  user: AuthUser | null;
  isAdmin: boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
};

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const u = await authApi.getCurrentUser();
      setUser(u);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const signIn = useCallback(async (email: string, password: string) => {
    const res = await authApi.signIn(email, password);
    setUser(res.user);
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const res = await authApi.signUp(email, password);
    setUser(res.user);
  }, []);

  const signOut = useCallback(async () => {
    await authApi.signOut();
    setUser(null);
  }, []);

  return (
    <Ctx.Provider
      value={{
        user,
        isAdmin: !!user?.isAdmin,
        loading,
        signIn,
        signUp,
        signOut,
        refresh,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used inside AuthProvider");
  return c;
}
