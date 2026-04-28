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

  const totalLeads = useMemo(() => {
    return (resumen.leads_aceptados || 0) +
      (resumen.leads_rechazados || 0) +
      (resumen.leads_no_agendados || 0);
  }, [resumen]);

  const topAsesor = useMemo(() => {
    const asesoresData = data?.asesores || data?.asesores_data || [];
    if (!asesoresData.length) return { nombre: '—', leads: 0 };
    const sorted = [...asesoresData].sort((a: any, b: any) => (b.leads_aceptados || 0) - (a.leads_aceptados || 0));
    return sorted[0] || { nombre: '—', leads: 0 };
  }, [data]);

  const stageData = useMemo(() => {
    if (stagesFromApi.length > 0) {
      return stagesFromApi.map((s: any) => {
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
            <p className="text-4xl font-bold text-[#1F1D3D]">{totalLeads}</p>
            <p className="text-xs text-[#B5B5AE] mt-1">leads en seguimiento</p>
          </div>

          <div className="bg-white border border-[#EEEEEC] rounded-xl p-6">
            <p className="text-xs font-medium text-[#B5B5AE] uppercase tracking-wider mb-2">Líder de Ventas</p>
            <p className="text-2xl font-semibold text-[#1F1D3D] truncate">{topAsesor.nombre}</p>
            <p className="text-xs text-[#B5B5AE] mt-1">{topAsesor.leads} leads cerrados</p>
          </div>

          <div className="bg-white border border-[#EEEEEC] rounded-xl p-6">
            <p className="text-xs font-medium text-[#B5B5AE] uppercase tracking-wider mb-2">Gerencial</p>
            <p className="text-4xl font-bold text-[#1F1D3D]">{resumen.ventas_cerradas ?? 0}</p>
            <p className="text-xs text-[#B5B5AE] mt-1">ventas cerradas</p>
          </div>
        </div>

        <div className="bg-white border border-[#EEEEEC] rounded-xl p-8">
          <div className="mb-6">
            <h2 className="text-base font-semibold text-[#1F1D3D]">Pipeline de Ventas</h2>
            <p className="text-xs text-[#B5B5AE] mt-0.5">Distribución por etapa</p>
          </div>

          <div className="flex gap-12">
            <div className="w-[320px] h-[320px] flex-shrink-0">
              <ChartWrapper
                type="doughnut"
                data={chartData}
                height="320px"
              />
            </div>

            {stageData.length === 0 && (
            <div className="flex items-center justify-center py-12">
              <p className="text-sm text-[#B5B5AE]">Sin datos de etapas disponibles</p>
            </div>
          )}
          {stageData.length > 0 && (
            <div className="flex-1 flex flex-col justify-center gap-5">
              {stageData.map((stage: any, i: number) => {
                const pct = Math.round((stage.value / chartData.total) * 100);
                return (
                  <div key={stage.label} className="flex items-center gap-4">
                    <div
                      className="w-4 h-4 rounded-full flex-shrink-0"
                      style={{ backgroundColor: STAGE_COLORS[i] }}
                    />
                    <span className="text-sm text-[#35325B] w-28">{stage.label}</span>
                    <div className="flex-1 h-2 bg-[#EEEEEC] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%`, backgroundColor: STAGE_COLORS[i] }}
                      />
                    </div>
                    <div className="w-20 text-right">
                      <span className="text-base font-semibold text-[#1F1D3D]">{stage.value}</span>
                      <span className="text-xs text-[#B5B5AE] ml-1">({pct}%)</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          </div>
        </div>
      </div>
    </Shell>
  );
}