'use client';

import { useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { useAdminDashboard, useConnectionStatus, useAsesores, useFilters } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartWrapper } from '@/components/charts/ChartWrapper';

const STAGE_COLORS = [
  '#1F1D3D',
  '#2d2a4a',
  '#3f3c6d',
  '#4f4d8f',
  '#6c6aad',
  '#B5B5AE',
];

export default function HomePage() {
const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { data, loading, error } = useAdminDashboard(filters);
  const connectionStatus = useConnectionStatus();
  const asesoresList = useAsesores(filters);
  const AsesoresOptions = useMemo(() => asesoresList.map((a) => ({ value: a, label: a })), [asesoresList]);

  const metricas = data?.metricas || {};
  const resumen = data?.resumen || {};
  const stagesFromApi = data?.stages || [];
  const leadsPorStage = data?.leads_por_stage || [];

  const totalLeads = metricas.total_auditorias ?? 0;
  const leadsAceptados = metricas.leads_aceptados ?? 0;
  const leadsNoAgendados = metricas.leads_no_agendados ?? 0;
  const reunionesConRetro = metricas.reuniones_con_retro ?? 0;
  const reunionesSinRetro = metricas.reuniones_sin_retro ?? 0;
  const propuestas = metricas.propuestas_registradas ?? 0;
  const seguimientos = metricas.seguimientos_registrados ?? 0;
  const ventasCerradas = metricas.ventas_cerradas ?? 0;
  const ventasPerdidas = metricas.ventas_perdidas ?? 0;
  const atendidosPorAsesor = metricas.atendidos_por_asesor ?? resumen.atendidos_por_asesor ?? 0;
  const atendidosPorLider = metricas.atendidos_por_lider ?? resumen.atendidos_por_lider ?? 0;
  const atendidosPorGerente = metricas.atendidos_por_gerente ?? resumen.atendidos_por_gerente ?? 0;

  const stageData = useMemo(() => {
    if (stagesFromApi.length === 0) return [];

    return stagesFromApi.map((s: any) => {
      if (s.id === 1) {
        return { label: s.label, value: leadsAceptados };
      }
      const matching = leadsPorStage.filter((l: any) => l.stage === s.id);

      if (matching.length === 0) {
        return { label: s.label, value: 0 };
      }

      const hasSubStages = matching.length > 1 || matching.some((l: any) => (l as any).sub_stage);

      if (hasSubStages) {
        const subRows = matching.map((l: any) => ({
          label: l.stage_label || s.label,
          value: l.total,
        }));
        const sum = subRows.reduce((a: number, b: any) => a + b.value, 0);
        return { label: s.label, value: sum, subs: subRows };
      }

      const entry = matching[0];
      const label = entry?.stage_label || s.label;
      return { label, value: entry?.total || 0 };
    });
  }, [stagesFromApi, leadsPorStage, leadsAceptados]);

const flatData = useMemo(() => {
    const seen = new Set<string>();
    return stageData.flatMap((s: any) => {
      if (s.subs) {
        return s.subs.filter((sub: any) => {
          if (seen.has(sub.label)) return false;
          seen.add(sub.label);
          return true;
        });
      }
      if (seen.has(s.label) && s.value > 0) return [];
      seen.add(s.label);
      return [{ label: s.label, value: s.value }];
    });
  }, [stageData]);

  const chartData = useMemo(() => {
    const values = flatData.map((s: any) => s.value);
    const total = values.reduce((a: number, b: number) => a + b, 0) || 1;
    return {
      labels: flatData.map((s: any) => s.label),
      datasets: [{
        data: values,
        backgroundColor: STAGE_COLORS.slice(0, flatData.length),
        borderRadius: 6,
        borderSkipped: false,
      }],
      total,
    };
  }, [flatData]);

  if (loading) {
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
        <div className="space-y-8">
          <div className="flex gap-4">
            <div className="w-44 flex flex-col gap-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
            <div className="flex-1 flex gap-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16 flex-1" />)}
            </div>
          </div>
          <Skeleton className="h-[280px]" />
        </div>
      </Shell>
    );
  }

  if (error) {
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
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-[#B5B5AE]">{error}</p>
        </div>
      </Shell>
    );
  }

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
      <div className="space-y-8">
        <div className="flex gap-4">
          <div className="w-44 flex flex-col gap-3">
            <div className="bg-white border border-[#EEEEEC] rounded-xl p-3 flex-1 flex flex-col items-center justify-center">
              <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-0.5">Lead No Calificado</p>
              <p className="text-lg font-bold text-[#1F1D3D]">{leadsNoAgendados}</p>
            </div>

            <div className="bg-white border border-[#EEEEEC] rounded-xl p-3 flex-1 flex flex-col items-center justify-center">
              <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-0.5">Lead Calificado</p>
              <p className="text-lg font-bold text-[#1F1D3D]">{leadsAceptados}</p>
            </div>

            <div className="bg-white border border-[#EEEEEC] rounded-xl p-3 flex-1 flex flex-col items-center justify-center">
              <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-0.5">Total Leads</p>
              <p className="text-lg font-bold text-[#1F1D3D]">{totalLeads}</p>
            </div>
          </div>

          <div className="flex-1 flex gap-3">
            <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex-1 flex flex-col items-center">
              <p className="text-xs font-medium text-[#B5B5AE] uppercase tracking-wider mb-1">Leads gestionados por comercial</p>
              <div className="flex-1 flex items-center justify-center w-full">
                <p className="text-6xl font-bold text-[#1F1D3D]">{atendidosPorAsesor}</p>
              </div>
            </div>

            <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex-1 flex flex-col items-center">
              <p className="text-xs font-medium text-[#B5B5AE] uppercase tracking-wider mb-1">Leads gestionados por lider de ventas</p>
              <div className="flex-1 flex items-center justify-center w-full">
                <p className="text-6xl font-bold text-[#1F1D3D]">{atendidosPorLider}</p>
              </div>
            </div>

            <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex-1 flex flex-col items-center">
              <p className="text-xs font-medium text-[#B5B5AE] uppercase tracking-wider mb-1">Leads gestionados por Gerencial</p>
              <div className="flex-1 flex items-center justify-center w-full">
                <p className="text-6xl font-bold text-[#1F1D3D]">{atendidosPorGerente}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#EEEEEC] rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-[#1F1D3D]">Pipeline de Ventas</h2>
              <p className="text-xs text-[#B5B5AE] mt-0.5">Distribución por etapa</p>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold text-[#1F1D3D]">{totalLeads}</span>
              <p className="text-xs text-[#B5B5AE]">Total leads</p>
            </div>
          </div>

          {stageData.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-[#B5B5AE]">Sin datos de etapas disponibles</p>
            </div>
          )}
          {stageData.length > 0 && (
            <ChartWrapper
              type="bar"
              data={{
                labels: flatData.map((s: any) => s.label),
                datasets: [{
                  data: flatData.map((s: any) => s.value),
                  backgroundColor: STAGE_COLORS.slice(0, flatData.length),
                  borderRadius: 6,
                  borderSkipped: false,
                }],
              }}
              height="280px"
              options={{
                indexAxis: 'y' as const,
                plugins: {
                  legend: { display: false },
                  tooltip: {
                    callbacks: {
                      label: (ctx: any) => {
                        const total = chartData.total;
                        const val = ctx.raw;
                        const pct = total > 0 ? Math.round((val / total) * 100) : 0;
                        return ` ${val} leads (${pct}%)`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: {
                      font: { size: 11, family: 'Inter' },
                      color: '#B5B5AE',
                    },
                  },
                  y: {
                    grid: { display: false },
                    ticks: {
                      font: { size: 12, family: 'Inter', weight: '500' },
                      color: '#35325B',
                    },
                  },
                },
              }}
            />
          )}
        </div>
      </div>
    </Shell>
  );
}