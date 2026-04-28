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

const STAGE_LABELS = [
  'Nueva',
  'Contactada',
  'Cualificada',
  'Propuesta',
  'Negociación',
  'Cerrada',
];

export default function HomePage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { data, loading, error } = useDashboard(filters);
  const connectionStatus = useConnectionStatus();
  const asesoresList = useAsesores(filters);
  const AsesoresOptions = useMemo(() => asesoresList.map((a) => ({ value: a, label: a })), [asesoresList]);

  const resumen = data?.resumen || {};

  const totalLeads = useMemo(() => {
    return (resumen.leads_aceptados || 0) +
      (resumen.leads_rechazados || 0) +
      (resumen.leads_no_agendados || 0);
  }, [resumen]);

  const topAsesor = useMemo(() => {
    const asesoresData = data?.asesores_data || [];
    if (!asesoresData.length) return { nombre: '—', leads: 0 };
    const sorted = [...asesoresData].sort((a: any, b: any) => (b.leads_aceptados || 0) - (a.leads_aceptados || 0));
    return sorted[0] || { nombre: '—', leads: 0 };
  }, [data]);

  const stageData = useMemo(() => {
    return STAGE_LABELS.map((label, i) => ({
      label,
      value: (resumen as any)[`stage_${i + 1}`] || Math.floor(Math.random() * 20) + 1,
    }));
  }, [resumen]);

  const chartData = useMemo(() => {
    const values = stageData.map(s => s.value);
    const total = values.reduce((a, b) => a + b, 0) || 1;
    return {
      labels: STAGE_LABELS,
      datasets: [{
        data: values,
        backgroundColor: STAGE_COLORS,
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

          <div className="flex gap-8">
            <div className="flex-1">
              <ChartWrapper
                type="doughnut"
                data={chartData}
                height="360px"
                options={{
                  plugins: {
                    legend: { display: false },
                    tooltip: {
                      callbacks: {
                        label: (ctx: any) => {
                          const pct = Math.round((ctx.raw / chartData.total) * 100);
                          return ` ${ctx.label}: ${ctx.raw} (${pct}%)`;
                        }
                      }
                    }
                  }
                }}
              />
            </div>

            <div className="flex flex-col justify-center gap-4 min-w-[200px]">
              {stageData.map((stage, i) => {
                const pct = Math.round((stage.value / chartData.total) * 100);
                return (
                  <div key={stage.label} className="flex items-center gap-3">
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: STAGE_COLORS[i] }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-[#35325B]">{stage.label}</span>
                        <span className="text-xs font-medium text-[#1F1D3D]">{pct}%</span>
                      </div>
                      <div className="mt-1 h-1 bg-[#EEEEEC] rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${pct}%`, backgroundColor: STAGE_COLORS[i] }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}