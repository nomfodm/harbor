import { apiFetch } from './client';

export interface LoginResponse {
  access_token: string;
}

export interface SessionResponse {
  id: string;
  user_agent: string | null;
  ip_address: string | null;
  created_at: string;
  last_used_at: string | null;
  is_revoked: boolean;
}

export function login(username: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
}

export function signup(username: string, email: string, password: string): Promise<LoginResponse> {
  return apiFetch<LoginResponse>('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ username, email, password }),
  });
}

export function logout(): Promise<void> {
  return apiFetch<void>('/auth/logout', { method: 'POST' });
}

export function getSessions(): Promise<SessionResponse[]> {
  return apiFetch<SessionResponse[]>('/auth/sessions');
}

export function revokeSession(id: string): Promise<void> {
  return apiFetch<void>(`/auth/sessions/${id}`, { method: 'DELETE' });
}

export function logoutOthers(password: string): Promise<void> {
  return apiFetch<void>('/auth/logout/others', {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}
