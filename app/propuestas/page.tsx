'use client';

import { useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { KPICard } from '@/components/kpi/KPICard';
import { useDashboard, useConnectionStatus, useAsesores, useFilters } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, TrendingDown, Target, PieChart } from 'lucide-react';

const COLORS = {
  dark: '#1F1D3D',
  medium: '#35325B',
  light: '#B5B5AE',
  red: '#c8151b',
  blue: '#145478',
  green: '#22c55e',
};

export default function PropuestasPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { data, loading, error } = useDashboard(filters);
  const connectionStatus = useConnectionStatus();
  const AsesoresOptions = useAsesores(filters).map((a) => ({ value: a, label: a }));

  const resumen = data?.resumen || {};
  const propuestasPorRubro = data?.propuestas_por_rubro || [];
  const motivosPerdida = data?.motivos_perdida || {};
  const negociacion = data?.negociacion || {};
  const decisiones = data?.decisiones || {};
  const decGlobal = decisiones?.global || {};

  const motivosItems = motivosPerdida?.items || [];
  const negociacionGlobal = negociacion?.global || {};
  const porRubroNeg = negociacion?.por_rubro || [];

  const kpis = useMemo(() => ({
    cantidad: resumen.propuestas_registradas ?? 0,
    cerradas: resumen.ventas_cerradas ?? 0,
    perdidas: resumen.ventas_perdidas ?? 0,
    tasaCierre: resumen.propuestas_registradas > 0
      ? ((resumen.ventas_cerradas / resumen.propuestas_registradas) * 100).toFixed(1)
      : '0.0',
  }), [resumen]);

  const rubroChartData = useMemo(() => {
    if (!propuestasPorRubro.length) return null;
    return {
      labels: propuestasPorRubro.map((r: any) => r.rubro || '—'),
      values: propuestasPorRubro.map((r: any) => r.cantidad || 0),
    };
  }, [propuestasPorRubro]);

  const tasaChartData = useMemo(() => {
    if (!propuestasPorRubro.length) return null;
    return {
      labels: propuestasPorRubro.map((r: any) => r.rubro || '—'),
      values: propuestasPorRubro.map((r: any) => r.tasa || 0),
    };
  }, [propuestasPorRubro]);

  const motivosChartData = useMemo(() => {
    if (!motivosItems.length) return null;
    const sorted = [...motivosItems].sort((a: any, b: any) => (b.count || 0) - (a.count || 0)).slice(0, 15);
    return {
      labels: sorted.map((m: any) => (m.texto || '—').substring(0, 30)),
      values: sorted.map((m: any) => m.count || 0),
    };
  }, [motivosItems]);

  const negociacionChartData = useMemo(() => {
    const conResumen = negociacionGlobal.seguimientos_con_resumen || 0;
    const negociaron = negociacionGlobal.negociaron || 0;
    if (conResumen === 0 && negociaron === 0) return null;
    return {
      labels: ['Con Resumen', 'En Negociación'],
      values: [conResumen, negociaron],
    };
  }, [negociacionGlobal]);

  const decisionesChartData = useMemo(() => {
    const aceptados = decGlobal.aceptados_total ?? 0;
    const rechazados = decGlobal.rechazados_total ?? 0;
    if (aceptados === 0 && rechazados === 0) return null;
    return {
      labels: ['Aceptados', 'Rechazados'],
      values: [aceptados, rechazados],
    };
  }, [decGlobal]);

  return (
    <Shell
      pageTitle="Propuestas"
      filters={filters}
      onFilterChange={handleFilterChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={AsesoresOptions}
      connectionStatus={connectionStatus}
    >
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (<Skeleton key={i} className="h-24" />))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-red-500">Error: {error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="Total Propuestas" value={kpis.cantidad} icon={FileText} className="delay-1" />
            <KPICard label="Cerradas" value={kpis.cerradas} icon={Target} className="delay-2" />
            <KPICard label="Perdidas" value={kpis.perdidas} icon={TrendingDown} className="delay-3" />
            <KPICard label="Tasa Cierre %" value={kpis.tasaCierre} icon={PieChart} className="delay-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Propuestas por Rubro" subtitle="Cantidad">
              <ChartWrapper type="bar" data={{
                labels: rubroChartData?.labels || [],
                datasets: [{
                  data: rubroChartData?.values || [],
                  backgroundColor: COLORS.blue,
                  borderRadius: 4,
                  borderSkipped: false,
                }],
              }} height="240px" />
            </ChartCard>
            <ChartCard title="Tasa de Cierre %" subtitle="Por rubro">
              <ChartWrapper type="bar" data={{
                labels: tasaChartData?.labels || [],
                datasets: [{
                  data: tasaChartData?.values || [],
                  backgroundColor: COLORS.red,
                  borderRadius: 4,
                  borderSkipped: false,
                }],
              }} height="240px" />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Motivos de Pérdida" subtitle="Top 15">
              <ChartWrapper type="bar" data={{
                labels: motivosChartData?.labels || [],
                datasets: [{
                  data: motivosChartData?.values || [],
                  backgroundColor: COLORS.red,
                  borderRadius: 4,
                  borderSkipped: false,
                }],
              }} height="240px" />
            </ChartCard>
            <ChartCard title="Decisiones" subtitle="Aceptar / Rechazar">
              <ChartWrapper type="doughnut" data={{
                labels: decisionesChartData?.labels || [],
                datasets: [{
                  data: decisionesChartData?.values || [],
                  backgroundColor: [COLORS.green, COLORS.red],
                  borderWidth: 0,
                }],
              }} height="240px" />
            </ChartCard>
          </div>
        </div>
      )}
    </Shell>
  );
}