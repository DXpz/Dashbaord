'use client';

import { useEffect, useState } from 'react';
import { VentasAPI, VtCliente, VtDashboardKpis, VtReporteDiario } from '@/services/api/ventas';

export type VentasSource = 'backend' | 'unavailable';

export interface UseVentasState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  source: VentasSource;
}

export interface UseVentasListState extends UseVentasState<VtCliente[]> {}
export interface UseVentasDashboardState extends UseVentasState<VtDashboardKpis> {}
export interface UseVentasReporteState extends UseVentasState<VtReporteDiario> {}

/**
 * Hook que consulta el backend de Ventas via VentasAPI.
 * Si el backend no responde, retorna source='unavailable' y data=null
 * (la pagina debe mostrar mensaje de error, NO datos demo hardcoded).
 */
export function useVentasClientes(
  filtros: { estado?: string; satisfaccion?: string; search?: string } = {}
) {
  const [state, setState] = useState<UseVentasListState>({
    data: null,
    loading: true,
    error: null,
    source: 'unavailable',
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    VentasAPI.listClientes(filtros)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null, source: 'backend' });
      })
      .catch((err) => {
        if (!cancelled)
          setState({ data: null, loading: false, error: String(err), source: 'unavailable' });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtros.estado, filtros.satisfaccion, filtros.search]);

  return state;
}

export function useVentasDashboard() {
  const [state, setState] = useState<UseVentasDashboardState>({
    data: null,
    loading: true,
    error: null,
    source: 'unavailable',
  });

  useEffect(() => {
    let cancelled = false;
    VentasAPI.dashboard()
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null, source: 'backend' });
      })
      .catch((err) => {
        if (!cancelled)
          setState({ data: null, loading: false, error: String(err), source: 'unavailable' });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

export function useVentasReporteDiario(fecha?: string) {
  const [state, setState] = useState<UseVentasReporteState>({
    data: null,
    loading: true,
    error: null,
    source: 'unavailable',
  });

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true }));
    VentasAPI.reporteDiario(fecha)
      .then((data) => {
        if (!cancelled) setState({ data, loading: false, error: null, source: 'backend' });
      })
      .catch((err) => {
        if (!cancelled)
          setState({ data: null, loading: false, error: String(err), source: 'unavailable' });
      });
    return () => {
      cancelled = true;
    };
  }, [fecha]);

  return state;
}
