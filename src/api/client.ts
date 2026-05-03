import { useAppStore } from '../store/useAppStore';

const BASE = import.meta.env.VITE_API_URL as string;

export function friendlyError(err: unknown, fallback = 'Произошла ошибка'): string {
  if (err instanceof TypeError) return 'Сервер недоступен';
  if (err instanceof Error) return err.message || fallback;
  return fallback;
}

async function refreshAccessToken(): Promise<string> {
  const res = await fetch(BASE + '/auth/sessions/refresh', {
    method: 'POST',
    credentials: 'include',
  });
  if (!res.ok) throw new Error('refresh failed');
  const data: { access_token: string } = await res.json();
  return data.access_token;
}

export async function apiFetch<T>(path: string, init?: RequestInit, isRetry = false): Promise<T> {
  const token = useAppStore.getState().token;
  const isFormData = init?.body instanceof FormData;
  const res = await fetch(BASE + path, {
    ...init,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...init?.headers,
    },
    credentials: 'include',
  });

  // Only attempt token refresh when we actually had a token — a 401 on a
  // public endpoint (login, signup) with no token is a real auth error, not
  // an expiry that needs refreshing.
  if (res.status === 401 && !isRetry && token) {
    try {
      const newToken = await refreshAccessToken();
      useAppStore.getState().setToken(newToken);
      return apiFetch<T>(path, init, true);
    } catch {
      useAppStore.getState().setToken(null);
      useAppStore.getState().setUser(null);
      window.location.href = '/login';
      throw new Error('Сессия истекла');
    }
  }

  if (!res.ok) {
    let msg = res.statusText;
    try {
      const data: { detail?: string } = await res.json();
      msg = data.detail ?? msg;
    } catch {
      msg = await res.text().catch(() => msg);
    }
    throw new Error(msg);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}
