'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { API } from '@/services/api';
import { FiltersState } from '@/hooks/useFilters';
import { KPICard } from '@/components/kpi/KPICard';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { Skeleton } from '@/components/ui/skeleton';
import { Target, TrendingUp, Users, CheckCircle } from 'lucide-react';

const COLORS = {
  dark: '#1F1D3D',
  medium: '#35325B',
  light: '#B5B5AE',
  accent: '#EEEEEC',
  primary: '#1F1D3D',
};

export default function VendedorDashboard() {
  const { user } = useAuth();
  const [filters, setFilters] = useState<FiltersState>({
    desde: '',
    hasta: '',
    pais: user?.country_code || '',
    asesor: user?.full_name || '',
  });
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      console.log('[VendedorDashboard] fetchData called, asesor:', filters.asesor);
      const useAsesor = Boolean(filters.asesor && filters.asesor.trim());
      console.log('[VendedorDashboard] useAsesor:', useAsesor);
      const result = useAsesor
        ? await API.asesor(filters.asesor, filters.desde || '', filters.hasta || '', filters.pais || undefined)
        : await API.dashboard(filters.desde || '', filters.hasta || '', 30, 40, { pais: filters.pais || undefined });
      console.log('[VendedorDashboard] data loaded, resumen:', result?.resumen);
      setData(result);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [filters.desde, filters.hasta, filters.pais, filters.asesor, user?.full_name]);

  useEffect(() => {
    console.log('[VendedorDashboard] useEffect firing, user:', user?.full_name, 'asesor:', filters.asesor);
    fetchData();
  }, [fetchData, user?.full_name]);

  const resumen = data?.resumen || {};

  const kpis = useMemo(() => ({
    leads: resumen.leads_aceptados ?? 0,
    cerradosGanados: resumen.cerrados_ganados ?? 0,
    cerradosPerdidos: resumen.cerrados_perdidos ?? 0,
    tasaAceptacion: resumen.tasa_aceptacion ?? 0,
    tasaCierre: resumen.tasa_cierre_ganado ?? 0,
    reunionesConRetro: resumen.reuniones_con_retro ?? 0,
    reunionesSinRetro: resumen.reuniones_sin_retro ?? 0,
    propuestas: resumen.propuestas_registradas ?? 0,
    seguimientos: resumen.seguimientos_registrados ?? 0,
  }), [resumen]);

  const stagesChartData = useMemo(() => {
    const stages = data?.stages || [];
    if (!stages.length) return null;
    return {
      labels: stages.map((s: any) => s.label || s.nombre || '—'),
      values: stages.map((s: any) => s.leads || 0),
    };
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPICard label="Leads Aceptados" value={kpis.leads} icon={Users} className="delay-1" />
        <KPICard label="Cerrados Ganados" value={kpis.cerradosGanados} icon={CheckCircle} className="delay-2" />
        <KPICard label="Cerrados Perdidos" value={kpis.cerradosPerdidos} icon={Target} className="delay-3" />
        <KPICard label="Tasa Aceptación %" value={kpis.tasaAceptacion} icon={TrendingUp} className="delay-4" />
        <KPICard label="Tasa Cierre %" value={kpis.tasaCierre} icon={Target} className="delay-5" />
      </div>

      {stagesChartData && (
        <ChartCard title="Mis Leads por Etapa" subtitle="Pipeline actual">
          <ChartWrapper type="bar" data={{
            labels: stagesChartData.labels,
            datasets: [{
              data: stagesChartData.values,
              backgroundColor: COLORS.primary,
              borderRadius: 4,
              borderSkipped: false,
            }],
          }} height="280px" />
        </ChartCard>
      )}

      <div className="bg-white border border-[#EEEEEC] p-5">
        <h3 className="text-sm font-medium text-[#1F1D3D] mb-4">Resumen de Desempeño</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-[#B5B5AE]">Reuniones con Retro</span>
            <p className="text-lg font-semibold text-[#1F1D3D]">{kpis.reunionesConRetro}</p>
          </div>
          <div>
            <span className="text-[#B5B5AE]">Reuniones Sin Retro</span>
            <p className="text-lg font-semibold text-[#1F1D3D]">{kpis.reunionesSinRetro}</p>
          </div>
          <div>
            <span className="text-[#B5B5AE]">Propuestas Registradas</span>
            <p className="text-lg font-semibold text-[#1F1D3D]">{kpis.propuestas}</p>
          </div>
          <div>
            <span className="text-[#B5B5AE]">Seguimientos</span>
            <p className="text-lg font-semibold text-[#1F1D3D]">{kpis.seguimientos}</p>
          </div>
        </div>
      </div>
    </div>
  );
}