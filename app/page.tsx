'use client';

import { ErrorBoundary, WorkingAnimation } from '@/components/ErrorBoundary';
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

function DashboardContent({
  filters,
  connectionStatus,
  AsesoresOptions,
}: {
  filters: { desde: string; hasta: string; pais: string; asesor: string };
  connectionStatus: 'connected' | 'connecting' | 'error';
  AsesoresOptions: Array<{ value: string; label: string }>;
}) {
  const { data, loading, error } = useDashboard(filters);

  if (error) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center max-w-sm animate-[fadeIn_0.5s_ease-out]">
          <div className="mb-8">
            <WorkingAnimation />
          </div>
          <div className="space-y-3">
            <div className="w-12 h-1 bg-[#1F1D3D]/10 rounded-full mx-auto overflow-hidden">
              <div className="h-full bg-[#1F1D3D]/40 rounded-full animate-[slide_1.5s_ease-in-out_infinite]" style={{ width: '40%' }} />
            </div>
            <h1 className="text-lg font-semibold text-[#1F1D3D]">
              Mantenimiento en proceso
            </h1>
            <p className="text-sm text-[#B5B5AE] leading-relaxed">
              Estamos realizando mejoras para servirte mejor.
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-6 text-sm bg-[#1F1D3D] text-[#F5F5ED] px-6 py-2.5 rounded-lg hover:bg-[#35325B] transition-colors"
          >
            Reintentar
          </button>
        </div>
        <style>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slide {
            0% { transform: translateX(-100%); }
            50% { transform: translateX(150%); }
            100% { transform: translateX(-100%); }
          }
        `}</style>
      </div>
    );
  }

  if (loading) {
    return (
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
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-sm text-[#B5B5AE]">Sin datos disponibles</p>
      </div>
    );
  }

  const resumen = data?.resumen || {};
  const reunionesTotal = (resumen.reuniones_pendientes || 0) +
                        (resumen.reuniones_en_proceso || 0) +
                        (resumen.reuniones_cerrados || 0);
  const totalLeads = (resumen.leads_aceptados || 0) +
                     (resumen.leads_rechazados || 0) +
                     (resumen.leads_no_agendados || 0);

  const decisiones = data?.decisiones || {};
  const decGlobal = decisiones.global || {};
  const decisionesAceptados = decGlobal.aceptados_total ?? 0;
  const decisionesRechazados = decGlobal.rechazados_total ?? 0;

  return (
    <div className="space-y-6">
      <KPIGrid
        data={{
          aceptados: resumen.leads_aceptados ?? 0,
          perdidos: resumen.leads_rechazados ?? 0,
          reuniones: reunionesTotal,
          totalLeads,
          pendientes: resumen.reuniones_pendientes ?? 0,
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
                (resumen.reuniones_con_retro || 0) + (resumen.reuniones_sin_retro || 0),
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
  );
}

export default function HomePage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const connectionStatus = useConnectionStatus();
  const asesoresList = useAsesores(filters);
  const AsesoresOptions = asesoresList.map((a) => ({ value: a, label: a }));

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
      <ErrorBoundary
        fallback={
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="text-center max-w-md">
              <div className="mb-6">
                <WorkingAnimation />
              </div>
              <h1 className="text-xl font-semibold text-[#1F1D3D] mb-2">
                Hey, estamos trabajando para mejorar nuestro servicio
              </h1>
              <p className="text-sm text-[#B5B5AE] mb-4">
                Regresaremos pronto. Gracias por tu paciencia.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="mt-4 text-sm bg-[#1F1D3D] text-[#F5F5ED] px-4 py-2 rounded-lg hover:bg-[#35325B] transition-colors"
              >
                Reintentar
              </button>
            </div>
          </div>
        }
      >
        <DashboardContent
          filters={filters}
          connectionStatus={connectionStatus}
          AsesoresOptions={AsesoresOptions}
        />
      </ErrorBoundary>
    </Shell>
  );
}