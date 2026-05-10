'use client';

import { useState } from 'react';
import { useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { KPICard } from '@/components/kpi/KPICard';
import { useAdminDashboard, useConnectionStatus, useAsesores, useFilters, useMotivosPerdida } from '@/hooks';
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
  const { motivos, categorias, loading: motivosLoading } = useMotivosPerdida(filters);
  const [normalizadas, setNormalizadas] = useState(false);
  const connectionStatus = useConnectionStatus();
  const AsesoresOptions = useAsesores(filters).map((a) => ({ value: a, label: a }));

  const resumen = data?.resumen || {};
  const propuestasPorRubro = data?.propuestas_por_rubro || [];
  const motivosPerdida = data?.motivos_perdida || {};
  const negociacion = data?.negociacion || {};
  const decisiones = data?.decisiones || {};
  const decGlobal = decisiones?.global || {};

  const motivosItems = normalizadas ? categorias : motivos;
  const negociacionGlobal = negociacion?.global || {};
  const porRubroNeg = negociacion?.por_rubro || [];

  const kpis = useMemo(() => ({
    cantidad: resumen.propuestas_registradas ?? 0,
    cerradas: resumen.ventas_cerradas ?? 0,
    perdidas: resumen.ventas_perdidas ?? 0,
    tasaCierre: (resumen.propuestas_registradas ?? 0) > 0
      ? ((resumen.ventas_cerradas / resumen.propuestas_registradas) * 100).toFixed(1)
      : '0.0',
  }), [resumen]);

  const rubroChartData = useMemo(() => {
    const arr = data?.propuestas_por_rubro || [];
    if (!arr.length) return null;
    return {
      labels: arr.map((r: any) => r.rubro || '—'),
      values: arr.map((r: any) => r.propuestas || r.cantidad || 0),
    };
  }, [data]);

  const tasaChartData = useMemo(() => {
    const arr = data?.propuestas_por_rubro || [];
    if (!arr.length) return null;
    return {
      labels: arr.map((r: any) => r.rubro || '—'),
      values: arr.map((r: any) => r.tasa_cierre_pct || r.tasa || 0),
    };
  }, [data]);

const motivosChartData = useMemo(() => {
    if (!motivosItems.length) return null;
    const sorted = [...motivosItems].sort((a: any, b: any) => (b.veces || 0) - (a.veces || 0)).slice(0, 15);
    return {
      labels: sorted.map((m: any) => (m.categoria || m.motivo_perdida || m.texto || '—').substring(0, 30)),
      values: sorted.map((m: any) => m.veces || 0),
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
    const aceptados = negociacionGlobal.negociaron || 0;
    const rechazados = (negociacionGlobal.segui_mientos_con_resumen || 0) - aceptados;
    if (aceptados === 0 && rechazados === 0) return null;
    return {
      labels: ['Con Resumen', 'En Negociación'],
      values: [aceptados, rechazados],
    };
  }, [negociacionGlobal]);

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
                    variant={normalizadas ? 'outline' : 'default'}
                    size="sm"
                    onClick={() => setNormalizadas(false)}
                    className={`h-7 px-2 text-xs ${!normalizadas ? 'bg-[#1F1D3D] text-white border-[#1F1D3D]' : 'border-[#EEEEEC] text-[#35325B] hover:bg-[#F5F5ED]'}`}
                  >
                    Por Asesor
                  </Button>
                  <Button
                    variant={normalizadas ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setNormalizadas(true)}
                    className={`h-7 px-2 text-xs ${normalizadas ? 'bg-[#1F1D3D] text-white border-[#1F1D3D]' : 'border-[#EEEEEC] text-[#35325B] hover:bg-[#F5F5ED]'}`}
                  >
                    Normalizados
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