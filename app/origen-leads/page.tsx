'use client';

import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { KPICard } from '@/components/kpi/KPICard';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { useDashboard, useConnectionStatus, useAsesores, useFilters } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Globe, Target, TrendingUp } from 'lucide-react';

function OrigenDonut({ data }: { data: any }) {
  if (!data?.labels) {
    return <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Sin datos</div>;
  }

  return <ChartWrapper type="doughnut" data={{
    labels: data.labels,
    datasets: [{
      data: data.values || [],
      backgroundColor: ['#1a1a1a', '#444444', '#666666', '#888888'],
      borderWidth: 0,
    }],
  }} height="180px" />;
}

function OrigenBar({ data }: { data: any }) {
  if (!data?.labels) {
    return <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Sin datos</div>;
  }

  return <ChartWrapper type="bar" data={{
    labels: data.labels,
    datasets: data.datasets?.map((ds: any, i: number) => ({
      ...ds,
      backgroundColor: ['#1a1a1a', '#444444', '#666666'][i % 3],
      borderRadius: 4,
      borderSkipped: false,
    })) || [],
  }} height="180px" />;
}

export default function OrigenLeadsPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { data, loading, error } = useDashboard(filters);
  const connectionStatus = useConnectionStatus();
  const AsesoresOptions = useAsesores(filters).map((a) => ({ value: a, label: a }));

  const totalLeads = data?.Origenleads?.total_leads || data?.total_leads || 0;
  const topCanal = data?.Origenleads?.top_canal || data?.fuente_data?.top_canal || '—';
  const muestra = data?.Origenleads?.muestra || data?.fuente_data?.muestra || 0;

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
                <OrigenDonut data={data?.fuente_data?.distribution} />
              </ChartCard>
            </div>
            <div className="lg:col-span-3">
              <ChartCard title="Evolución Temporal">
                <OrigenBar data={data?.fuente_data?.evolution} />
              </ChartCard>
            </div>
          </div>

          {data?.fuente_data?.details?.length > 0 && (
            <div className="bg-white border border-gray-100">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-medium text-gray-900">Detalle por Canal</h3>
              </div>
              <div className="p-4 space-y-2">
                {data?.fuente_data?.details?.map((row: any, i: number) => (
                  <div
                    key={row.canal || i}
                    className="flex items-center justify-between p-3 rounded hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-gray-400 rounded-full" />
                      <span className="text-sm text-gray-700">{row.canal || '—'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-semibold text-gray-900">{row.leads || 0}</span>
                      <span className="text-xs text-gray-400">{row.percentage || 0}%</span>
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