'use client';

import { useState, useCallback, useEffect } from 'react';

function getDefaultDates() {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  const fmt = (d: Date) => d.toISOString().split('T')[0];
  return { desde: fmt(firstDay), hasta: fmt(lastDay) };
}

export interface FiltersState {
  desde: string;
  hasta: string;
  pais: string;
  asesor: string;
  tipoLead: string;
  origen: string;
}

export function useFilters() {
  const [filters, setFilters] = useState<FiltersState>(() => {
    if (typeof window === 'undefined') return { desde: '', hasta: '', pais: '', asesor: '', tipoLead: '', origen: '' };
    const defaults = getDefaultDates();
    return { ...defaults, pais: '', asesor: '', tipoLead: '', origen: '' };
  });

  const handleFilterChange = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleFiltrar = useCallback(() => {
    // Filters are applied reactively, nothing needed here
  }, []);

  const handleLimpiar = useCallback(() => {
    const defaults = getDefaultDates();
    setFilters({ ...defaults, pais: '', asesor: '', tipoLead: '', origen: '' });
    window.location.reload();
  }, []);

  return { filters, handleFilterChange, handleFiltrar, handleLimpiar };
}

export function useFiltersInit() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const getInitialFilters = useCallback((): FiltersState => {
    if (!mounted) return { desde: '', hasta: '', pais: '', asesor: '', tipoLead: '', origen: '' };
    const defaults = getDefaultDates();
    return { ...defaults, pais: '', asesor: '', tipoLead: '', origen: '' };
  }, [mounted]);

  return { mounted, getInitialFilters };
}
