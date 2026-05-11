'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useVendedorFilters } from '@/lib/vendedor-filters';
import { API } from '@/services/api';
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
};

export default function VendedorDashboard() {
  const { user, loading: authLoading } = useAuth();
  const { desde, hasta } = useVendedorFilters();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const prevAuthLoading = useRef(true);

  useEffect(() => {
    if (!user?.full_name) return;
    if (authLoading) return;
    setLoading(true);
    API.asesor(
      user.full_name,
      desde, hasta,
      user.country_code
    ).then(result => {
      setData(result);
      setLoading(false);
    }).catch(err => {
      console.error('Error:', err);
      setLoading(false);
    });
  }, [user?.full_name, authLoading, desde, hasta, refreshKey]);

  useEffect(() => {
    if (prevAuthLoading.current === true && authLoading === false) {
      setRefreshKey(k => k + 1);
    }
    prevAuthLoading.current = authLoading;
  }, [authLoading]);

  const metricas = data?.metricas || {};

  const kpis = useMemo(() => ({
    leads: metricas.leads_aceptados ?? 0,
    cerradosGanados: metricas.cerrados_ganados ?? 0,
    cerradosPerdidos: metricas.cerrados_perdidos ?? 0,
    tasaAceptacion: metricas.total_leads_general ? Math.round((metricas.leads_aceptados / metricas.total_leads_general) * 100) : 0,
    tasaCierre: metricas.cerrados_total ? Math.round((metricas.cerrados_ganados / metricas.cerrados_total) * 100) : 0,
    reunionesConRetro: metricas.reuniones_con_retro ?? 0,
    reunionesSinRetro: metricas.reuniones_sin_retro ?? 0,
    propuestas: metricas.propuestas_registradas ?? 0,
    seguimientos: metricas.seguimientos_registrados ?? 0,
  }), [metricas]);

  const reunionesChartData = useMemo(() => {
    return {
      labels: ['Con Retro', 'Sin Retro'],
      values: [kpis.reunionesConRetro, kpis.reunionesSinRetro],
    };
  }, [kpis.reunionesConRetro, kpis.reunionesSinRetro]);

  const cierreChartData = useMemo(() => {
    return {
      labels: ['Ganados', 'Perdidos'],
      values: [kpis.cerradosGanados, kpis.cerradosPerdidos],
    };
  }, [kpis.cerradosGanados, kpis.cerradosPerdidos]);

  const propuestaChartData = useMemo(() => {
    return {
      labels: ['Propuestas', 'Seguimientos'],
      values: [kpis.propuestas, kpis.seguimientos],
    };
  }, [kpis.propuestas, kpis.seguimientos]);

  if (authLoading || loading) {
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Reuniones" subtitle="Con vs Sin retroalimentación">
          <ChartWrapper type="doughnut" data={{
            labels: reunionesChartData.labels,
            datasets: [{
              data: reunionesChartData.values,
              backgroundColor: [COLORS.dark, COLORS.light],
              borderWidth: 0,
            }],
          }} height="200px" />
        </ChartCard>

        <ChartCard title="Estado de Cierre" subtitle="Ganados vs Perdidos">
          <ChartWrapper type="doughnut" data={{
            labels: cierreChartData.labels,
            datasets: [{
              data: cierreChartData.values,
              backgroundColor: [COLORS.dark, COLORS.medium],
              borderWidth: 0,
            }],
          }} height="200px" />
        </ChartCard>

        <ChartCard title="Oportunidades" subtitle="Propuestas y Seguimientos">
          <ChartWrapper type="doughnut" data={{
            labels: propuestaChartData.labels,
            datasets: [{
              data: propuestaChartData.values,
              backgroundColor: [COLORS.medium, COLORS.light],
              borderWidth: 0,
            }],
          }} height="200px" />
        </ChartCard>
      </div>

      <div className="bg-white border border-[#EEEEEC] p-5">
        <h3 className="text-sm font-medium text-[#1F1D3D] mb-4">Resumen de Desempeño</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div><span className="text-[#B5B5AE]">Reuniones con Retro</span><p className="text-lg font-semibold text-[#1F1D3D]">{kpis.reunionesConRetro}</p></div>
          <div><span className="text-[#B5B5AE]">Reuniones Sin Retro</span><p className="text-lg font-semibold text-[#1F1D3D]">{kpis.reunionesSinRetro}</p></div>
          <div><span className="text-[#B5B5AE]">Propuestas Registradas</span><p className="text-lg font-semibold text-[#1F1D3D]">{kpis.propuestas}</p></div>
          <div><span className="text-[#B5B5AE]">Seguimientos</span><p className="text-lg font-semibold text-[#1F1D3D]">{kpis.seguimientos}</p></div>
        </div>
      </div>
    </div>
  );
}