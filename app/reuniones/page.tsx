'use client';

import { useState, useMemo } from 'react';
import { Shell } from '@/components/layout/Shell';
import { useReuniones, useConnectionStatus, useAsesores, useFilters } from '@/hooks';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronLeft, ChevronRight, Search, FileText, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 20;

function StatusBadge({ reunion }: { reunion: any }) {
  const status = reunion.status || reunion.reunion_status || '';
  const resultado = reunion.resultado_venta || '';
  const s = status.toLowerCase();

  if (resultado === 'cerrada') return <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">Cerrada</span>;
  if (resultado === 'perdida') return <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded">Perdida</span>;
  if (s === 'pending') return <span className="text-xs font-medium text-yellow-700 bg-yellow-50 px-2 py-1 rounded">Pendiente</span>;
  if (s === 'en_proceso') return <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">En Proceso</span>;
  if (s === 'cerrado') return <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">Cerrado</span>;
  if (s === 'alerted') return <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded">Alertado</span>;
  return <span className="text-xs text-gray-500">{status || '—'}</span>;
}

function StageBadge({ stageLabel, stageNum }: { stageLabel?: string; stageNum?: number }) {
  if (stageLabel) return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">{stageLabel}</span>;
  if (stageNum == null) return <span className="text-gray-400">—</span>;
  return <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">Etapa {stageNum}</span>;
}

function FeedbackModal({ reunion, onClose }: { reunion: any; onClose: () => void }) {
  const seg = reunion.seguimiento_json || {};
  const resultado = reunion.resultado_venta || seg.resultado_propuesta || seg.resultado_cierre || '';
  const isGanada = resultado.toLowerCase().includes('ganada') || resultado.toLowerCase().includes('cerrada');
  const isPerdida = resultado.toLowerCase().includes('perdida');

  const resultadoColor = isGanada ? 'text-green-600' : isPerdida ? 'text-red-600' : 'text-[#1F1D3D]';
  const retroalimentacion = reunion.advisor_feedback || 'Sin retroalimentación registrada';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[32rem] max-h-[85vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#EEEEEC] shrink-0">
          <div>
            <h3 className="text-sm font-semibold text-[#1F1D3D]">Feedback del Lead</h3>
            <p className="text-xs text-[#B5B5AE] mt-0.5">{reunion.client_id} · {reunion.client_name || reunion.cliente}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[#B5B5AE] hover:text-[#35325B] hover:bg-[#F5F5ED] rounded transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
            <div>
              <p className="text-[10px] text-[#B5B5AE] uppercase tracking-wider mb-1">Lead</p>
              <p className="font-medium text-[#1F1D3D]">{reunion.client_id || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#B5B5AE] uppercase tracking-wider mb-1">Asesor</p>
              <p className="font-medium text-[#1F1D3D]">{reunion.advisor_name || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#B5B5AE] uppercase tracking-wider mb-1">Fecha Creación</p>
              <p className="font-medium text-[#1F1D3D]">
                {reunion.created_at ? new Date(reunion.created_at).toLocaleDateString('es-ES') : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#B5B5AE] uppercase tracking-wider mb-1">Fecha Feedback</p>
              <p className="font-medium text-[#1F1D3D]">
                {reunion.advisor_feedback_at ? new Date(reunion.advisor_feedback_at).toLocaleString('es-ES') : '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#B5B5AE] uppercase tracking-wider mb-1">Resultado</p>
              <p className={`font-semibold ${resultadoColor}`}>
                {isGanada ? 'Cerrada (Ganada)' : isPerdida ? 'Perdida' : resultado || '—'}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-[#B5B5AE] uppercase tracking-wider mb-1">Min hasta retro</p>
              <p className="font-medium text-[#1F1D3D]">{reunion.minutos_hasta_retro ?? '—'}</p>
            </div>
            {reunion.categoria_cierre && (
              <div>
                <p className="text-[10px] text-[#B5B5AE] uppercase tracking-wider mb-1">Categoría</p>
                <p className="font-medium text-[#1F1D3D]">{reunion.categoria_cierre}</p>
              </div>
            )}
            <div>
              <p className="text-[10px] text-[#B5B5AE] uppercase tracking-wider mb-1">Tiene retroalimentación</p>
              <p className={`font-medium ${reunion.tiene_retro ? 'text-green-600' : 'text-[#B5B5AE]'}`}>
                {reunion.tiene_retro ? 'Sí' : 'No'}
              </p>
            </div>
            {seg.motivo_perdida && (
              <div className="col-span-2">
                <p className="text-[10px] text-[#B5B5AE] uppercase tracking-wider mb-1">Motivo Pérdida</p>
                <p className="font-medium text-[#1F1D3D]">{seg.motivo_perdida}</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-[#EEEEEC]">
            <p className="text-[10px] text-[#B5B5AE] uppercase tracking-wider mb-2">Retroalimentación</p>
            <div className="bg-[#F5F5ED] rounded-lg p-4 text-sm text-[#35325B] leading-relaxed whitespace-pre-wrap break-words">
              {retroalimentacion}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ReunionesPage() {
  const { filters, handleFilterChange, handleFiltrar, handleLimpiar } = useFilters();
  const { reuniones, loading } = useReuniones(filters);
  const connectionStatus = useConnectionStatus();
  const asesoresList = useAsesores(filters);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackReunion, setFeedbackReunion] = useState<any>(null);

  const AsesoresOptions = useMemo(() => asesoresList.map((a) => ({ value: a, label: a })), [asesoresList]);

  const filteredReuniones = useMemo(() => {
    if (!Array.isArray(reuniones)) return [];
    let result = reuniones;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      result = result.filter((r: any) =>
        (r.client_name || r.cliente || '').toLowerCase().includes(q) ||
        (r.advisor_name || r.asesor || '').toLowerCase().includes(q) ||
        (r.subject || r.asunto || '').toLowerCase().includes(q) ||
        (r.country || r.pais || '').toLowerCase().includes(q) ||
        (r.client_id || r.opportunity_number || '').toString().toLowerCase().includes(q)
      );
    }
    return [...result].sort((a: any, b: any) => {
      const aNum = parseInt(a.client_id || a.opportunity_number || a.opportunityNumber || '0', 10);
      const bNum = parseInt(b.client_id || b.opportunity_number || b.opportunityNumber || '0', 10);
      return aNum - bNum;
    });
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
        <>
          {feedbackReunion && (
            <FeedbackModal reunion={feedbackReunion} onClose={() => setFeedbackReunion(null)} />
          )}
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
                <Button variant="outline" size="sm" onClick={() => window.open('https://front-leads-xi.vercel.app/', '_blank')} className="gap-1.5 text-xs h-8 border-[#EEEEEC] text-[#35325B] hover:bg-[#F5F5ED]">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
                  Formulario
                </Button>
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
                  <TableHead>Lead #</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Fecha Agendado</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Asesor</TableHead>
                  <TableHead>País</TableHead>
                  <TableHead>Etapa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Prop</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedReuniones.length > 0 ? (
                  paginatedReuniones.map((reunion: any, i: number) => (
                    <TableRow
                      key={reunion.id || reunion.opportunityNumber || i}
                      className={`animate-slide-up delay-${Math.min(i + 1, 8)}`}
                    >
                      <TableCell className="font-medium text-[#1F1D3D]">{reunion.client_id || reunion.opportunity_number || reunion.opportunityNumber || '—'}</TableCell>
                      <TableCell className="font-medium text-[#1F1D3D]">{reunion.client_name || reunion.cliente || '—'}</TableCell>
                      <TableCell className="text-[#B5B5AE] text-xs">
                        {reunion.created_at ? new Date(reunion.created_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '—'}
                      </TableCell>
                      <TableCell className="text-[#B5B5AE]">{reunion.client_phone || reunion.telefono || '—'}</TableCell>
                      <TableCell className="text-[#35325B]">{reunion.advisor_name || reunion.asesor || '—'}</TableCell>
                      <TableCell>
                        <span className="text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-1 rounded">{reunion.country || reunion.pais || '—'}</span>
                      </TableCell>
                      <TableCell><StageBadge stageLabel={reunion.opportunity_stage_label} stageNum={reunion.opportunity_stage} /></TableCell>
                      <TableCell><StatusBadge reunion={reunion} /></TableCell>
                      <TableCell>
                        {reunion.propuesta || reunion.has_propuesta ? (
                          <span className="text-green-600 font-medium text-sm">Sí</span>
                        ) : (
                          <span className="text-[#B5B5AE] text-sm">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => setFeedbackReunion(reunion)} className="text-[#35325B] hover:bg-[#F5F5ED] p-1">
                          <FileText className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-12 text-[#B5B5AE]">
                      Sin reuniones
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </Shell>
  );
}