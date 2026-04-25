'use client';

import { useState, useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { useReuniones, useConnectionStatus, useAsesores, useFilters } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 20;

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase() || '';
  if (s.includes('complet') || s.includes('done') || s.includes('cerrad')) {
    return <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">Completada</span>;
  }
  if (s.includes('cancel') || s.includes('lost')) {
    return <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded">Cancelada</span>;
  }
  if (s.includes('pending') || s.includes('pendiente')) {
    return <span className="text-xs font-medium text-yellow-700 bg-yellow-50 px-2 py-1 rounded">Pendiente</span>;
  }
  return <span className="text-xs text-gray-500">{status || '—'}</span>;
}

export default function ReunionesPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { reuniones, loading } = useReuniones(filters);
  const connectionStatus = useConnectionStatus();
  const asesoresList = useAsesores(filters);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const AsesoresOptions = useMemo(() => asesoresList.map((a) => ({ value: a, label: a })), [asesoresList]);

  const filteredReuniones = Array.isArray(reuniones)
    ? searchTerm
      ? reuniones.filter((r: any) =>
          r.cliente?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.asesor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.asunto?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      : reuniones
    : [];

  const totalPages = Math.max(1, Math.ceil(filteredReuniones.length / PAGE_SIZE));
  const paginatedReuniones = filteredReuniones.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <Shell
      pageTitle="Reuniones"
      filters={filters}
      onFilterChange={handleFilterChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={AsesoresOptions}
      connectionStatus={connectionStatus}
    >
      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="bg-white border border-gray-100">
          <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-gray-100">
            <h3 className="text-sm font-medium text-gray-900">Listado</h3>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar..."
                  className="pl-9 w-48"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <div className="flex items-center gap-1 bg-gray-50 p-1 rounded">
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 px-2">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-gray-600 px-2 min-w-[60px] text-center">
                  {currentPage} / {totalPages}
                </span>
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages} className="h-8 px-2">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Asesor</TableHead>
                <TableHead>Asunto</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Min</TableHead>
                <TableHead>Prop</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReuniones.length > 0 ? (
                paginatedReuniones.map((reunion: any, i: number) => (
                  <TableRow
                    key={reunion.id || reunion.opportunityNumber || i}
                    className={`animate-slide-up delay-${Math.min(i + 1, 8)}`}
                  >
                    <TableCell className="font-medium text-gray-900">{reunion.cliente || '—'}</TableCell>
                    <TableCell className="text-gray-500">{reunion.telefono || reunion.phone || '—'}</TableCell>
                    <TableCell className="text-gray-600">{reunion.asesor || '—'}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-gray-600">{reunion.asunto || reunion.subject || '—'}</TableCell>
                    <TableCell>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{reunion.pais || '—'}</span>
                    </TableCell>
                    <TableCell className="text-gray-600">{reunion.etapa || reunion.stage || '—'}</TableCell>
                    <TableCell><StatusBadge status={reunion.estado || reunion.status} /></TableCell>
                    <TableCell className="text-gray-500">{reunion.min_retro ?? '—'}</TableCell>
                    <TableCell>
                      {reunion.propuesta ? (
                        <span className="text-green-600 font-medium text-sm">Sí</span>
                      ) : (
                        <span className="text-gray-400 text-sm">No</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-gray-400">
                    Sin reuniones
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </Shell>
  );
}