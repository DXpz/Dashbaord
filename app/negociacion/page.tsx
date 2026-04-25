'use client';

import { useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { KPICard } from '@/components/kpi/KPICard';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { useDashboard, useConnectionStatus, useAsesores, useFilters } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Activity, TrendingUp, DollarSign, Users } from 'lucide-react';

const COLORS = {
  dark: '#1F1D3D',
  medium: '#35325B',
  light: '#B5B5AE',
  green: '#22c55e',
  red: '#c8151b',
};

export default function NegociacionPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { data, loading, error } = useDashboard(filters);
  const connectionStatus = useConnectionStatus();
  const AsesoresOptions = useAsesores(filters).map((a) => ({ value: a, label: a }));

  const resumen = data?.resumen || {};
  const negociacion = data?.negociacion || {};
  const decisiones = data?.decisiones || {};
  const porRubro = negociacion?.por_rubro || [];

  const kpis = useMemo(() => ({
    seguimientos: resumen.seguimientos_registrados ?? 0,
    propuestas: resumen.propuestas_registradas ?? 0,
    aceptados: decisiones.decisiones_aceptados ?? 0,
    rechazados: decisiones.decisiones_rechazados ?? 0,
  }), [resumen, decisiones]);

  const globalStats = negociacion?.global || {};

  const porRubroChartData = useMemo(() => {
    if (!porRubro.length) return null;
    return {
      labels: porRubro.map((r: any) => r.rubro || '—'),
      values: porRubro.map((r: any) => r.veces || 0),
    };
  }, [porRubro]);

  const conversionChartData = useMemo(() => {
    const aceptados = kpis.aceptados;
    const rechazados = kpis.rechazados;
    const total = aceptados + rechazados;
    if (total === 0) return null;
    return {
      labels: ['Aceptados', 'Rechazados'],
      values: [aceptados, rechazados],
    };
  }, [kpis]);

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
            <KPICard label="Seguimientos" value={kpis.seguimientos} icon={Activity} className="delay-1" />
            <KPICard label="Propuestas" value={kpis.propuestas} icon={DollarSign} className="delay-2" />
            <KPICard label="Aceptados" value={kpis.aceptados} icon={TrendingUp} className="delay-3" />
            <KPICard label="Rechazados" value={kpis.rechazados} icon={Users} className="delay-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <ChartCard title="Seguimientos por Rubro">
              {porRubroChartData ? (
                <ChartWrapper type="bar" data={{
                  labels: porRubroChartData.labels,
                  datasets: [{
                    data: porRubroChartData.values,
                    backgroundColor: COLORS.dark,
                    borderRadius: 4,
                    borderSkipped: false,
                  }],
                }} height="280px" />
              ) : (
                <div className="h-64 flex items-center justify-center text-[#B5B5AE] text-sm">Sin datos</div>
              )}
            </ChartCard>
            <ChartCard title="Tasa de Conversión">
              {conversionChartData ? (
                <ChartWrapper type="doughnut" data={{
                  labels: conversionChartData.labels,
                  datasets: [{
                    data: conversionChartData.values,
                    backgroundColor: [COLORS.green, COLORS.red],
                    borderWidth: 0,
                  }],
                }} height="280px" />
              ) : (
                <div className="h-64 flex items-center justify-center text-[#B5B5AE] text-sm">Sin datos</div>
              )}
            </ChartCard>
          </div>

          <div className="bg-white border border-[#EEEEEC] p-5">
            <h3 className="text-sm font-medium text-[#1F1D3D] mb-4">Resumen Global</h3>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-[#B5B5AE]">Con Resumen</span>
                <p className="text-lg font-semibold text-[#1F1D3D]">{globalStats.seguimientos_con_resumen ?? 0}</p>
              </div>
              <div>
                <span className="text-[#B5B5AE]">Negociaron</span>
                <p className="text-lg font-semibold text-[#1F1D3D]">{globalStats.negociaron ?? 0}</p>
              </div>
              <div>
                <span className="text-[#B5B5AE]">% Negociaron</span>
                <p className="text-lg font-semibold text-[#1F1D3D]">{globalStats.pct_negociaron_sobre_con_flag ?? '—'}</p>
              </div>
              <div>
                <span className="text-[#B5B5AE]">Con Flag</span>
                <p className="text-lg font-semibold text-[#1F1D3D]">{resumen.seguimientos_con_flag_negociacion ?? 0}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}