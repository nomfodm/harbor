export type BackendStatus = 'operational' | 'maintenance' | 'down';

export interface ServiceStatus {
  id: string;
  label: string;
  ok: boolean;
  status?: BackendStatus;
}

const API_ROOT = (import.meta.env.VITE_API_URL as string).replace(/\/v\d+\/?$/, '');
const S3_URL = import.meta.env.VITE_S3_URL as string | undefined;

async function fetchWithTimeout(url: string, init?: RequestInit, ms = 6000): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  console.log(API_ROOT)
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

export async function checkBackend(): Promise<ServiceStatus> {
  try {
    const res = await fetchWithTimeout(API_ROOT + '/health');
    if (!res.ok) return { id: 'backend', label: 'Backend API', ok: false, status: 'down' };
    const data: { status?: string } = await res.json().catch(() => ({}));
    if (data.status === 'maintenance') {
      return { id: 'backend', label: 'Backend API', ok: false, status: 'maintenance' };
    }
    return { id: 'backend', label: 'Backend API', ok: true, status: 'operational' };
  } catch {
    return { id: 'backend', label: 'Backend API', ok: false, status: 'down' };
  }
}

export async function checkS3(): Promise<ServiceStatus | null> {
  if (!S3_URL) return null;
  try {
    const res = await fetchWithTimeout(S3_URL, { method: 'HEAD' });
    // 403 means the bucket is reachable but private — that's fine
    return { id: 's3', label: 'S3 Storage', ok: res.ok || res.status === 403 };
  } catch {
    return { id: 's3', label: 'S3 Storage', ok: false };
  }
}
