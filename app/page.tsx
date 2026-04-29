'use client';

import { useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { useDashboard, useConnectionStatus, useAsesores, useFilters } from '@/hooks';
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
  const { data, loading, error } = useDashboard(filters);
  const connectionStatus = useConnectionStatus();
  const asesoresList = useAsesores(filters);
  const AsesoresOptions = useMemo(() => asesoresList.map((a) => ({ value: a, label: a })), [asesoresList]);

  const resumen = data?.resumen || {};
  const stagesFromApi = data?.stages || [];
  const leadsPorStage = data?.leads_por_stage || [];

  const totalLeads = resumen.total_auditorias ?? 0;

  const liderLeads = resumen.atendidos_por_lider ?? 0;
  const gerenteLeads = resumen.atendidos_por_gerente ?? 0;

  const stageData = useMemo(() => {
    if (leadsPorStage.length > 0) {
      return stagesFromApi
        .filter((s: any) => leadsPorStage.some((l: any) => l.stage === s.id))
        .map((s: any) => {
          const fromApi = leadsPorStage.find((l: any) => l.stage === s.id);
          return {
            label: s.label,
            value: fromApi?.total || 0,
          };
        });
    }
    return [];
  }, [stagesFromApi, leadsPorStage]);

  const chartData = useMemo(() => {
    const values = stageData.map((s: any) => s.value);
    const total = values.reduce((a: number, b: number) => a + b, 0) || 1;
    return {
      labels: stageData.map((s: any) => s.label),
      datasets: [{
        data: values,
        backgroundColor: STAGE_COLORS.slice(0, stageData.length),
        borderWidth: 0,
        hoverOffset: 8,
      }],
      total,
    };
  }, [stageData]);

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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <Skeleton key={i} className="h-32" />)}
          </div>
          <Skeleton className="h-[420px]" />
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white border border-[#EEEEEC] rounded-xl p-6">
            <p className="text-xs font-medium text-[#B5B5AE] uppercase tracking-wider mb-2">Total Comercial</p>
            <p className="text-4xl font-bold text-[#1F1D3D]">{resumen.atendidos_por_asesor ?? 0}</p>
            <p className="text-xs text-[#B5B5AE] mt-1">leads por asesores</p>
          </div>

          <div className="bg-white border border-[#EEEEEC] rounded-xl p-6">
            <p className="text-xs font-medium text-[#B5B5AE] uppercase tracking-wider mb-2">Líder de Ventas</p>
            <p className="text-4xl font-bold text-[#1F1D3D]">{liderLeads}</p>
            <p className="text-xs text-[#B5B5AE] mt-1">leads escalados</p>
          </div>

          <div className="bg-white border border-[#EEEEEC] rounded-xl p-6">
            <p className="text-xs font-medium text-[#B5B5AE] uppercase tracking-wider mb-2">Gerencial</p>
            <p className="text-4xl font-bold text-[#1F1D3D]">{gerenteLeads}</p>
            <p className="text-xs text-[#B5B5AE] mt-1">leads escalados</p>
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
                labels: stageData.map((s: any) => s.label),
                datasets: [{
                  data: stageData.map((s: any) => s.value),
                  backgroundColor: STAGE_COLORS.slice(0, stageData.length),
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