'use client';

import { useState, useEffect, useCallback } from 'react';
import { API } from '@/services/api';

export interface FilterState {
  desde: string;
  hasta: string;
  pais: string;
  asesor: string;
}

export interface DashboardData {
  [key: string]: any;
  perdidos: number;
  reuniones: number;
  propuestas: number;
  pendientes: number;
  enProceso: number;
  cerrados: number;
  ventasCerradas: number;
  total_leads?: number;
  leads_aceptados?: number;
  leads_rechazados?: number;
  leads_pendientes?: number;
  leads_en_proceso?: number;
  leads_cerrados?: number;
  reuniones_count?: number;
  propuestas_count?: number;
  decisiones_aceptados?: number;
  decisiones_rechazados?: number;
  chart_leads?: any;
  chart_ventas?: any;
  chart_agendados?: any;
  chart_retro?: any;
  chart_decisiones?: any;
  chart_tiempo_respuesta?: any;
  chart_niveles_escalacion?: any;
  chart_propuestas_rubro?: any;
  chart_tasa_cierre?: any;
  chart_motivos?: any;
  chart_motivos_cat?: any;
  chart_negociacion_rubro?: any;
  chart_asesores?: any;
  Origenleads?: any;
  reuniones_data?: any[];
  asesores_data?: any[];
  fuente_data?: any;
}

export function useDashboard(filters: FilterState) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('[useDashboard] fetching with filters:', filters);
      const result = await API.dashboard(
        filters.desde,
        filters.hasta,
        30,
        40,
        { pais: filters.pais, nombre: filters.asesor }
      );
      console.log('[useDashboard] result keys:', Object.keys(result || {}));
      console.log('[useDashboard] resumen fields:', Object.keys(result?.resumen || {}));
      setData(result as DashboardData);
    } catch (err: any) {
      const message = err?.message || err?.cause?.message || 'Error al cargar datos';
      console.error('[useDashboard] error:', message);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [filters.desde, filters.hasta, filters.pais, filters.asesor]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'connecting' | 'error'>('connecting');

  useEffect(() => {
    const checkConnection = async () => {
      setStatus('connecting');
      try {
        const pong = await API.ping();
        setStatus(pong ? 'connected' : 'error');
      } catch {
        setStatus('error');
      }
    };

    checkConnection();
    const interval = setInterval(checkConnection, 120000);
    return () => clearInterval(interval);
  }, []);

  return status;
}

export function useAsesores(filters: FilterState) {
  const [asesores, setAsesores] = useState<string[]>([]);

  useEffect(() => {
    const fetchAsesores = async () => {
      try {
        const result = await API.listaAsesores(filters.desde, filters.hasta, filters.asesor || undefined, filters.pais || undefined);
        if (Array.isArray(result)) {
          setAsesores(result.map((a: any) => typeof a === 'string' ? a : a.nombre || a.nombre_vendedor || '').filter(Boolean));
        }
      } catch (err) {
        console.error('Error fetching asesores:', err);
      }
    };
    fetchAsesores();
  }, [filters.desde, filters.hasta, filters.pais, filters.asesor]);

  return asesores;
}

export function useListaAsesores(filters: FilterState) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const result = await API.listaAsesores(filters.desde, filters.hasta, undefined, filters.pais || undefined);
        const arr = Array.isArray(result) ? result : (result?.asesores || result?.items || []);
        setData(arr);
      } catch (err) {
        console.error('Error fetching lista-asesores:', err);
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [filters.desde, filters.hasta, filters.pais]);

  return { data, loading };
}

export function useAdvisorsForEdit(filters: FilterState) {
  const [advisors, setAdvisors] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    const fetchAdvisors = async () => {
      try {
        const isHttps = typeof window !== 'undefined' && window.location.protocol === 'https:';
        const path = encodeURIComponent('advisors/round-robin');
        const url = isHttps ? `/api/proxy?_path=${path}` : `http://200.35.189.139/api/advisors/round-robin`;
        const res = await fetch(url, {
          headers: {
            'x-api-key': 'RedApi_2026_SuperSegura_9XK2',
            ...(isHttps ? {} : { 'ngrok-skip-browser-warning': 'true' })
          }
        });
        const data = await res.json();
        if (cancelled) return;
        if (data?.advisors && Array.isArray(data.advisors)) {
          const names = data.advisors.map((a: any) => a.nombre_vendedor || a.nombre || '');
          setAdvisors([...new Set(names)].filter(Boolean).sort());
        } else if (data?.items && Array.isArray(data.items)) {
          const names = data.items.map((a: any) => a.nombre_vendedor || a.nombre || '');
          setAdvisors([...new Set(names)].filter(Boolean).sort());
        }
      } catch (err) {
        console.error('Error fetching advisors list:', err);
      }
    };
    fetchAdvisors();
    return () => { cancelled = true; };
  }, []);

  return advisors;
}

export function useStages() {
  const [stages, setStages] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const d = await API.dashboard('2024-01-01', '2026-12-31', 30, 40, {});
        const s = d?.stages || [];
        setStages(s);
      } catch (err) {
        console.error('Error fetching stages:', err);
      }
    };
    fetch();
  }, []);

  return stages;
}

export function useReuniones(filters: FilterState) {
  const [reuniones, setReuniones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReuniones = async () => {
      setLoading(true);
      setError(null);
      try {
        const desde = filters.desde ? `${filters.desde}T00:00:00` : undefined;
        const hasta = filters.hasta ? `${filters.hasta}T23:59:59.999` : undefined;
        console.log('[useReuniones] fetching:', { desde, hasta, pais: filters.pais });
        const result = await API.reuniones(desde ?? '', hasta ?? '', 200, 0, {});
        console.log('[useReuniones] raw result:', result);
        const list = result?.reuniones ?? result?.items ?? (Array.isArray(result) ? result : []);
        console.log('[useReuniones] setReuniones:', list.length, 'items');
        setReuniones(Array.isArray(list) ? list : []);
      } catch (err: any) {
        console.error('[useReuniones] error:', err);
        setError(err.message || 'Error al cargar reuniones');
      } finally {
        setLoading(false);
      }
    };
    fetchReuniones();
  }, [filters.desde, filters.hasta, filters.pais]);

  return { reuniones, loading, error };
}

export function useFuentes(filters: FilterState) {
  const [fuentes, setFuentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFuentes = async () => {
      setLoading(true);
      try {
        const desde = filters.desde ? `${filters.desde}T00:00:00` : undefined;
        const hasta = filters.hasta ? `${filters.hasta}T23:59:59.999` : undefined;
        const result = await API.fuentes(desde ?? '', hasta ?? '', {});
        const list = result?.fuentes || result?.items || result || [];
        setFuentes(Array.isArray(list) ? list : []);
      } catch (err) {
        console.error('Error fetching fuentes:', err);
        setFuentes([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFuentes();
  }, [filters.desde, filters.hasta, filters.pais]);

  return { fuentes, loading };
}