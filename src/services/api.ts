/**
 * Tiny wrapper around fetch() that:
 * • prefixes the base URL
 * • adds JSON / Authorization headers
 * • throws on HTTP errors or { success:false }
 */
const BASE_URL = 'http://localhost:5000';

type Failure = { success: false; error: string };

export async function apiFetch<T>(
  path: string,
  token?: string,
  init: RequestInit = {}
): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init.headers,
    },
  });

  const data: any = await res.json();
  if (!res.ok || (data && data.success === false)) {
    const msg = (data as Failure)?.error ?? 'Request failed';
    throw new Error(msg);
  }
  return data as T;
}
