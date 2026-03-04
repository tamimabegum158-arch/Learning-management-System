import { config } from "./config";
import { useAuthStore } from "@/store/authStore";

export interface LoginResponse {
  user: { id: number; email: string; name: string };
  accessToken: string;
}

export interface RegisterResponse {
  user: { id: number; email: string; name: string };
  accessToken: string;
}

export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const res = await fetch(config.apiUrl("/api/auth/login"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  const data = (await res.json()) as LoginResponse | { error: string };
  if (!res.ok) throw new Error((data as { error: string }).error ?? "Login failed");
  const out = data as LoginResponse;
  useAuthStore.getState().setAuth(out.user, out.accessToken);
  return out;
}

export async function register(
  email: string,
  password: string,
  name: string
): Promise<RegisterResponse> {
  const res = await fetch(config.apiUrl("/api/auth/register"), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  const data = (await res.json()) as RegisterResponse | { error: string };
  if (!res.ok) throw new Error((data as { error: string }).error ?? "Registration failed");
  const out = data as RegisterResponse;
  useAuthStore.getState().setAuth(out.user, out.accessToken);
  return out;
}

export async function logout(): Promise<void> {
  try {
    await fetch(config.apiUrl("/api/auth/logout"), {
      method: "POST",
      credentials: "include",
    });
  } finally {
    useAuthStore.getState().logout();
  }
}
