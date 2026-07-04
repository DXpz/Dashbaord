'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './auth-context';

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, checked, loading } = useAuth();

  useEffect(() => {
    if (loading || !checked) return;
    if (!user) {
      router.replace('/login');
      return;
    }
    if (user.role === 'gestor_cobros') {
      router.replace('/cobros');
    } else if (user.role === 'gestor_ventas') {
      router.replace('/ventas');
    } else if (user.role === 'advisor') {
      router.replace('/vendedor');
    }
  }, [user, checked, loading, router]);

  if (loading || !checked) return null;
  if (user && (user.role === 'gestor_cobros' || user.role === 'gestor_ventas' || user.role === 'advisor')) {
    return null;
  }

  return <>{children}</>;
}
