const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8100";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("xama_token");
}

export function setToken(token: string) {
  localStorage.setItem("xama_token", token);
}

export function clearToken() {
  localStorage.removeItem("xama_token");
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    clearToken();
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    throw new Error("No autenticado");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Error ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const API_BASE = API_URL;
