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
      const result = await API.dashboard(
        filters.desde,
        filters.hasta,
        30,
        40,
        { pais: filters.pais, nombre: filters.asesor }
      );
      setData(result as DashboardData);
    } catch (err: any) {
      setError(err.message || 'Error al cargar datos');
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
    const interval = setInterval(checkConnection, 30000);
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

export function useReuniones(filters: FilterState) {
  const [reuniones, setReuniones] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReuniones = async () => {
      setLoading(true);
      try {
        const desde = filters.desde ? `${filters.desde}T00:00:00` : undefined;
        const hasta = filters.hasta ? `${filters.hasta}T23:59:59.999` : undefined;
        const result = await API.reuniones(desde ?? '', hasta ?? '', 200, 0, {});
        setReuniones(result?.reuniones || result?.items || result || []);
      } catch (err) {
        console.error('Error fetching reuniones:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReuniones();
  }, [filters.desde, filters.hasta, filters.pais]);

  return { reuniones, loading };
}