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
    const unique = [...new Set(names)];
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
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (<Skeleton key={i} className="h-24" />))}
          </div>
          <Skeleton className="h-80" />
          <Skeleton className="h-96" />
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-[#1F1D3D]/5 flex items-center justify-center">
                <Users className="w-5 h-5 text-[#1F1D3D]" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-[#B5B5AE] uppercase tracking-wider">Total Asesores</p>
                <p className="text-2xl font-bold text-[#1F1D3D]">{stats.total}</p>
              </div>
            </div>
            <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-50 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-[#B5B5AE] uppercase tracking-wider">Mejor</p>
                <p className="text-base font-bold text-[#1F1D3D] truncate">{stats.mejores[0]?.asesor || '—'}</p>
              </div>
            </div>
            <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-[#B5B5AE] uppercase tracking-wider">Top Aceptados</p>
                <p className="text-2xl font-bold text-[#1F1D3D]">{stats.mejores[0]?.aceptados ?? '—'}</p>
              </div>
            </div>
            <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 flex items-center justify-center">
                <XCircle className="w-5 h-5 text-red-500" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-xs text-[#B5B5AE] uppercase tracking-wider">Rechazados</p>
                <p className="text-2xl font-bold text-[#1F1D3D]">{stats.mejores[0]?.rechazados ?? '—'}</p>
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
                  <div className="h-64 flex items-center justify-center text-[#B5B5AE] text-sm">Sin datos</div>
                )}
              </ChartCard>
            </div>

            <div className="bg-white border border-[#EEEEEC] p-5">
              <h3 className="text-sm font-medium text-[#1F1D3D] mb-4">Top 3</h3>
              <div className="space-y-3">
                {stats.mejores.map((asesor: any, i: number) => (
                  <div key={asesor.asesor || i} className="flex items-center justify-between p-3 bg-[#F5F5ED] rounded">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 flex items-center justify-center bg-[#1F1D3D] text-[#F5F5ED] text-xs font-bold rounded-full">{i + 1}</span>
                      <span className="text-sm font-medium text-[#35325B]">{asesor.asesor || '—'}</span>
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
                  <TableHead>Apariciones</TableHead>
                  <TableHead>Aceptados</TableHead>
                  <TableHead>Rechazados</TableHead>
                  <TableHead>Pendientes</TableHead>
                  <TableHead>Ganados</TableHead>
                  <TableHead>Perdidos</TableHead>
                  <TableHead>Tasa Acep. %</TableHead>
                  <TableHead>Tasa Cierre %</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedData.length > 0 ? (
                  sortedData.map((row: any, i: number) => (
                    <TableRow key={row.asesor || i}>
                      <TableCell className="font-medium text-[#1F1D3D]">{row.asesor || '—'}</TableCell>
                      <TableCell>{row.apariciones}</TableCell>
                      <TableCell>{row.aceptados}</TableCell>
                      <TableCell>{row.rechazados}</TableCell>
                      <TableCell>{row.pendientes}</TableCell>
                      <TableCell>{row.ganados}</TableCell>
                      <TableCell>{row.perdidos}</TableCell>
                      <TableCell className="text-[#B5B5AE]">{row.tasa_aceptacion}%</TableCell>
                      <TableCell className="text-[#B5B5AE]">{row.tasa_cierre_ganado}%</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-12 text-[#B5B5AE]">Sin datos</TableCell>
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