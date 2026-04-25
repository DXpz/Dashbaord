'use client';

import { useState, useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { KPICard } from '@/components/kpi/KPICard';
import { useDashboard, useConnectionStatus, useAsesores, useFilters } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ArrowUpDown, Search, Users, TrendingUp, CheckCircle, XCircle } from 'lucide-react';

type MetricKey = 'reuniones' | 'aceptaciones' | 'rechazos' | 'propuestas' | 'ventas_cerradas';

const colors = {
  dark: '#1F1D3D',
  medium: '#35325B',
  light: '#B5B5AE',
};

export default function AsesoresPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { data, loading, error } = useDashboard(filters);
  const connectionStatus = useConnectionStatus();
  const asesoresList = useAsesores(filters);

  const [metric, setMetric] = useState<MetricKey>('reuniones');
  const [searchTerm, setSearchTerm] = useState('');

  const AsesoresOptions = useMemo(() => asesoresList.map((a) => ({ value: a, label: a })), [asesoresList]);
  const chartData = data?.chart_asesores || data?.asesores_data || null;

  const tableData = useMemo(() => {
    const rawData = data?.asesores_data || [];
    if (!searchTerm) return rawData;
    return rawData.filter((row: any) =>
      row.nombre?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [data, searchTerm]);

  const sortedData = useMemo(() => {
    if (!tableData.length) return tableData;
    return [...tableData].sort((a: any, b: any) => {
      const aVal = a[metric] ?? 0;
      const bVal = b[metric] ?? 0;
      return bVal - aVal;
    });
  }, [tableData, metric]);

  const stats = useMemo(() => {
    if (!tableData.length) return { total: 0, mejores: [], peores: [] };
    const sorted = [...tableData].sort((a, b) => (b[metric] ?? 0) - (a[metric] ?? 0));
    return {
      total: tableData.length,
      mejores: sorted.slice(0, 3),
      peores: sorted.slice(-3).reverse(),
    };
  }, [tableData, metric]);

  return (
    <Shell
      pageTitle="Asesores"
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
          <Skeleton className="h-80" />
          <Skeleton className="h-96" />
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <p className="text-sm text-[#B5B5AE]">Error: {error}</p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Total Asesores"
              value={stats.total}
              icon={Users}
              className="delay-1"
            />
            <KPICard
              label="Mejor Desempeño"
              value={stats.mejores[0]?.nombre || '—'}
              icon={TrendingUp}
              className="delay-2"
            />
            <KPICard
              label="Top Aceptaciones"
              value={stats.mejores[0]?.aceptaciones ?? '—'}
              icon={CheckCircle}
              className="delay-3"
            />
            <KPICard
              label="Rechazos"
              value={stats.peores[0]?.rechazos ?? '—'}
              icon={XCircle}
              className="delay-4"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <ChartCard
                title="Rendimiento"
                actions={
                  <select
                    className="text-xs bg-transparent outline-none cursor-pointer text-[#35325B]"
                    value={metric}
                    onChange={(e) => setMetric(e.target.value as MetricKey)}
                  >
                    <option value="reuniones">Reuniones</option>
                    <option value="aceptaciones">Aceptaciones</option>
                    <option value="rechazos">Rechazos</option>
                    <option value="propuestas">Propuestas</option>
                    <option value="ventas_cerradas">Ventas</option>
                  </select>
                }
              >
                {chartData?.labels ? (
                  <ChartWrapper type="bar" data={{
                    labels: chartData.labels,
                    datasets: [{
                      data: chartData.values?.[metric] || [],
                      backgroundColor: colors.dark,
                      borderRadius: 4,
                      borderSkipped: false,
                    }],
                  }} height="240px" />
                ) : (
                  <div className="h-64 flex items-center justify-center text-[#B5B5AE] text-sm">Sin datos</div>
                )}
              </ChartCard>
            </div>

            <div className="bg-white border border-[#EEEEEC] p-5">
              <h3 className="text-sm font-medium text-[#1F1D3D] mb-4">Top 3</h3>
              <div className="space-y-3">
                {stats.mejores.map((asesor, i) => (
                  <div key={asesor.nombre || i} className="flex items-center justify-between p-3 bg-[#F5F5ED] rounded">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-[#1F1D3D] text-[#F5F5ED] text-xs font-bold rounded-full">{i + 1}</span>
                      <span className="text-sm font-medium text-[#35325B]">{asesor.nombre || '—'}</span>
                    </div>
                    <span className="text-sm font-semibold text-[#1F1D3D]">{asesor[metric] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#EEEEEC]">
            <div className="px-5 py-4 flex items-center justify-between border-b border-[#EEEEEC]">
              <h3 className="text-sm font-medium text-[#1F1D3D]">Detalle</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B5B5AE]" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-9 pr-4 py-2 w-48 text-sm bg-transparent outline-none border-none"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asesor</TableHead>
                  <TableHead>Reuniones</TableHead>
                  <TableHead>Aceptados</TableHead>
                  <TableHead>Rechazos</TableHead>
                  <TableHead>Tasa %</TableHead>
                  <TableHead>Retro</TableHead>
                  <TableHead>Propuestas</TableHead>
                  <TableHead>Ventas</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.length > 0 ? (
                  sortedData.map((row: any, i: number) => (
                    <TableRow key={row.nombre || i}>
                      <TableCell className="font-medium text-[#1F1D3D]">{row.nombre || '—'}</TableCell>
                      <TableCell>{row.reuniones ?? '—'}</TableCell>
                      <TableCell>{row.aceptaciones ?? '—'}</TableCell>
                      <TableCell>{row.rechazos ?? '—'}</TableCell>
                      <TableCell className="text-[#B5B5AE]">{row.tasa_decisiones_aceptacion ?? '—'}%</TableCell>
                      <TableCell className="text-[#B5B5AE]">{row.con_retro ?? '—'}</TableCell>
                      <TableCell className="text-[#B5B5AE]">{row.propuestas ?? '—'}</TableCell>
                      <TableCell className="font-medium text-[#1F1D3D]">{row.ventas_cerradas ?? '—'}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-[#B5B5AE]">Sin datos</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </Shell>
  );
}