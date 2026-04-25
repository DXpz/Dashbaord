'use client';

import { useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { KPICard } from '@/components/kpi/KPICard';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { useDashboard, useConnectionStatus, useAsesores, useFilters } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, Target, TrendingUp } from 'lucide-react';

const COLORS = {
  dark: '#1F1D3D',
  medium: '#35325B',
  light: '#B5B5AE',
  blue: '#145478',
  green: '#22c55e',
  orange: '#f97316',
  purple: '#7c3aed',
};

const CANAL_COLORS = [COLORS.blue, COLORS.dark, COLORS.medium, COLORS.green, COLORS.orange, COLORS.purple];

export default function OrigenLeadsPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { data, loading, error } = useDashboard(filters);
  const connectionStatus = useConnectionStatus();
  const AsesoresOptions = useAsesores(filters).map((a) => ({ value: a, label: a }));

  const fuenteData = data?.fuente_data || {};
  const distribution = fuenteData?.distribution || {};
  const evolution = fuenteData?.evolution || {};

  const totalLeads = data?.Origenleads?.total_leads || fuenteData.total_leads || 0;
  const topCanal = data?.Origenleads?.top_canal || fuenteData.top_canal || '—';
  const muestra = data?.Origenleads?.muestra || fuenteData.muestra || 0;

  const distChartData = useMemo(() => {
    const labels = distribution.labels || [];
    const values = distribution.values || [];
    if (!labels.length) return null;
    return { labels, values };
  }, [distribution]);

  const evoChartData = useMemo(() => {
    const labels = evolution.labels || [];
    if (!labels.length) return null;
    const datasets = (evolution.datasets || []).map((ds: any, i: number) => ({
      label: ds.label || ds.label_0 || 'Serie',
      data: ds.data || ds.values || [],
      backgroundColor: CANAL_COLORS[i % CANAL_COLORS.length],
      borderRadius: 4,
      borderSkipped: false,
    }));
    return { labels, datasets };
  }, [evolution]);

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
          <div className="grid grid-cols-3 gap-4">
            <KPICard label="Leads Totales" value={totalLeads} icon={Target} className="delay-1" />
            <KPICard label="Canal Principal" value={topCanal} icon={TrendingUp} className="delay-2" />
            <KPICard label="Registros" value={muestra} icon={Globe} className="delay-3" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <ChartCard title="Distribución por Canal">
                <ChartWrapper type="doughnut" data={{
                  labels: distChartData?.labels || [],
                  datasets: [{
                    data: distChartData?.values || [],
                    backgroundColor: CANAL_COLORS,
                    borderWidth: 0,
                  }],
                }} height="200px" />
              </ChartCard>
            </div>
            <div className="lg:col-span-3">
              <ChartCard title="Evolución Temporal">
                <ChartWrapper type="bar" data={{
                  labels: evoChartData?.labels || [],
                  datasets: evoChartData?.datasets || [],
                }} height="200px" />
              </ChartCard>
            </div>
          </div>

          {fuenteData.details?.length > 0 && (
            <div className="bg-white border border-[#EEEEEC]">
              <div className="px-5 py-4 border-b border-[#EEEEEC]">
                <h3 className="text-sm font-medium text-[#1F1D3D]">Detalle por Canal</h3>
              </div>
              <div className="p-4 space-y-2">
                {fuenteData.details.map((row: any, i: number) => (
                  <div
                    key={row.canal || i}
                    className="flex items-center justify-between p-3 rounded hover:bg-[#F5F5ED] transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: CANAL_COLORS[i % CANAL_COLORS.length] }} />
                      <span className="text-sm text-[#35325B]">{row.canal || '—'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-[#1F1D3D]">{row.leads || 0}</span>
                      <span className="text-xs text-[#B5B5AE]">{row.percentage || 0}%</span>
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