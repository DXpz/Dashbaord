'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { useEffectiveUser } from './role-context';

export type EcosystemId = 'prospektia' | 'datared' | 'cobros' | 'ventas';

export interface EcosystemMeta {
  id: EcosystemId;
  label: string;
  shortLabel: string;
  description: string;
}

export const ECOSYSTEMS: Record<EcosystemId, EcosystemMeta> = {
  prospektia: {
    id: 'prospektia',
    label: 'Red Intelfon',
    shortLabel: 'Red Intelfon',
    description: 'CRM de Leads y Pipeline de Ventas',
  },
  datared: {
    id: 'datared',
    label: 'DataRed',
    shortLabel: 'DataRed',
    description: 'Resguardo de Medios y Data Center',
  },
  cobros: {
    id: 'cobros',
    label: 'Cobros',
    shortLabel: 'Cobros',
    description: 'Facturacion y seguimiento de pagos',
  },
  ventas: {
    id: 'ventas',
    label: 'Ventas',
    shortLabel: 'Ventas',
    description: 'Modulo de ventas (pendiente)',
  },
};

interface EcosystemContextType {
  ecosystem: EcosystemId;
  setEcosystem: (id: EcosystemId) => void;
  toggle: () => void;
}

const EcosystemContext = createContext<EcosystemContextType | null>(null);

const STORAGE_KEY = 'prospektia_ecosystem';
const VALID: EcosystemId[] = ['prospektia', 'datared', 'cobros', 'ventas'];

const DEFAULT_BY_ROLE: Record<string, EcosystemId> = {
  gestor_cobros: 'cobros',
  gestor_ventas: 'ventas',
  // demas roles arrancan en prospektia
};

export function EcosystemProvider({ children }: { children: ReactNode }) {
  const [ecosystem, setEcosystemState] = useState<EcosystemId>('prospektia');
  const [hydrated, setHydrated] = useState(false);
  const { user, isSuperAdmin } = useEffectiveUser();

  // Cargar desde localStorage en mount, o default segun rol.
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (VALID as string[]).includes(stored)) {
        setEcosystemState(stored as EcosystemId);
      } else if (user?.role && DEFAULT_BY_ROLE[user.role]) {
        setEcosystemState(DEFAULT_BY_ROLE[user.role]);
      }
    } catch {
    } finally {
      setHydrated(true);
    }
  }, [user?.role]);

  // Cuando cambia el rol del usuario (login/logout), ajustar el ecosistema
  // si el actual no esta permitido para el nuevo rol.
  useEffect(() => {
    if (!user) return;
    const role = user.role;
    if (isSuperAdmin) return;
    // Si el ecosistema actual no esta en los permitidos del rol, switchear.
    const allowed: EcosystemId[] = role === 'gestor_cobros'
      ? ['cobros']
      : role === 'gestor_ventas'
        ? ['ventas']
        : role === 'admin' || role === 'manager'
          ? ['prospektia', 'datared', 'cobros']
          : role === 'advisor'
            ? ['prospektia']
            : ['prospektia'];
    if (!allowed.includes(ecosystem)) {
      const next = allowed[0];
      setEcosystemState(next);
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {}
    }
  }, [user?.role, isSuperAdmin, ecosystem]);

  const setEcosystem = useCallback((id: EcosystemId) => {
    setEcosystemState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
    }
  }, []);

  const toggle = useCallback(() => {
    setEcosystemState((prev) => {
      const idx = VALID.indexOf(prev);
      const next = VALID[(idx + 1) % VALID.length];
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
      }
      return next;
    });
  }, []);

  return (
    <EcosystemContext.Provider value={{ ecosystem, setEcosystem, toggle }}>
      {children}
    </EcosystemContext.Provider>
  );
}

export function useEcosystem() {
  const ctx = useContext(EcosystemContext);
  if (!ctx) throw new Error('useEcosystem must be used inside EcosystemProvider');
  return ctx;
}