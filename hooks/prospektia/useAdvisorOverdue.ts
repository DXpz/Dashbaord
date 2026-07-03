import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/lib/auth-context';
import { API } from '@/services/api';

export interface OverdueEvent {
  id: number;
  audit_id: number;
  client_id: string;
  stage: number;
  deadline: string;
  triggered_at: string;
  acknowledged: boolean;
  acknowledged_at: string | null;
  country: string;
}

export interface AdvisorOverdueSummary {
  advisor_id: number;
  advisor_name: string;
  country: string;
  total_vencidos: number;
  stage_2_vencidos: number;
  stage_3_vencidos: number;
  stage_4_vencidos: number;
  stage_5_vencidos: number;
  acknowledge_count: number;
}

export interface AdvisorOverdueDetail {
  advisor_id: number;
  summary: {
    total_vencidos: number;
    stage_2_vencidos: number;
    stage_3_vencidos: number;
    stage_4_vencidos: number;
    stage_5_vencidos: number;
  };
  events: OverdueEvent[];
}

export interface OverdueFilters {
  asesor?: string;
  desde?: string;
  hasta?: string;
  pais?: string;
}

export function useAdvisorOverdue(filters?: OverdueFilters) {
  const { user } = useAuth();
  const [advisors, setAdvisors] = useState<AdvisorOverdueSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalEvents, setTotalEvents] = useState(0);

  const fetchList = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const json = await API.advisorOverdueList({
        asesor: filters?.asesor || undefined,
        desde: filters?.desde || undefined,
        hasta: filters?.hasta || undefined,
        pais: filters?.pais || undefined,
      });
      setAdvisors(json.advisors || []);
      setTotalEvents(json.total_events || 0);
    } catch (err: any) {
      setError(err.message || 'Error al cargar métricas de etapas');
    } finally {
      setLoading(false);
    }
  }, [user, filters?.asesor, filters?.desde, filters?.hasta, filters?.pais]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  return { advisors, loading, error, totalEvents, refetch: fetchList };
}

export function useAdvisorOverdueDetail(advisorId: string | null, filters?: OverdueFilters) {
  const { user } = useAuth();
  const [detail, setDetail] = useState<AdvisorOverdueDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetail = useCallback(async () => {
    if (!user || !advisorId) return;
    setLoading(true);
    setError(null);
    try {
      const json = await API.advisorOverdueDetail(advisorId, {
        desde: filters?.desde || undefined,
        hasta: filters?.hasta || undefined,
        pais: filters?.pais || undefined,
      });
      setDetail(json);
    } catch (err: any) {
      setError(err.message || 'Error al cargar detalle del asesor');
    } finally {
      setLoading(false);
    }
  }, [user, advisorId, filters?.desde, filters?.hasta]);

  useEffect(() => {
    fetchDetail();
  }, [fetchDetail]);

  return { detail, loading, error, refetch: fetchDetail };
}

export function useAcknowledgeEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const acknowledge = useCallback(async (eventId: number): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      await API.advisorOverdueAcknowledge(eventId);
      return true;
    } catch (err: any) {
      setError(err.message || 'Error al confirmar evento');
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { acknowledge, loading, error };
}
