const TOKEN_KEY = "calpal_token";

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t: string) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export type FieldError = { field: string; message: string };

export class ApiError extends Error {
  status: number;
  details?: FieldError[];
  constructor(status: number, message: string, details?: FieldError[]) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

type Options = { method?: string; body?: unknown };

export async function api<T>(path: string, options: Options = {}): Promise<T> {
  const token = tokenStore.get();
  const hasBody = options.body !== undefined;

  let res: Response;
  try {
    res = await fetch(`/api${path}`, {
      method: options.method ?? "GET",
      headers: {
        ...(hasBody ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: hasBody ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Can't reach the server. Is it running?");
  }

  if (res.status === 204) return undefined as T;
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    // An expired or invalid token on a protected call means: log out.
    if (res.status === 401 && token && !path.startsWith("/auth")) {
      window.dispatchEvent(new Event("auth:expired"));
    }
    throw new ApiError(res.status, data.error ?? "Something went wrong", data.details);
  }
  return data as T;
}