'use client';

import { useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { KPICard } from '@/components/kpi/KPICard';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { useFuentes, useConnectionStatus, useAsesores, useFilters } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, Target, TrendingUp } from 'lucide-react';

const COLORS = {
  dark: '#1F1D3D',
  medium: '#35325B',
  light: '#B5B5AE',
  accent: '#EEEEEC',
};

const CANAL_COLORS = [COLORS.dark, COLORS.medium, COLORS.light, COLORS.dark, COLORS.medium, COLORS.dark];

export default function OrigenLeadsPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { fuentes, loading } = useFuentes(filters);
  const connectionStatus = useConnectionStatus();
  const AsesoresOptions = useAsesores(filters).map((a) => ({ value: a, label: a }));

  const totalLeads = useMemo(() => {
    return fuentes.reduce((sum: number, f: any) => sum + (f.auditorias || 0), 0);
  }, [fuentes]);

  const topFuente = useMemo(() => {
    if (!fuentes.length) return '—';
    const sorted = [...fuentes].sort((a, b) => (b.auditorias || 0) - (a.auditorias || 0));
    return sorted[0]?.fuente || '—';
  }, [fuentes]);

  const distChartData = useMemo(() => {
    if (!fuentes.length) return null;
    const sorted = [...fuentes].sort((a, b) => (b.auditorias || 0) - (a.auditorias || 0));
    return {
      labels: sorted.map((f: any) => f.fuente || '—'),
      values: sorted.map((f: any) => f.auditorias || 0),
    };
  }, [fuentes]);

  return (
    <Shell
      pageTitle="Origen Leads"
      filters={filters}
      onFilterChange={handleFilterChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={AsesoresOptions}
      connectionStatus={connectionStatus}
    >
      {loading ? (
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (<Skeleton key={i} className="h-24" />))}
          </div>
          <Skeleton className="h-72" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-3 gap-4">
            <KPICard label="Leads Totales" value={totalLeads} icon={Target} className="delay-1" />
            <KPICard label="Canal Principal" value={topFuente} icon={TrendingUp} className="delay-2" />
            <KPICard label="Canales Activos" value={fuentes.length} icon={Globe} className="delay-3" />
          </div>

          {distChartData ? (
            <ChartCard title="Distribución por Canal" subtitle={`${fuentes.length} fuentes`}>
              <ChartWrapper type="doughnut" data={{
                labels: distChartData.labels,
                datasets: [{
                  data: distChartData.values,
                  backgroundColor: CANAL_COLORS,
                  borderWidth: 0,
                }],
              }} height="280px" />
            </ChartCard>
          ) : (
            <ChartCard title="Distribución por Canal">
              <div className="h-64 flex items-center justify-center text-[#B5B5AE] text-sm">Sin datos de fuentes</div>
            </ChartCard>
          )}

          {fuentes.length > 0 && (
            <div className="bg-white border border-[#EEEEEC]">
              <div className="px-5 py-4 border-b border-[#EEEEEC]">
                <h3 className="text-sm font-medium text-[#1F1D3D]">Detalle por Fuente</h3>
              </div>
              <div className="p-4 space-y-2">
                {[...fuentes].sort((a, b) => (b.auditorias || 0) - (a.auditorias || 0)).map((fuente: any, i: number) => (
                  <div
                    key={fuente.fuente || i}
                    className="flex items-center justify-between p-3 rounded hover:bg-[#F5F5ED] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CANAL_COLORS[i % CANAL_COLORS.length] }} />
                      <span className="text-sm text-[#35325B]">{fuente.fuente || '—'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-[#1F1D3D]">{fuente.auditorias ?? 0}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}