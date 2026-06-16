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
        if (typeof window !== 'undefined') localStorage.removeItem('api_user');
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
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.detail || data.error || 'Error al iniciar sesión' };
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
      router.push(userData.role === 'advisor' ? '/vendedor' : '/');
      return { ok: true };
    } catch (e) {
      return { ok: false, error: 'No se pudo conectar al servidor' };
    }
  };

  const logout = async () => {
    setUser(null);
    setLoading(true);
    if (typeof window !== 'undefined') localStorage.removeItem('api_user');
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
    }
    router.push('/login');
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
