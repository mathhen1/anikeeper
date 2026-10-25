import type { AuthMode } from '@/src/auth/AuthContext';

export function getAccountCacheKey(
  authMode: AuthMode,
  localName: string,
  officialUserId: string,
): string {
  if (authMode === 'official' && officialUserId) {
    return `official:${officialUserId}`;
  }

  if (authMode === 'local') return localName;
  return '';
}
