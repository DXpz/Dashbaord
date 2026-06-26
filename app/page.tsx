'use client';

import { useMemo, useState } from 'react';
import { Shell } from '@/components/layout/Shell';
import { useAdminDashboard, useConnectionStatus, useAsesores, useFilters } from '@/hooks';
import { useAuth } from '@/lib/auth-context';
import { Skeleton } from '@/components/ui/skeleton';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { ChartCard } from '@/components/charts/ChartCard';

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
  const { user } = useAuth();
  const [showCerradas, setShowCerradas] = useState(true);
  const [showPerdidas, setShowPerdidas] = useState(true);
  const   asesoresList = useAsesores(filters);

  const AsesoresOptions = useMemo(() => (asesoresList || []).map((a: string) => ({ value: a, label: a })), [asesoresList]);

  const isSuperAdmin = user?.is_super_admin === true || user?.email === 'ghenriquez@red.com.sv';
  const showPaisFilter = isSuperAdmin || user?.country_code === 'SV';

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
  const totalEquipos = metricas.total_equipos ?? 0;
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
          cerradas: l.cerradas,
          perdidas: l.perdidas,
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

  const leadsNoAceptados = metricas.leads_pendientes_decision ?? 0;

  const chartData = useMemo(() => {
    const values = flatData.map((s: any) => s.value);
    const total = values.reduce((a: number, b: number) => a + b, 0) || 1;

    const cierreStage = flatData.find((s: any) => s.label === 'CIERRE');
    const hasCierreSegment = cierreStage && (cierreStage.cerradas !== undefined || cierreStage.perdidas !== undefined);
    const ventasCerradasMetric = metricas.ventas_cerradas ?? cierreStage?.cerradas ?? 0;
    const ventasPerdidasMetric = metricas.ventas_perdidas ?? cierreStage?.perdidas ?? 0;

    const showToggle = hasCierreSegment;

    if (hasCierreSegment) {
      const cierreIndex = flatData.findIndex((s: any) => s.label === 'CIERRE');

      if (!showCerradas && !showPerdidas) {
        return {
          labels: flatData.map((s: any) => s.label),
          datasets: [{
            data: flatData.map((s: any, i: number) => i === cierreIndex ? 0 : s.value),
            backgroundColor: STAGE_COLORS.slice(0, flatData.length),
            borderRadius: 0,
            borderSkipped: false,
          }],
          total,
          isStacked: false,
          showToggle: true,
          ventasCerradas: ventasCerradasMetric,
          ventasPerdidas: ventasPerdidasMetric,
        };
      }

      if (showCerradas && !showPerdidas) {
        return {
          labels: flatData.map((s: any) => s.label),
          datasets: [{
            data: flatData.map((s: any, i: number) => i === cierreIndex ? (s.cerradas || 0) : s.value),
            backgroundColor: flatData.map((s: any, i: number) =>
              i === cierreIndex ? '#22c55e' : STAGE_COLORS[i % STAGE_COLORS.length]
            ),
            borderRadius: 0,
            borderSkipped: false,
          }],
          total,
          isStacked: false,
          showToggle: true,
          ventasCerradas: ventasCerradasMetric,
          ventasPerdidas: ventasPerdidasMetric,
        };
      }

      if (!showCerradas && showPerdidas) {
        return {
          labels: flatData.map((s: any) => s.label),
          datasets: [{
            data: flatData.map((s: any, i: number) => i === cierreIndex ? (s.perdidas || 0) : s.value),
            backgroundColor: flatData.map((s: any, i: number) =>
              i === cierreIndex ? '#ef4444' : STAGE_COLORS[i % STAGE_COLORS.length]
            ),
            borderRadius: 0,
            borderSkipped: false,
          }],
          total,
          isStacked: false,
          showToggle: true,
          ventasCerradas: ventasCerradasMetric,
          ventasPerdidas: ventasPerdidasMetric,
        };
      }

      const cerradas = new Array(flatData.length).fill(0);
      const perdidas = new Array(flatData.length).fill(0);
      flatData.forEach((s: any, i: number) => {
        if (i === cierreIndex) {
          cerradas[i] = s.cerradas || 0;
          perdidas[i] = s.perdidas || 0;
        } else {
          cerradas[i] = s.value;
        }
      });
      return {
        labels: flatData.map((s: any) => s.label),
        datasets: [
          {
            label: 'LEADS',
            data: cerradas,
            backgroundColor: flatData.map((s: any, i: number) =>
              i === cierreIndex ? '#22c55e' : STAGE_COLORS[i % STAGE_COLORS.length]
            ),
            borderRadius: 0,
            borderSkipped: false,
          },
          {
            label: 'Perdidas',
            data: perdidas,
            backgroundColor: flatData.map((s: any, i: number) =>
              i === cierreIndex ? '#ef4444' : 'transparent'
            ),
            borderRadius: 0,
            borderSkipped: false,
          },
        ],
        total,
        isStacked: true,
        showToggle: true,
        ventasCerradas: ventasCerradasMetric,
        ventasPerdidas: ventasPerdidasMetric,
      };
    }

    return {
      labels: flatData.map((s: any) => s.label),
      datasets: [{
        data: values,
        backgroundColor: STAGE_COLORS.slice(0, flatData.length),
        borderRadius: 0,
        borderSkipped: false,
      }],
      total,
      isStacked: false,
      showToggle: false,
    };
  }, [flatData, metricas, showCerradas, showPerdidas]);

  const cierreChartData = useMemo(() => ({
    labels: ['Leads Creados', 'Cierre Exitoso', 'Cant. Equipos'],
    datasets: [{
      data: [totalLeads, ventasCerradas, totalEquipos],
      backgroundColor: ['#1F1D3D', '#22c55e', '#3f3c6d'],
      borderRadius: 4,
      borderSkipped: false,
    }],
  }), [totalLeads, ventasCerradas, totalEquipos]);

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
        showPaisFilter={showPaisFilter}
      >
        <div className="space-y-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="grid grid-cols-3 lg:flex lg:flex-col lg:w-44 gap-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3">
              {[1, 2, 3].map(i => <Skeleton key={i} className="h-16" />)}
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
        showPaisFilter={showPaisFilter}
        isSuperAdmin={isSuperAdmin}
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
      showPaisFilter={showPaisFilter}
      isSuperAdmin={isSuperAdmin}
    >
      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="grid grid-cols-3 lg:flex lg:flex-col lg:w-44 gap-3">
            <div className="bg-white border border-[#EEEEEC] rounded-xl p-3 flex flex-col items-center justify-center">
              <p className="text-[9px] lg:text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-0.5 text-center">Lead No Calificado</p>
              <p className="text-lg lg:text-xl font-bold text-[#1F1D3D]">{leadsNoAgendados}</p>
            </div>

            <div className="bg-white border border-[#EEEEEC] rounded-xl p-3 flex flex-col items-center justify-center">
              <p className="text-[9px] lg:text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-0.5 text-center">Lead Calificado</p>
              <p className="text-lg lg:text-xl font-bold text-[#1F1D3D]">{leadsAceptados}</p>
            </div>

            <div className="bg-white border border-[#EEEEEC] rounded-xl p-3 flex flex-col items-center justify-center">
              <p className="text-[9px] lg:text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-0.5 text-center">Total Leads</p>
              <p className="text-lg lg:text-xl font-bold text-[#1F1D3D]">{totalLeads}</p>
            </div>
          </div>

          <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-3 gap-3">
            <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex flex-col items-center">
              <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-1 text-center">Leads gestionados por comercial</p>
              <div className="flex-1 flex items-center justify-center w-full">
                <p className="text-4xl lg:text-6xl font-bold text-[#1F1D3D]">{atendidosPorAsesor}</p>
              </div>
              {leadsNoAceptados > 0 && (
                <p className="text-[10px] text-red-600 mt-0.5 text-center">Leads pendientes de aceptar por Comercial: {leadsNoAceptados}</p>
              )}
            </div>

            <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex flex-col items-center">
              <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-1 text-center">Leads gestionados por lider de ventas</p>
              <div className="flex-1 flex items-center justify-center w-full">
                <p className="text-4xl lg:text-6xl font-bold text-[#1F1D3D]">{atendidosPorLider}</p>
              </div>
            </div>

            <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex flex-col items-center">
              <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-1 text-center">Leads gestionados por Gerencial</p>
              <div className="flex-1 flex items-center justify-center w-full">
                <p className="text-4xl lg:text-6xl font-bold text-[#1F1D3D]">{atendidosPorGerente}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 lg:p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-sm lg:text-base font-semibold text-[#1F1D3D]">Pipeline de Ventas</h2>
              <p className="text-[10px] lg:text-xs text-[#B5B5AE] mt-0.5">Distribución por etapa</p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              {chartData.showToggle ? (
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setShowCerradas(!showCerradas)}
                    className={`flex items-center gap-1.5 transition-opacity ${showCerradas ? 'opacity-100' : 'opacity-40'}`}
                  >
                    <div className="w-3 h-3 rounded-sm bg-[#22c55e]" />
                    <span className="text-xs text-[#35325B]">Ganadas</span>
                    <span className="text-sm font-bold text-[#1F1D3D]">{chartData.ventasCerradas}</span>
                  </button>
                  <button
                    onClick={() => setShowPerdidas(!showPerdidas)}
                    className={`flex items-center gap-1.5 transition-opacity ${showPerdidas ? 'opacity-100' : 'opacity-40'}`}
                  >
                    <div className="w-3 h-3 rounded-sm bg-[#ef4444]" />
                    <span className="text-xs text-[#35325B]">Perdidas</span>
                    <span className="text-sm font-bold text-[#1F1D3D]">{chartData.ventasPerdidas}</span>
                  </button>
                </div>
              ) : (
                <div className="text-right">
                  <span className="text-xl lg:text-2xl font-bold text-[#1F1D3D]">{totalLeads}</span>
                  <p className="text-[10px] lg:text-xs text-[#B5B5AE]">Total leads</p>
                </div>
              )}
            </div>
          </div>

          {stageData.length === 0 && (
            <div className="flex items-center justify-center py-8 lg:py-12">
              <p className="text-sm text-[#B5B5AE]">Sin datos de etapas disponibles</p>
            </div>
          )}
          {stageData.length > 0 && (
            <ChartWrapper
              type="bar"
              data={{
                labels: chartData.labels,
                datasets: chartData.datasets,
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
                        const datasetLabel = ctx.dataset.label || '';
                        return ` ${val} ${datasetLabel} (${pct}%)`;
                      },
                    },
                  },
                },
                scales: {
                  x: {
                    stacked: chartData.isStacked,
                    grid: { color: 'rgba(0,0,0,0.04)' },
                    ticks: {
                      font: { size: 11, family: 'Inter' },
                      color: '#B5B5AE',
                    },
                  },
                  y: {
                    stacked: chartData.isStacked,
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

        <ChartCard title="Leads vs Cierre vs Equipos" subtitle="Comparación general">
          <ChartWrapper
            type="bar"
            data={cierreChartData}
            height="200px"
            options={{
              plugins: {
                legend: { display: false },
              },
              scales: {
                y: {
                  grid: { color: 'rgba(0,0,0,0.04)' },
                  ticks: {
                    font: { size: 11, family: 'Inter' },
                    color: '#B5B5AE',
                  },
                },
                x: {
                  grid: { display: false },
                  ticks: {
                    font: { size: 12, family: 'Inter', weight: '500' },
                    color: '#35325B',
                  },
                },
              },
            }}
          />
        </ChartCard>
      </div>
    </Shell>
  );
}