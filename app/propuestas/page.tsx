'use client';

import { useState } from 'react';
import { useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { KPICard } from '@/components/kpi/KPICard';
import { useAdminDashboard, useConnectionStatus, useAsesores, useFilters, useMotivosPerdida, usePropuestasPorRubro, useNegociacion } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, TrendingDown, Target, PieChart } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COLORS = {
  dark: '#1F1D3D',
  medium: '#35325B',
  light: '#B5B5AE',
  accent: '#EEEEEC',
  primary: '#1F1D3D',
};

export default function PropuestasPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { data, loading, error } = useAdminDashboard(filters);
  const { data: propuestasPorRubroData, loading: propuestasLoading } = usePropuestasPorRubro(filters);
  const { motivos, categorias, categorias_globales, loading: motivosLoading } = useMotivosPerdida(filters);
  const { data: negociacionData, loading: negociacionLoading } = useNegociacion(filters);
  const [viewMode, setViewMode] = useState<'asesor' | 'global'>('asesor');
  const connectionStatus = useConnectionStatus();
  const AsesoresOptions = useAsesores(filters).map((a) => ({ value: a, label: a }));

  const resumen = data?.resumen || {};
  const metricas = data?.metricas || {};
  const propuestasPorRubro = Array.isArray(propuestasPorRubroData) ? propuestasPorRubroData : [];
  const negociacion = negociacionData?.negociacion || {};
  const decisiones = negociacionData?.decisiones || {};
  const decGlobal = decisiones?.global || {};

  const motivosItems = viewMode === 'asesor' ? motivos : categorias_globales;

  const kpis = useMemo(() => ({
    cantidad: metricas.propuestas_registradas ?? resumen.propuestas_registradas ?? 0,
    cerradas: metricas.ventas_cerradas ?? resumen.ventas_cerradas ?? 0,
    perdidas: metricas.ventas_perdidas ?? resumen.ventas_perdidas ?? 0,
    tasaCierre: (metricas.propuestas_registradas ?? resumen.propuestas_registradas ?? 0) > 0
      ? ((metricas.ventas_cerradas ?? resumen.ventas_cerradas ?? 0) / (metricas.propuestas_registradas ?? resumen.propuestas_registradas ?? 1) * 100).toFixed(1)
      : '0.0',
  }), [metricas, resumen]);

  const rubroChartData = useMemo(() => {
    const arr = propuestasPorRubro;
    if (!arr.length) return null;
    return {
      labels: arr.map((r: any) => r.rubro || '—'),
      values: arr.map((r: any) => r.propuestas || r.cantidad || 0),
    };
  }, [propuestasPorRubro]);

  const tasaChartData = useMemo(() => {
    const arr = propuestasPorRubro;
    if (!arr.length) return null;
    return {
      labels: arr.map((r: any) => r.rubro || '—'),
      values: arr.map((r: any) => r.tasa_cierre_pct || r.tasa_cierre || r.tasa || 0),
    };
  }, [propuestasPorRubro]);

  const motivosChartData = useMemo(() => {
    if (!motivosItems.length) return null;
    const sorted = [...motivosItems].sort((a: any, b: any) => (b.total || b.veces || 0) - (a.total || a.veces || 0)).slice(0, 15);
    return {
      labels: sorted.map((m: any) => (m.categoria || m.motivo || m.motivo_perdida || m.texto || '—').substring(0, 30)),
      values: sorted.map((m: any) => m.total || m.veces || 0),
    };
  }, [motivosItems]);

  const decisionesChartData = useMemo(() => {
    const aceptados = decGlobal.aceptados ?? 0;
    const rechazados = decGlobal.rechazados ?? 0;
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
                  backgroundColor: COLORS.primary,
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
                  backgroundColor: COLORS.primary,
                  borderRadius: 4,
                  borderSkipped: false,
                }],
              }} height="240px" />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard
              title="Motivos de Pérdida"
              subtitle="Top 15"
              actions={
                <div className="flex gap-1">
                  <Button
                    variant={viewMode === 'asesor' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('asesor')}
                    className={`h-7 px-2 text-xs ${viewMode === 'asesor' ? 'bg-[#1F1D3D] text-white border-[#1F1D3D]' : 'border-[#EEEEEC] text-[#35325B] hover:bg-[#F5F5ED]'}`}
                  >
                    Por Asesor
                  </Button>
                  <Button
                    variant={viewMode === 'global' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('global')}
                    className={`h-7 px-2 text-xs ${viewMode === 'global' ? 'bg-[#1F1D3D] text-white border-[#1F1D3D]' : 'border-[#EEEEEC] text-[#35325B] hover:bg-[#F5F5ED]'}`}
                  >
                    Global
                  </Button>
                </div>
              }
            >
              <ChartWrapper type="bar" data={{
                labels: motivosChartData?.labels || [],
                datasets: [{
                  data: motivosChartData?.values || [],
                  backgroundColor: COLORS.primary,
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
                  backgroundColor: [COLORS.medium, COLORS.dark],
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