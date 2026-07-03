'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

export type EcosystemId = 'prospektia' | 'datared';

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
};

interface EcosystemContextType {
  ecosystem: EcosystemId;
  setEcosystem: (id: EcosystemId) => void;
  toggle: () => void;
}

const EcosystemContext = createContext<EcosystemContextType | null>(null);

const STORAGE_KEY = 'prospektia_ecosystem';
const VALID: EcosystemId[] = ['prospektia', 'datared'];

export function EcosystemProvider({ children }: { children: ReactNode }) {
  const [ecosystem, setEcosystemState] = useState<EcosystemId>('prospektia');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && (VALID as string[]).includes(stored)) {
        setEcosystemState(stored as EcosystemId);
      }
    } catch {
    } finally {
      setHydrated(true);
    }
  }, []);

  const setEcosystem = useCallback((id: EcosystemId) => {
    setEcosystemState(id);
    try {
      localStorage.setItem(STORAGE_KEY, id);
    } catch {
    }
  }, []);

  const toggle = useCallback(() => {
    setEcosystemState((prev) => {
      const next: EcosystemId = prev === 'prospektia' ? 'datared' : 'prospektia';
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
