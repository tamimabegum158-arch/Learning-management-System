import { config } from "./config";
import { useAuthStore } from "@/store/authStore";

async function getStoredToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  return useAuthStore.getState().accessToken;
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = config.apiUrl(path);
  const token = await getStoredToken();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  let res = await fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });

  if (res.status === 401 && token) {
    const refreshRes = await fetch(config.apiUrl("/api/auth/refresh"), {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
    });
    if (refreshRes.ok) {
      const data = (await refreshRes.json()) as { accessToken: string };
      useAuthStore.getState().setTokens(data.accessToken);
      const newToken = data.accessToken;
      (headers as Record<string, string>)["Authorization"] = `Bearer ${newToken}`;
      res = await fetch(url, { ...options, credentials: "include", headers });
    } else {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      throw new Error("Session expired");
    }
  }

  if (!res.ok) {
    const err = (await res.json().catch(() => ({}))) as { error?: unknown };
    const msg = err.error != null
      ? (typeof err.error === "string" ? err.error : JSON.stringify(err.error))
      : `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  if (res.status === 204 || res.headers.get("content-length") === "0") {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export async function apiPost<T = unknown>(
  path: string,
  body?: unknown
): Promise<T> {
  return apiFetch(path, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiGet<T = unknown>(path: string): Promise<T> {
  return apiFetch(path, { method: "GET" });
}

export async function apiPatch<T = unknown>(
  path: string,
  body?: unknown
): Promise<T> {
  return apiFetch(path, {
    method: "PATCH",
    body: body ? JSON.stringify(body) : undefined,
  });
}

export async function apiDelete<T = unknown>(path: string): Promise<T> {
  return apiFetch(path, { method: "DELETE" });
}
