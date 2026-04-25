'use client';

import { Shell } from '@/components/layout/Shell';
import { KPIGrid } from '@/components/kpi/KPIGrid';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { useDashboard, useConnectionStatus, useAsesores, useFilters } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';

const colors = {
  dark: '#1F1D3D',
  medium: '#35325B',
  light: '#B5B5AE',
};

function LeadsChart({ data }: { data: any }) {
  if (!data?.labels) {
    return <div className="h-64 flex items-center justify-center text-[#B5B5AE] text-sm">Sin datos</div>;
  }

  return <ChartWrapper type="bar" data={{
    labels: data.labels,
    datasets: [{
      data: data.values || [],
      backgroundColor: colors.dark,
      borderRadius: 4,
      borderSkipped: false,
    }],
  }} height="240px" />;
}

function PipelineChart({ data }: { data: any }) {
  if (!data?.labels) {
    return <div className="h-64 flex items-center justify-center text-[#B5B5AE] text-sm">Sin datos</div>;
  }

  return <ChartWrapper type="bar" data={{
    labels: data.labels,
    datasets: [{
      data: data.values || [],
      backgroundColor: colors.medium,
      borderRadius: 4,
      borderSkipped: false,
    }],
  }} height="240px" />;
}

function SimpleDoughnut({ data }: { data: any }) {
  if (!data?.labels) {
    return <div className="h-48 flex items-center justify-center text-[#B5B5AE] text-sm">Sin datos</div>;
  }

  return <ChartWrapper type="doughnut" data={{
    labels: data.labels,
    datasets: [{
      data: data.values || [],
      backgroundColor: [colors.dark, colors.light, colors.medium],
      borderWidth: 0,
    }],
  }} height="180px" />;
}

function SimplePie({ data }: { data: any }) {
  if (!data?.labels) {
    return <div className="h-48 flex items-center justify-center text-[#B5B5AE] text-sm">Sin datos</div>;
  }

  return <ChartWrapper type="pie" data={{
    labels: data.labels,
    datasets: [{
      data: data.values || [],
      backgroundColor: [colors.dark, colors.medium],
      borderWidth: 0,
    }],
  }} height="180px" />;
}

export default function HomePage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { data, loading, error } = useDashboard(filters);
  const connectionStatus = useConnectionStatus();
  const asesoresList = useAsesores(filters);

  const AsesoresOptions = asesoresList.map((a) => ({ value: a, label: a }));

  const resumen = data?.resumen || {};
  const reunionesTotal = (resumen.reuniones_pendientes || 0) + (resumen.reuniones_en_proceso || 0) + (resumen.reuniones_cerrados || 0);

  return (
    <Shell
      pageTitle="Resumen"
      filters={filters}
      onFilterChange={handleFilterChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={AsesoresOptions}
      connectionStatus={connectionStatus}
    >
      {loading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Skeleton className="h-72" />
            <Skeleton className="h-72" />
          </div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-[#B5B5AE]">Error: {error}</p>
        </div>
      ) : data ? (
        <div className="space-y-6">
          <KPIGrid
            data={{
              aceptados: resumen.leads_aceptados ?? 0,
              perdidos: resumen.leads_rechazados ?? 0,
              reuniones: reunionesTotal,
              propuestas: resumen.propuestas_registradas ?? 0,
              pendientes: resumen.leads_no_agendados ?? 0,
              enProceso: resumen.en_seguimiento_sin_cierre ?? 0,
              cerrados: resumen.ventas_cerradas ?? 0,
              ventasCerradas: resumen.ventas_cerradas ?? 0,
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Estado de Leads" subtitle="Distribución por estado">
              <LeadsChart data={data.chart_leads} />
            </ChartCard>
            <ChartCard title="Pipeline de Ventas" subtitle="Totales por etapa">
              <PipelineChart data={data.chart_ventas} />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard title="Leads Agendados" subtitle="vs No Agendados">
              <SimpleDoughnut data={data.chart_agendados} />
            </ChartCard>
            <ChartCard title="Reuniones Retro" subtitle="Con vs Sin">
              <SimplePie data={data.chart_retro} />
            </ChartCard>
            <ChartCard title="Decisiones" subtitle="Aceptar / Rechazar">
              <SimplePie data={data.chart_decisiones} />
            </ChartCard>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}