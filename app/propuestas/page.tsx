'use client';

import { Shell } from '@/components/layout/Shell';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { useDashboard, useConnectionStatus, useAsesores, useFilters } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';

function PropuestasChart({ data }: { data: any }) {
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
  }} height="240px" />;
}

function TasaChart({ data }: { data: any }) {
  if (!data?.labels) {
    return <div className="h-64 flex items-center justify-center text-gray-400 text-sm">Sin datos</div>;
  }

  return <ChartWrapper type="bar" data={{
    labels: data.labels,
    datasets: [{
      data: data.values || [],
      backgroundColor: '#666666',
      borderRadius: 4,
      borderSkipped: false,
    }],
  }} height="240px" />;
}

function MotivosPie({ data }: { data: any }) {
  if (!data?.labels) {
    return <div className="h-48 flex items-center justify-center text-gray-400 text-sm">Sin datos</div>;
  }

  return <ChartWrapper type="doughnut" data={{
    labels: data.labels,
    datasets: [{
      data: data.values || [],
      backgroundColor: ['#1a1a1a', '#444444', '#666666', '#888888', '#aaaaaa'],
      borderWidth: 0,
    }],
  }} height="180px" />;
}

export default function PropuestasPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { data, loading, error } = useDashboard(filters);
  const connectionStatus = useConnectionStatus();
  const AsesoresOptions = useAsesores(filters).map((a) => ({ value: a, label: a }));

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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
          <Skeleton className="h-72" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-red-500">Error: {error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <ChartCard title="Propuestas por Rubro">
            <PropuestasChart data={data?.chart_propuestas_rubro} />
          </ChartCard>
          <ChartCard title="Tasa de Cierre">
            <TasaChart data={data?.chart_tasa_cierre} />
          </ChartCard>
          <ChartCard title="Motivos de Pérdida">
            <MotivosPie data={data?.chart_motivos} />
          </ChartCard>
          <ChartCard title="Motivos por Categoría">
            <MotivosPie data={data?.chart_motivos_cat} />
          </ChartCard>
        </div>
      )}
    </Shell>
  );
}