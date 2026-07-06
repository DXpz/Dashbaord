'use client';

import { useAuth, ApiUser } from './auth-context';

export type EffectiveRole = ApiUser['role'] | 'super_admin';

export interface EffectiveUser {
  user: ApiUser | null;
  effectiveRole: EffectiveRole;
  isSuperAdmin: boolean;
  isGestorCobros: boolean;
  isGestorVentas: boolean;
  isAdmin: boolean;
  isAdvisor: boolean;
}

/**
 * Hook que devuelve el usuario con su rol efectivo.
 *
 * Por ahora el rol efectivo == rol real del backend.
 * En el futuro se podria agregar un RoleSimulator que sobrescriba
 * desde localStorage solo para demo local (sin tocar backend).
 */
export function useEffectiveUser(): EffectiveUser {
  const { user } = useAuth();

  const effectiveRole: EffectiveRole = user?.is_super_admin ? 'super_admin' : (user?.role as EffectiveRole) || 'advisor';

  return {
    user,
    effectiveRole,
    isSuperAdmin: user?.is_super_admin === true,
    isGestorCobros: user?.role === 'gestor_cobros',
    isGestorVentas: user?.role === 'gestor_ventas',
    isAdmin: user?.role === 'admin' || user?.is_super_admin === true,
    isAdvisor: user?.role === 'advisor',
  };
}