import { apiFetch, setAuthToken } from "./client";

export type AuthUser = {
  id: string;
  email: string;
  isAdmin?: boolean;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export async function signUp(email: string, password: string): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/auth/signup", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setAuthToken(res.token);
  return res;
}

export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
  setAuthToken(res.token);
  return res;
}

export async function signOut(): Promise<void> {
  try {
    await apiFetch("/auth/logout", { method: "POST" });
  } catch {
    // ignore — local logout still happens
  }
  setAuthToken(null);
}

/** Returns the current user from /auth/me, or null if not authenticated. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    return await apiFetch<AuthUser>("/auth/me");
  } catch {
    return null;
  }
}
