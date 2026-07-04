'use client';

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface ApiUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
  country_code: string;
  is_active: boolean;
  is_super_admin?: boolean;
}

interface AuthContextType {
  user: ApiUser | null;
  loading: boolean;
  checked: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string; mustChangePassword?: boolean }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Keys de localStorage y sessionStorage que cachean estado por usuario.
 * Se limpian en login/logout para que el siguiente usuario NO vea datos
 * del anterior. Incluye caches de EcosystemContext, filtros de vendedor,
 * usuario actual (api_user), y prefijos genericos (cualquier cosa que
 * las paginas cacheen por usuario).
 */
const PER_USER_STORAGE_KEYS = [
  'api_user',
  'prospektia_ecosystem',
  'vendedor_filters',
  'prospektia_last_user_id',
];

const PER_USER_STORAGE_PREFIXES = [
  'swr-',
  'tanstack-query-',
  'react-query-',
  'prospektia_',
  'ventas_',
  'cobros_',
  'datared_',
];

function clearUserCache() {
  if (typeof window === 'undefined') return;
  try {
    // Borrar keys exactas
    PER_USER_STORAGE_KEYS.forEach((k) => {
      try {
        localStorage.removeItem(k);
        sessionStorage.removeItem(k);
      } catch {}
    });
    // Borrar keys por prefijo (caches de SWR, TanStack Query, etc.)
    const clean = (storage: Storage) => {
      const keys: string[] = [];
      for (let i = 0; i < storage.length; i++) {
        const k = storage.key(i);
        if (k && PER_USER_STORAGE_PREFIXES.some((p) => k.startsWith(p))) {
          keys.push(k);
        }
      }
      keys.forEach((k) => storage.removeItem(k));
    };
    clean(localStorage);
    clean(sessionStorage);
  } catch {}
}

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [checked, setChecked] = useState(false);
  const router = useRouter();

  const checkAuth = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me', { cache: 'no-store' });
      if (res.ok) {
        const userData = await res.json();
        const u = userData.user || userData.data || userData;
        setUser(u);
        if (typeof window !== 'undefined' && u?.email) {
          localStorage.setItem('api_user', JSON.stringify(u));
        }
      } else {
        setUser(null);
        clearUserCache();
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
      setChecked(true);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username: string, password: string): Promise<{ ok: boolean; error?: string; mustChangePassword?: boolean }> => {
    // Limpiar cache del usuario anterior ANTES de autenticar al nuevo.
    clearUserCache();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        // Login fallo: el cache ya esta limpio, dejar al usuario en /login.
        return { ok: false, error: data.detail || data.error || 'Error al iniciar sesión' };
      }
      const userData = data.user || data.data || data;
      if (userData.must_change_password) {
        setUser(userData);
        if (typeof window !== 'undefined' && userData?.email) {
          localStorage.setItem('api_user', JSON.stringify(userData));
        }
        return { ok: true, mustChangePassword: true };
      }
      setUser(userData);
      if (typeof window !== 'undefined' && userData?.email) {
        localStorage.setItem('api_user', JSON.stringify(userData));
      }
      const target = userData.role === 'advisor'
        ? '/vendedor'
        : userData.role === 'gestor_cobros'
          ? '/cobros'
          : userData.role === 'gestor_ventas'
            ? '/ventas'
            : '/';
      // Forzar recarga completa para reiniciar Providers con estado limpio
      // (EcosystemContext, hooks de TanStack/SWR, etc.) del usuario nuevo.
      if (typeof window !== 'undefined') {
        window.location.href = target;
      } else {
        router.push(target);
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'No se pudo conectar al servidor' };
    }
  };

  const logout = async () => {
    // Limpiar TODO el cache del usuario antes de redirigir al login.
    clearUserCache();
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
    }
    // Forzar recarga completa de la pagina para reiniciar Providers (EcosystemContext,
    // hooks de TanStack/SWR, etc.) con estado limpio. router.push mantiene los
    // Providers en memoria y el cache cacheado del usuario anterior se ve.
    if (typeof window !== 'undefined') {
      window.location.href = '/login?bye=1';
    } else {
      router.push('/login?bye=1');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, checked, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
