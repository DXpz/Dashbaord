'use client';

import { useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { KPICard } from '@/components/kpi/KPICard';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { useDashboard, useConnectionStatus, useAsesores, useFilters } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, TrendingUp, DollarSign, Users } from 'lucide-react';

function NegChart({ data }: { data: any }) {
  if (!data?.labels) {
    return <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Sin datos</div>;
  }

  return <ChartWrapper type="bar" data={{
    labels: data.labels,
    datasets: [{
      data: data.values || [],
      backgroundColor: '#1a1a1a',
      borderRadius: 4,
      borderSkipped: false,
    }],
  }} height="280px" />;
}

export default function NegociacionPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { data, loading, error } = useDashboard(filters);
  const connectionStatus = useConnectionStatus();
  const AsesoresOptions = useAsesores(filters).map((a) => ({ value: a, label: a }));

  const seg = data?.seguimientos_count ?? data?.seguimientos ?? 0;
  const proposals = data?.propuestas_en_negociacion ?? data?.propuestas_count ?? 0;
  const acc = data?.decisiones_aceptados ?? 0;
  const rej = data?.decisiones_rechazados ?? 0;

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
            <KPICard label="Seguimientos" value={seg} icon={Activity} className="delay-1" />
            <KPICard label="Propuestas" value={proposals} icon={DollarSign} className="delay-2" />
            <KPICard label="Aceptados" value={acc} icon={TrendingUp} className="delay-3" />
            <KPICard label="Rechazados" value={rej} icon={Users} className="delay-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Seguimientos por Rubro">
              <NegChart data={data?.chart_negociacion_rubro} />
            </ChartCard>
            <ChartCard title="Tasa de Conversión">
              <NegChart data={data?.chart_tasa_cierre} />
            </ChartCard>
          </div>
        </div>
      )}
    </Shell>
  );
}