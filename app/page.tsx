'use client';

import { Shell } from '@/components/layout/Shell';
import { KPIGrid } from '@/components/kpi/KPIGrid';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { useDashboard, useConnectionStatus, useAsesores, useFilters } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';

const COLORS = {
  dark: '#1F1D3D',
  medium: '#35325B',
  light: '#B5B5AE',
  green: '#22c55e',
  orange: '#f97316',
  red: '#c8151b',
};

export default function HomePage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { data, loading, error } = useDashboard(filters);
  const connectionStatus = useConnectionStatus();
  const asesoresList = useAsesores(filters);

  const AsesoresOptions = asesoresList.map((a) => ({ value: a, label: a }));

  const resumen = data?.resumen || {};
  const reunionesTotal = (resumen.reuniones_pendientes || 0) +
                        (resumen.reuniones_en_proceso || 0) +
                        (resumen.reuniones_cerrados || 0);

  const decisiones = data?.decisiones || {};
  const decisionesAceptados = decisiones.decisiones_aceptados ?? 0;
  const decisionesRechazados = decisiones.decisiones_rechazados ?? 0;

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
              noAgendados: resumen.leads_no_agendados ?? 0,
              ventasCerradas: resumen.ventas_cerradas ?? 0,
            }}
          />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Estado de Leads" subtitle="Distribución por estado">
              <ChartWrapper type="doughnut" data={{
                labels: ['Pendientes', 'En Proceso', 'Cerrados'],
                datasets: [{
                  data: [
                    resumen.reuniones_pendientes || 0,
                    resumen.reuniones_en_proceso || 0,
                    resumen.reuniones_cerrados || 0,
                  ],
                  backgroundColor: [COLORS.dark, COLORS.medium, COLORS.light],
                  borderWidth: 0,
                  hoverOffset: 10,
                }],
              }} height="240px" />
            </ChartCard>
            <ChartCard title="Pipeline de Ventas" subtitle="Totales por etapa">
              <ChartWrapper type="doughnut" data={{
                labels: ['Cerradas', 'Perdidas', 'En Negociación', 'En Seguimiento'],
                datasets: [{
                  data: [
                    resumen.ventas_cerradas || 0,
                    resumen.ventas_perdidas || 0,
                    resumen.casos_con_negociacion_declarada || 0,
                    resumen.en_seguimiento_sin_cierre || 0,
                  ],
                  backgroundColor: [COLORS.green, COLORS.red, COLORS.medium, COLORS.light],
                  borderWidth: 0,
                  hoverOffset: 10,
                }],
              }} height="240px" />
            </ChartCard>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <ChartCard title="Leads Agendados" subtitle="vs No Agendados">
              <ChartWrapper type="doughnut" data={{
                labels: ['Agendados', 'No Agendados'],
                datasets: [{
                  data: [
                    totalAgendados,
                    resumen.leads_no_agendados || 0,
                  ],
                  backgroundColor: [COLORS.green, COLORS.orange],
                  borderWidth: 0,
                }],
              }} height="180px" />
            </ChartCard>
            <ChartCard title="Reuniones Retro" subtitle="Con vs Sin">
              <ChartWrapper type="bar" data={{
                labels: ['Con Feedback', 'Sin Feedback'],
                datasets: [{
                  data: [
                    resumen.reuniones_con_retro || 0,
                    resumen.reuniones_sin_retro || 0,
                  ],
                  backgroundColor: [COLORS.green, COLORS.orange],
                  borderRadius: 4,
                  borderSkipped: false,
                }],
              }} height="180px" />
            </ChartCard>
            <ChartCard title="Decisiones" subtitle="Aceptar / Rechazar">
              <ChartWrapper type="pie" data={{
                labels: ['Aceptados', 'Rechazados'],
                datasets: [{
                  data: [decisionesAceptados, decisionesRechazados],
                  backgroundColor: [COLORS.dark, COLORS.medium],
                  borderWidth: 0,
                }],
              }} height="180px" />
            </ChartCard>
          </div>
        </div>
      ) : null}
    </Shell>
  );
}