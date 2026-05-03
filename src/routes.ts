import type { PageId } from './types';

export const PAGE_PATHS: Record<PageId, string> = {
  main: '/',
  launcher: '/launcher',
  login: '/login',
  register: '/register',
  pa: '/account/profile',
  verify: '/verify-email',
};

export function pageFromPath(pathname: string): PageId {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/';

  if (normalizedPath === '/launcher') return 'launcher';
  if (normalizedPath === '/login') return 'login';
  if (normalizedPath === '/register') return 'register';
  if (normalizedPath === '/account' || normalizedPath.startsWith('/account/') || normalizedPath === '/account') return 'pa';

  return 'main';
}
