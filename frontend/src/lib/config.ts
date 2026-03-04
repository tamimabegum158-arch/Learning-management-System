const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:4000";

export const config = {
  apiBaseUrl: API_BASE_URL,
  apiUrl: (path: string) => `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`,
};
