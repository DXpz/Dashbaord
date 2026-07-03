'use client';

import { useState, useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { useConnectionStatus, useFilters, useListaAsesores } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Search, Users, TrendingUp, CheckCircle, XCircle, Percent } from 'lucide-react';

type MetricKey = 'apariciones' | 'aceptados' | 'rechazados' | 'pendientes' | 'ganados' | 'perdidos';

const COLORS = {
  dark: '#1F1D3D',
  medium: '#35325B',
  light: '#B5B5AE',
};

export default function AsesoresPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const connectionStatus = useConnectionStatus();
  const { data: listaData, loading } = useListaAsesores(filters);
  const [metric, setMetric] = useState<MetricKey>('apariciones');
  const [searchTerm, setSearchTerm] = useState('');

  const AsesoresOptions = useMemo(() => {
    const names = (listaData || []).map((a: any) => a.asesor || a.nombre_vendedor).filter(Boolean);
    const unique = Array.from(new Set(names));
    return unique.map((v: string) => ({ value: v, label: v }));
  }, [listaData]);

  const tableData = useMemo(() => {
    if (!Array.isArray(listaData) || !listaData.length) return [];
    return listaData.map((a: any) => ({
      asesor: a.asesor || a.nombre_vendedor || '—',
      apariciones: a.apariciones ?? 0,
      aceptados: a.aceptados ?? 0,
      rechazados: a.rechazados ?? 0,
      pendientes: a.pendientes ?? 0,
      ganados: a.ganados ?? 0,
      perdidos: a.perdidos ?? 0,
      tasa_aceptacion: a.tasa_aceptacion ?? 0,
      tasa_rechazo: a.tasa_rechazo ?? 0,
      tasa_cierre_ganado: a.tasa_cierre_ganado ?? 0,
      tasa_cierre_perdido: a.tasa_cierre_perdido ?? 0,
    }));
  }, [listaData]);

  const filteredData = useMemo(() => {
    if (!searchTerm) return tableData;
    return tableData.filter((row: any) =>
      row.asesor?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tableData, searchTerm]);

  const sortedData = useMemo(() => {
    if (!filteredData.length) return filteredData;
    return [...filteredData].sort((a: any, b: any) => (b[metric] ?? 0) - (a[metric] ?? 0));
  }, [filteredData, metric]);

  const chartLabels = tableData.map((r: any) => r.asesor).slice(0, 20);
  const chartValues = tableData.map((r: any) => r[metric] ?? 0).slice(0, 20);
  const chartData = chartLabels.length > 0 ? { labels: chartLabels, values: chartValues } : null;

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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            {[...Array(4)].map((_, i) => (<Skeleton key={i} className="h-20" />))}
          </div>
          <Skeleton className="h-64 lg:h-80" />
          <Skeleton className="h-64 lg:h-96" />
        </div>
      ) : (
        <div className="space-y-4 lg:space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="bg-white border border-[#EEEEEC] rounded-xl p-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-[#1F1D3D]/5 flex items-center justify-center shrink-0">
                <Users className="w-4 h-4 text-[#1F1D3D]" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] lg:text-xs text-[#B5B5AE] uppercase tracking-wider truncate">Total Asesores</p>
                <p className="text-lg lg:text-2xl font-bold text-[#1F1D3D]">{stats.total}</p>
              </div>
            </div>
            <div className="bg-white border border-[#EEEEEC] rounded-xl p-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-50 flex items-center justify-center shrink-0">
                <TrendingUp className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] lg:text-xs text-[#B5B5AE] uppercase tracking-wider truncate">Mejor</p>
                <p className="text-xs lg:text-base font-bold text-[#1F1D3D] truncate">{stats.mejores[0]?.asesor || '—'}</p>
              </div>
            </div>
            <div className="bg-white border border-[#EEEEEC] rounded-xl p-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-50 flex items-center justify-center shrink-0">
                <CheckCircle className="w-4 h-4 text-blue-600" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] lg:text-xs text-[#B5B5AE] uppercase tracking-wider truncate">Top Aceptados</p>
                <p className="text-lg lg:text-2xl font-bold text-[#1F1D3D]">{stats.mejores[0]?.aceptados ?? '—'}</p>
              </div>
            </div>
            <div className="bg-white border border-[#EEEEEC] rounded-xl p-3 flex items-center gap-2">
              <div className="w-8 h-8 bg-red-50 flex items-center justify-center shrink-0">
                <XCircle className="w-4 h-4 text-red-500" strokeWidth={1.5} />
              </div>
              <div className="min-w-0">
                <p className="text-[9px] lg:text-xs text-[#B5B5AE] uppercase tracking-wider truncate">Rechazados</p>
                <p className="text-lg lg:text-2xl font-bold text-[#1F1D3D]">{stats.mejores[0]?.rechazados ?? '—'}</p>
              </div>
            </div>
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
                    <option value="apariciones">Apariciones</option>
                    <option value="aceptados">Aceptados</option>
                    <option value="rechazados">Rechazados</option>
                    <option value="pendientes">Pendientes</option>
                    <option value="ganados">Ganados</option>
                    <option value="perdidos">Perdidos</option>
                  </select>
                }
              >
                {chartData ? (
                  <ChartWrapper type="bar" data={{
                    labels: chartData.labels,
                    datasets: [{
                      data: chartData.values,
                      backgroundColor: COLORS.dark,
                      borderRadius: 4,
                      borderSkipped: false,
                    }],
                  }} height="240px" />
                ) : (
                  <div className="h-48 lg:h-64 flex items-center justify-center text-[#B5B5AE] text-sm">Sin datos</div>
                )}
              </ChartCard>
            </div>

            <div className="bg-white border border-[#EEEEEC] p-4">
              <h3 className="text-sm font-medium text-[#1F1D3D] mb-3">Top 3</h3>
              <div className="space-y-2">
                {stats.mejores.map((asesor: any, i: number) => (
                  <div key={asesor.asesor || i} className="flex items-center justify-between p-2.5 bg-[#F5F5ED] rounded">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-5 h-5 flex items-center justify-center bg-[#1F1D3D] text-[#F5F5ED] text-[10px] font-bold rounded-full shrink-0">{i + 1}</span>
                      <span className="text-xs lg:text-sm font-medium text-[#35325B] truncate">{asesor.asesor || '—'}</span>
                    </div>
                    <span className="text-sm lg:text-base font-semibold text-[#1F1D3D] shrink-0 ml-2">{asesor[metric] ?? 0}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#EEEEEC] overflow-x-auto">
            <div className="px-4 py-3 flex items-center justify-between border-b border-[#EEEEEC] min-w-[600px]">
              <h3 className="text-sm font-medium text-[#1F1D3D]">Detalle</h3>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B5B5AE]" />
                <input
                  type="text"
                  placeholder="Buscar..."
                  className="pl-8 pr-3 py-1.5 w-36 text-sm bg-transparent outline-none border border-[#EEEEEC] rounded lg:border-none lg:w-48"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="whitespace-nowrap">Asesor</TableHead>
                  <TableHead className="whitespace-nowrap">Apar.</TableHead>
                  <TableHead className="whitespace-nowrap">Acep.</TableHead>
                  <TableHead className="whitespace-nowrap">Rech.</TableHead>
                  <TableHead className="whitespace-nowrap">Pend.</TableHead>
                  <TableHead className="whitespace-nowrap">Gan.</TableHead>
                  <TableHead className="whitespace-nowrap">Perd.</TableHead>
                  <TableHead className="whitespace-nowrap">Tasa Acep %</TableHead>
                  <TableHead className="whitespace-nowrap">Tasa Cierre %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.length > 0 ? (
                  sortedData.map((row: any, i: number) => (
                    <TableRow key={row.asesor || i}>
                      <TableCell className="font-medium text-[#1F1D3D] whitespace-nowrap">{row.asesor || '—'}</TableCell>
                      <TableCell>{row.apariciones}</TableCell>
                      <TableCell>{row.aceptados}</TableCell>
                      <TableCell>{row.rechazados}</TableCell>
                      <TableCell>{row.pendientes}</TableCell>
                      <TableCell>{row.ganados}</TableCell>
                      <TableCell>{row.perdidos}</TableCell>
                      <TableCell className="text-[#B5B5AE] whitespace-nowrap">{row.tasa_aceptacion}%</TableCell>
                      <TableCell className="text-[#B5B5AE] whitespace-nowrap">{row.tasa_cierre_ganado}%</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 lg:py-12 text-[#B5B5AE]">Sin datos</TableCell>
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