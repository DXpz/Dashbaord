'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { API } from '@/services/api';
import { useAuth } from '@/lib/auth-context';

export interface FilterState {
  desde: string;
  hasta: string;
  pais: string;
  asesor: string;
  tipoLead: string;
  origen: string;
  tipoLlamada: string;
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

export function useDashboard(filters: FilterState | null) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    if (!filters || !filters.asesor) return;
    setLoading(true);
    setError(null);
    try {
      const result = await API.dashboard(
        filters.desde,
        filters.hasta,
        { pais: filters.pais, nombre: filters.asesor, asesor: filters.asesor, tipoLead: filters.tipoLead, origen: filters.origen }
      );
      setData(result as DashboardData);
    } catch (err: any) {
      const message = err?.message || err?.cause?.message || 'Error al cargar datos';
      console.error('[useDashboard] error:', message);
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  }, [filters?.desde, filters?.hasta, filters?.pais, filters?.asesor, filters?.tipoLead, filters?.origen]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: fetchData };
}

export function useAdminDashboard(filters: FilterState | null) {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const lastFetchRef = useRef<{ desde: string; hasta: string; pais: string; asesor: string; tipoLead: string; origen: string; tipoLlamada: string } | null>(null);

  const fetchData = useCallback(async () => {
    if (!user) return;
    if (!filters || !filters.desde || !filters.hasta) {
      setLoading(true);
      setData(null);
      return;
    }

    const pais = filters.pais || user?.country_code || '';
    const filterKey = { desde: filters.desde, hasta: filters.hasta, pais, asesor: filters.asesor || '', tipoLead: filters.tipoLead || '', origen: filters.origen || '', tipoLlamada: filters.tipoLlamada || '' };
    if (lastFetchRef.current?.desde === filterKey.desde &&
        lastFetchRef.current?.hasta === filterKey.hasta &&
        lastFetchRef.current?.pais === filterKey.pais &&
        lastFetchRef.current?.asesor === filterKey.asesor &&
        lastFetchRef.current?.tipoLead === filterKey.tipoLead &&
        lastFetchRef.current?.origen === filterKey.origen &&
        lastFetchRef.current?.tipoLlamada === filterKey.tipoLlamada) {
      return;
    }
    lastFetchRef.current = filterKey;

    setLoading(true);
    setError(null);
    try {
      console.log('[useAdminDashboard] fetching:', { desde: filters.desde, hasta: filters.hasta, pais, asesor: filters.asesor, tipoLead: filters.tipoLead, origen: filters.origen, tipoLlamada: filters.tipoLlamada });
      let result: any;

      if (filters.asesor) {
        const asesorData = await API.asesor(filters.asesor, filters.desde, filters.hasta, pais, filters.tipoLead, filters.origen, filters.tipoLlamada);
        const m = asesorData.metricas || {};
        result = {
          metricas: {
            total_auditorias: m.total_leads_general || 0,
            leads_aceptados: m.leads_aceptados || 0,
            leads_rechazados: m.leads_rechazados || 0,
            leads_pendientes_decision: m.leads_pendientes || 0,
            reuniones_con_retro: m.reuniones_con_retro || 0,
            reuniones_sin_retro: m.reuniones_sin_retro || 0,
            propuestas_registradas: m.propuestas_registradas || 0,
            total_propuestas: m.total_propuestas || 0,
            seguimientos_registrados: m.seguimientos_registrados || 0,
            ventas_cerradas: m.cerrados_ganados || 0,
            ventas_perdidas: m.cerrados_perdidos || 0,
            leads_no_agendados: 0,
            total_equipos: m.total_equipos || 0,
            atendidos_por_asesor: m.leads_aceptados || 0,
            atendidos_por_lider: 0,
            atendidos_por_gerente: 0,
          },
          resumen: {
            lead_no_calificado: 0,
            lead_calificado: m.leads_aceptados || 0,
            total_comercial: m.leads_aceptados || 0,
            total_lider: 0,
            total_gerencial: 0,
            atendidos_por_asesor: m.leads_aceptados || 0,
            atendidos_por_lider: 0,
            atendidos_por_gerente: 0,
          },
          stages: asesorData.stages || [],
          leads_por_stage: asesorData.leads_por_stage || [],
        };
      } else {
        result = await API.dashboard(
          filters.desde,
          filters.hasta,
          { pais, tipoLead: filters.tipoLead, origen: filters.origen, tipoLlamada: filters.tipoLlamada }
        );
      }

      console.log('[useAdminDashboard] result keys:', Object.keys(result || {}));
      setData(result as DashboardData);
    } catch (err: any) {
      const message = err?.message || err?.cause?.message || 'Error al cargar datos';
      console.error('[useAdminDashboard] error:', message);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [filters?.desde, filters?.hasta, filters?.pais, filters?.asesor, filters?.tipoLead, filters?.origen, filters?.tipoLlamada, user?.country_code]);

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
  const { user } = useAuth();
  const [asesores, setAsesores] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    if (!filters.desde || !filters.hasta) return;
    const fetchAsesores = async () => {
      try {
        const pais = filters.pais || user?.country_code || undefined;
        const result = await API.listaAsesores(filters.desde, filters.hasta, filters.asesor || undefined, pais, filters.tipoLead || undefined, filters.origen || undefined);
        const arr = Array.isArray(result) ? result : (result?.items || []);
        setAsesores(arr.map((a: any) => typeof a === 'string' ? a : a.asesor || a.nombre || a.nombre_vendedor || '').filter(Boolean));
      } catch (err) {
        console.error('Error fetching asesores:', err);
      }
    };
    fetchAsesores();
  }, [filters.desde, filters.hasta, filters.pais, filters.asesor, filters.tipoLead, filters.origen, user?.country_code]);

  return asesores;
}

export function useListaAsesores(filters: FilterState) {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      setLoading(true);
      try {
        const pais = filters.pais || user?.country_code || undefined;
        console.log('[useListaAsesores] fetching with pais:', pais);
        const result = await API.listaAsesores(filters.desde, filters.hasta, undefined, pais, filters.tipoLead || undefined, filters.origen || undefined);
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
  }, [filters.desde, filters.hasta, filters.pais, filters.tipoLead, filters.origen, user?.country_code]);

  return { data, loading };
}

export function useAdvisorsForEdit(filters: FilterState, countryCode?: string) {
  const [advisors, setAdvisors] = useState<{id: number; name: string}[]>([]);

  useEffect(() => {
    let cancelled = false;
    const fetchAdvisors = async () => {
      try {
        const params: Record<string, any> = { activo: undefined };
        const pais = countryCode || filters.pais;
        if (pais) {
          params.pais = pais;
        }
        const data = await API.advisorsList(params);
        if (cancelled) return;
        const list = Array.isArray(data) ? data : data?.advisors || [];
        const mapped = list.map((a: any) => ({
          id: a.id_vendedor || a.id || 0,
          name: a.nombre_vendedor || a.nombre || ''
        })).filter((a: any) => a.name);
        setAdvisors(mapped);
      } catch (err) {
        console.error('Error fetching advisors list:', err);
      }
    };
    fetchAdvisors();
    return () => { cancelled = true; };
  }, [filters.pais, countryCode]);

  return advisors;
}

export function useStages() {
  const [stages, setStages] = useState<any[]>([]);

  useEffect(() => {
    const fetch = async () => {
      try {
        const d = await API.dashboard('', '', {});
        const s = d?.stages || [];
        if (s.length > 0) {
          setStages(s);
        }
      } catch (err) {
        console.error('Error fetching stages from dashboard:', err);
      }
    };
    fetch();
  }, []);

  return stages;
}

export function useReuniones(filters: FilterState) {
  const { user } = useAuth();
  const [reuniones, setReuniones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchReuniones = useCallback(async () => {
    if (!user) return;
    if (!filters.desde || !filters.hasta) return;
    setLoading(true);
    setError(null);
    try {
const desde = filters.desde;
        const hasta = filters.hasta;
        const pais = filters.pais || user?.country_code;
        console.log('[useReuniones] fetching:', { desde, hasta, pais, asesor: filters.asesor, tipoLead: filters.tipoLead, origen: filters.origen, tipoLlamada: filters.tipoLlamada });
        const result = await API.reuniones(desde, hasta, 200, 0, { pais, asesor: filters.asesor || undefined, tipoLead: filters.tipoLead || undefined, origen: filters.origen || undefined, tipoLlamada: filters.tipoLlamada || undefined });
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
  }, [filters.desde, filters.hasta, filters.pais, filters.asesor, filters.tipoLead, filters.origen, filters.tipoLlamada, user?.country_code]);

  useEffect(() => {
    fetchReuniones();
  }, [fetchReuniones]);

  return { reuniones, loading, error, refetch: fetchReuniones };
}

export function useAllLeads(filters: FilterState) {
  const { user } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchLeads = async () => {
      setLoading(true);
      setError(null);
      try {
        const desde = filters.desde || undefined;
        const hasta = filters.hasta || undefined;
         const pais = filters.pais || user?.country_code;
         const result = await API.reuniones(desde ?? '', hasta ?? '', 200, 0, { pais, tipoLead: filters.tipoLead || undefined, origen: filters.origen || undefined });
        const list = result?.reuniones ?? result?.items ?? (Array.isArray(result) ? result : []);
        setLeads(Array.isArray(list) ? list : []);
      } catch (err: any) {
        setError(err.message || 'Error al cargar leads');
      } finally {
        setLoading(false);
      }
    };
    fetchLeads();
  }, [filters.desde, filters.hasta, filters.pais, filters.tipoLead, filters.origen, user?.country_code]);

  return { leads, loading, error };
}

export function useFuentes(filters: FilterState) {
  const { user } = useAuth();
  const [fuentes, setFuentes] = useState<any[]>([]);
  const [tiposLlamada, setTiposLlamada] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    const fetchFuentes = async () => {
      setLoading(true);
      try {
        const desde = filters.desde || undefined;
        const hasta = filters.hasta || undefined;
        const pais = filters.pais || user?.country_code;
        const result = await API.fuentes(desde ?? '', hasta ?? '', { pais, tipoLead: filters.tipoLead, origen: filters.origen });
        const list = result?.fuentes || result?.items || result || [];
        setFuentes(Array.isArray(list) ? list : []);
        setTiposLlamada(result?.tipos_llamada || []);
      } catch (err) {
        console.error('Error fetching fuentes:', err);
        setFuentes([]);
        setTiposLlamada([]);
      } finally {
        setLoading(false);
      }
    };
    fetchFuentes();
  }, [filters.desde, filters.hasta, filters.pais, filters.tipoLead, filters.origen, user?.country_code]);

  return { fuentes, tiposLlamada, loading };
}

export function useMotivosPerdida(filters: FilterState) {
  const { user } = useAuth();
  const [data, setData] = useState<{ motivos: any[]; categorias: any[]; categorias_globales: any[] }>({ motivos: [], categorias: [], categorias_globales: [] });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    if (!filters.desde || !filters.hasta) return;
    let cancelled = false;
    const fetchMotivos = async () => {
      setLoading(true);
      try {
        const pais = filters.pais || user?.country_code || undefined;
        const json = await API.motivosPerdida(filters.desde, filters.hasta, 50, filters.asesor || undefined, pais, filters.tipoLead || undefined, filters.origen || undefined);
        if (cancelled) return;
        const motivos = Array.isArray(json.motivos) ? json.motivos : [];
        const categorias = Array.isArray(json.categorias) ? json.categorias : [];
        const categorias_globales = Array.isArray(json.categorias_globales) ? json.categorias_globales : [];
        setData({ motivos, categorias, categorias_globales });
      } catch (err) {
        console.error('Error fetching motivos:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchMotivos();
    return () => { cancelled = true; };
  }, [filters.desde, filters.hasta, filters.pais, filters.asesor, filters.tipoLead, filters.origen, user?.country_code]);

  return { motivos: data.motivos, categorias: data.categorias, categorias_globales: data.categorias_globales, loading };
}

export function useNegociacion(filters: FilterState) {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchNegociacion = async () => {
      setLoading(true);
      try {
        const pais = filters.pais || user?.country_code || undefined;
        const json = await API.negociacion(filters.desde, filters.hasta, filters.asesor || undefined, pais, filters.tipoLead || undefined, filters.origen || undefined);
        if (cancelled) return;
        setData(json);
      } catch (err) {
        console.error('Error fetching negociacion:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchNegociacion();
    return () => { cancelled = true; };
  }, [filters.desde, filters.hasta, filters.pais, filters.asesor, filters.tipoLead, filters.origen, user?.country_code]);

  return { data, loading };
}

export function usePropuestasPorRubro(filters: FilterState) {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const fetchPropuestas = async () => {
      setLoading(true);
      try {
        const pais = filters.pais || user?.country_code || undefined;
        const json = await API.propuestasPorRubro(filters.desde, filters.hasta, 'rubro', filters.asesor || undefined, pais, filters.tipoLead || undefined, filters.origen || undefined);
        if (cancelled) return;
        const arr = json.propuestas_por_rubro || json.items || json || [];
        setData(Array.isArray(arr) ? arr : []);
      } catch (err) {
        console.error('Error fetching propuestas por rubro:', err);
        setData([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchPropuestas();
    return () => { cancelled = true; };
  }, [filters.desde, filters.hasta, filters.pais, filters.asesor, filters.tipoLead, filters.origen, user?.country_code]);

  return { data, loading };
}
