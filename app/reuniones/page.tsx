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
  const status = reunion.reunion_status || reunion.estado || '';
  const seg = reunion.seguimiento_json || {};
  const resultado = reunion.resultado_venta || seg.resultado_propuesta || '';
  const s = status.toLowerCase();
  const isGanada = resultado.toLowerCase().includes('ganada') || resultado.toLowerCase().includes('cerrada');
  const isPerdida = resultado.toLowerCase().includes('perdida');
  if (isGanada) return <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">Cerrada (Ganada)</span>;
  if (isPerdida) return <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded">Perdida</span>;
  if (s.includes('complet') || s.includes('done') || s.includes('cerrad') || s.includes('exitoso')) {
    return <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">Completada</span>;
  }
  if (s.includes('cancel') || s.includes('lost')) {
    return <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded">Cancelada</span>;
  }
  if (s.includes('pending') || s.includes('pendiente') || s.includes('precio') || s.includes('presupuesto') || s.includes('cotiz')) {
    return <span className="text-xs font-medium text-yellow-700 bg-yellow-50 px-2 py-1 rounded">Presupuesto</span>;
  }
  if (s.includes('process') || s.includes('proceso')) {
    return <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">En Proceso</span>;
  }
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

  const rows = [
    { label: 'Lead', value: reunion.client_id || '—' },
    { label: 'Cliente', value: reunion.client_name || reunion.cliente || '—' },
    { label: 'Asesor', value: reunion.advisor_name || '—' },
    { label: 'Fecha Creación', value: reunion.created_at ? new Date(reunion.created_at).toLocaleDateString('es-ES') : '—' },
    { label: 'Resultado', value: isGanada ? 'Cerrada (Ganada)' : isPerdida ? 'Perdida' : resultado || '—', highlight: isGanada ? 'green' : isPerdida ? 'red' : undefined },
    ...(reunion.categoria_cierre ? [{ label: 'Categoría', value: reunion.categoria_cierre }] : []),
    ...(seg.motivo_perdida ? [{ label: 'Motivo Pérdida', value: seg.motivo_perdida }] : []),
    { label: 'Fecha Feedback', value: reunion.advisor_feedback_at ? new Date(reunion.advisor_feedback_at).toLocaleString('es-ES') : '—' },
    { label: 'Min hasta retro', value: reunion.minutos_hasta_retro ?? '—' },
    { label: 'Tiene retroalimentación', value: reunion.tiene_retro ? 'Sí' : 'No', highlight: reunion.tiene_retro ? 'green' : 'gray' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-2xl w-[30rem] max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEEEEC]">
          <div>
            <h3 className="text-sm font-semibold text-[#1F1D3D]">Feedback</h3>
            <p className="text-xs text-[#B5B5AE] mt-0.5">{reunion.client_name || reunion.cliente}</p>
          </div>
          <button onClick={onClose} className="text-[#B5B5AE] hover:text-[#35325B] transition-colors">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1">
          <table className="w-full text-sm">
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-b border-[#EEEEEC] last:border-0">
                  <td className="px-5 py-3 text-[#B5B5AE] font-medium w-36 align-top">{row.label}</td>
                  <td className={`px-5 py-3 text-[#1F1D3D] font-medium ${row.highlight === 'green' ? 'text-green-600' : row.highlight === 'red' ? 'text-red-600' : row.highlight === 'gray' ? 'text-[#B5B5AE]' : ''}`}>
                    {row.value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="px-5 py-4 border-t border-[#EEEEEC]">
            <label className="text-xs font-medium text-[#B5B5AE] uppercase tracking-wider block mb-2">Retroalimentación</label>
            <div className="bg-[#F5F5ED] rounded-lg p-4 text-sm text-[#35325B] leading-relaxed">
              {reunion.advisor_feedback || 'Sin retroalimentación registrada'}
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