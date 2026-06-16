import type { ApiUser } from './auth';

export type PaisValue = 'SV' | 'GT' | 'ALL' | '';

export function isSuperAdminUser(user: ApiUser | null | undefined): boolean {
  if (!user) return false;
  if (user.is_super_admin === true) return true;
  if (user.email === 'ghenriquez@red.com.sv') return true;
  return false;
}

export function resolvePais(
  filtersPais: string | null | undefined,
  user: ApiUser | null | undefined,
  isSuperAdmin?: boolean
): PaisValue {
  const isSuper = isSuperAdmin ?? isSuperAdminUser(user);
  if (isSuper) {
    if (!filtersPais) return 'ALL';
    const upper = String(filtersPais).toUpperCase();
    if (upper === 'ALL' || upper === 'SV' || upper === 'GT') return upper;
    return 'ALL';
  }
  const userPais = String(user?.country_code || '').toUpperCase();
  if (userPais === 'SV' || userPais === 'GT') return userPais;
  return '';
}
