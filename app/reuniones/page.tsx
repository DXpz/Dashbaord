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

const COLORS = {
  dark: '#1F1D3D',
  medium: '#35325B',
  light: '#B5B5AE',
};

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
  if (s.includes('process') || s.includes('proceso')) {
    return <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">En Proceso</span>;
  }
  return <span className="text-xs text-gray-500">{status || '—'}</span>;
}

function StageBadge({ stage }: { stage: any }) {
  if (stage == null) return <span className="text-gray-400">—</span>;
  const n = Number(stage);
  const labels: Record<number, string> = { 1: 'Nueva', 2: 'Contactada', 3: 'Cualificada', 4: 'Propuesta', 5: 'Negociación', 6: 'Cerrada' };
  return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{labels[n] || `Etapa ${n}`}</span>;
}

export default function ReunionesPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { reuniones, loading } = useReuniones(filters);
  const connectionStatus = useConnectionStatus();
  const asesoresList = useAsesores(filters);

  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const AsesoresOptions = useMemo(() => asesoresList.map((a) => ({ value: a, label: a })), [asesoresList]);

  const filteredReuniones = useMemo(() => {
    if (!Array.isArray(reuniones)) return [];
    if (!searchTerm) return reuniones;
    const q = searchTerm.toLowerCase();
    return reuniones.filter((r: any) =>
      (r.client_name || r.cliente || '').toLowerCase().includes(q) ||
      (r.advisor_name || r.asesor || '').toLowerCase().includes(q) ||
      (r.subject || r.asunto || '').toLowerCase().includes(q) ||
      (r.country || r.pais || '').toLowerCase().includes(q)
    );
  }, [reuniones, searchTerm]);

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
        <div className="bg-white border border-[#EEEEEC]">
          <div className="px-5 py-4 flex items-center justify-between gap-4 border-b border-[#EEEEEC]">
            <div>
              <h3 className="text-sm font-medium text-[#1F1D3D]">Listado</h3>
              <p className="text-xs text-[#B5B5AE] mt-0.5">{filteredReuniones.length} reuniones</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B5B5AE]" />
                <Input
                  placeholder="Buscar..."
                  className="pl-9 w-48"
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                />
              </div>
              <div className="flex items-center gap-1 bg-[#F5F5ED] p-1 rounded">
                <Button variant="ghost" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 px-2">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-sm text-[#35325B] px-2 min-w-[60px] text-center">
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
                    <TableCell className="font-medium text-[#1F1D3D]">{reunion.client_name || reunion.cliente || '—'}</TableCell>
                    <TableCell className="text-[#B5B5AE]">{reunion.client_phone || reunion.telefono || '—'}</TableCell>
                    <TableCell className="text-[#35325B]">{reunion.advisor_name || reunion.asesor || '—'}</TableCell>
                    <TableCell>
                      <span className="text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-1 rounded">{reunion.country || reunion.pais || '—'}</span>
                    </TableCell>
                    <TableCell><StageBadge stage={reunion.opportunity_stage || reunion.etapa} /></TableCell>
                    <TableCell><StatusBadge status={reunion.reunion_status || reunion.estado || reunion.status} /></TableCell>
                    <TableCell className="text-[#B5B5AE]">{reunion.minutos_hasta_retro ?? reunion.min_retro ?? '—'}</TableCell>
                    <TableCell>
                      {reunion.propuesta || reunion.has_propuesta ? (
                        <span className="text-green-600 font-medium text-sm">Sí</span>
                      ) : (
                        <span className="text-[#B5B5AE] text-sm">No</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12 text-[#B5B5AE]">
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