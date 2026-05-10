'use client';

import { useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { KPICard } from '@/components/kpi/KPICard';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { useAdminDashboard, useConnectionStatus, useAsesores, useFilters } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, TrendingUp, DollarSign, Users, Calendar } from 'lucide-react';

const COLORS = {
  dark: '#1F1D3D',
  medium: '#35325B',
  light: '#B5B5AE',
  accent: '#EEEEEC',
  primary: '#1F1D3D',
};

export default function NegociacionPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { data, loading, error } = useAdminDashboard(filters);
  const connectionStatus = useConnectionStatus();
  const AsesoresOptions = useAsesores(filters).map((a) => ({ value: a, label: a }));

  const resumen = data?.resumen || {};
  const negociacion = data?.negociacion || {};
  const decisiones = data?.decisiones || {};
  const decGlobal = decisiones?.global || {};
  const porRubroNeg = negociacion?.por_rubro || [];

  const globalStats = negociacion?.global || {};

  const kpis = useMemo(() => ({
    seguimientos: resumen.seguimientos_registrados ?? 0,
    propuestas: resumen.propuestas_registradas ?? 0,
    aceptados: globalStats.negociaron ?? 0,
    rechazados: (globalStats.seguimientos_con_resumen ?? 0) - (globalStats.negociaron ?? 0),
    tasaAceptacion: globalStats.pct_negociaron_sobre_con_flag ?? '—',
  }), [resumen, globalStats]);

  const porRubroChartData = useMemo(() => {
    if (!porRubroNeg.length) return null;
    return {
      labels: porRubroNeg.map((r: any) => r.rubro || '—'),
      values: porRubroNeg.map((r: any) => r.casos || r.veces || 0),
    };
  }, [porRubroNeg]);

  const aceptaron = kpis.aceptados;
  const rechazaron = kpis.rechazados;
  const conversionChartData = (aceptaron + rechazaron) > 0 ? {
    labels: ['Aceptados', 'Rechazados'],
    values: [aceptaron, rechazaron],
  } : null;

  return (
    <Shell
      pageTitle="Negociación"
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
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-red-500">Error: {error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="Seguimientos" value={kpis.seguimientos} icon={Activity} className="delay-1" />
            <KPICard label="Propuestas" value={kpis.propuestas} icon={DollarSign} className="delay-2" />
            <KPICard label="Aceptados" value={kpis.aceptados} icon={TrendingUp} className="delay-3" />
            <KPICard label="Rechazados" value={kpis.rechazados} icon={Users} className="delay-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Seguimientos por Rubro">
              <ChartWrapper type="bar" data={{
                labels: porRubroChartData?.labels || [],
                datasets: [{
                  data: porRubroChartData?.values || [],
                  backgroundColor: COLORS.primary,
                  borderRadius: 4,
                  borderSkipped: false,
                }],
              }} height="280px" />
            </ChartCard>
            <ChartCard title="Tasa de Conversión" subtitle={`Tasa aceptación: ${kpis.tasaAceptacion}%`}>
              <ChartWrapper type="doughnut" data={{
                labels: conversionChartData?.labels || [],
                datasets: [{
                  data: conversionChartData?.values || [],
                  backgroundColor: [COLORS.medium, COLORS.dark],
                  borderWidth: 0,
                }],
              }} height="280px" />
            </ChartCard>
          </div>

          <div className="bg-white border border-[#EEEEEC] p-5">
            <h3 className="text-sm font-medium text-[#1F1D3D] mb-4">Resumen Global</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[#B5B5AE]">Con Resumen</span>
                <p className="text-lg font-semibold text-[#1F1D3D]">{globalStats.seguimientos_con_resumen ?? 0}</p>
              </div>
              <div>
                <span className="text-[#B5B5AE]">Negociaron</span>
                <p className="text-lg font-semibold text-[#1F1D3D]">{globalStats.negociaron ?? 0}</p>
              </div>
              <div>
                <span className="text-[#B5B5AE]">% Negociaron</span>
                <p className="text-lg font-semibold text-[#1F1D3D]">{globalStats.pct_negociaron_sobre_con_flag ?? '—'}</p>
              </div>
              <div>
                <span className="text-[#B5B5AE]">Con Flag</span>
                <p className="text-lg font-semibold text-[#1F1D3D]">{resumen.seguimientos_con_flag_negociacion ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}