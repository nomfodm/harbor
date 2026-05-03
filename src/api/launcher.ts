import { apiFetch } from './client';

export type LauncherPlatform = 'windows' | 'macos' | 'linux';

export interface LatestReleaseResponse {
  version: string;
  platform: LauncherPlatform;
  download_url: string;
  file_size: number;
  released_at: string;
}

export function getLatestRelease(platform: LauncherPlatform): Promise<LatestReleaseResponse> {
  return apiFetch<LatestReleaseResponse>(`/launcher/releases/latest?platform=${platform}`);
}

export function detectPlatform(): LauncherPlatform {
  const ua = navigator.userAgent;
  if (ua.includes('Win')) return 'windows';
  if (ua.includes('Mac')) return 'macos';
  return 'linux';
}

export function formatFileSize(bytes: number): string {
  if (bytes >= 1024 * 1024) return `${(bytes / 1024 / 1024).toFixed(0)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${bytes} B`;
}
