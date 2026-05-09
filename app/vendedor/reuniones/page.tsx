'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';
import { API } from '@/services/api';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText, ChevronLeft, ChevronRight, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const PAGE_SIZE = 20;

export default function VendedorReunionesPage() {
  const { user } = useAuth();
  const [reuniones, setReuniones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [feedbackReunion, setFeedbackReunion] = useState<any>(null);

  const fetchReuniones = useCallback(async () => {
    setLoading(true);
    try {
      const result = await API.reuniones('', '', 200, 0, { nombre: user?.full_name });
      const list = result?.items || result?.reuniones || (Array.isArray(result) ? result : []);
      setReuniones(list);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.full_name]);

  useEffect(() => {
    fetchReuniones();
  }, [fetchReuniones]);

  const filteredReuniones = useMemo(() => {
    if (!searchTerm) return reuniones;
    const q = searchTerm.toLowerCase();
    return reuniones.filter((r: any) =>
      (r.client_name || '').toLowerCase().includes(q) ||
      (r.client_phone || '').toLowerCase().includes(q) ||
      (r.subject || '').toLowerCase().includes(q)
    );
  }, [reuniones, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredReuniones.length / PAGE_SIZE));
  const paginatedReuniones = filteredReuniones.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#B5B5AE]" />
          <Input
            placeholder="Buscar..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
          />
        </div>
        <div className="ml-auto flex items-center gap-1 bg-[#F5F5ED] p-1 rounded">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="h-8 px-2"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-[#35325B] px-2 min-w-[60px] text-center">
            {currentPage} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="h-8 px-2"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-96 w-full" />
      ) : (
        <div className="bg-white border border-[#EEEEEC]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cliente</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Etapa</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedReuniones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-[#B5B5AE] py-8">
                    No hay reuniones registradas
                  </TableCell>
                </TableRow>
              ) : (
                paginatedReuniones.map((reunion: any) => (
                  <TableRow key={reunion.id}>
                    <TableCell className="font-medium text-[#1F1D3D]">
                      {reunion.client_name || '—'}
                    </TableCell>
                    <TableCell className="text-[#B5B5AE] text-xs">
                      {reunion.created_at ? new Date(reunion.created_at).toLocaleDateString('es-ES') : '—'}
                    </TableCell>
                    <TableCell className="text-[#B5B5AE] text-xs">
                      {reunion.client_phone || '—'}
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-1 rounded">
                        {reunion.country || reunion.pais || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                        {reunion.opportunity_stage_label || '—'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge reunion={reunion} />
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" onClick={() => setFeedbackReunion(reunion)} className="p-1">
                        <FileText className="h-4 w-4 text-[#35325B]" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {feedbackReunion && (
        <FeedbackModal reunion={feedbackReunion} onClose={() => setFeedbackReunion(null)} />
      )}
    </div>
  );
}

function StatusBadge({ reunion }: { reunion: any }) {
  const status = reunion.reunion_status || reunion.status || '';
  const resultado = reunion.resultado_venta || '';
  if (resultado === 'perdida') return <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded">Perdida</span>;
  if (resultado === 'ganancia') return <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">Cerrada</span>;
  if (status === 'pending') return <span className="text-xs font-medium text-yellow-700 bg-yellow-50 px-2 py-1 rounded">Pendiente</span>;
  if (status === 'en_proceso') return <span className="text-xs font-medium text-blue-700 bg-blue-50 px-2 py-1 rounded">En Proceso</span>;
  if (status === 'cerrado') return <span className="text-xs font-medium text-green-700 bg-green-50 px-2 py-1 rounded">Cerrado</span>;
  if (status === 'alerted') return <span className="text-xs font-medium text-red-700 bg-red-50 px-2 py-1 rounded">Alertado</span>;
  return <span className="text-xs text-gray-500">{status || '—'}</span>;
}

function FeedbackModal({ reunion, onClose }: { reunion: any; onClose: () => void }) {
  const seg = reunion.seguimiento_json || {};
  const resultado = reunion.resultado_venta || seg.resultado_propuesta || seg.resultado_cierre || '';
  const isGanada = resultado.toLowerCase().includes('ganada') || resultado.toLowerCase().includes('cerrada');
  const isPerdida = resultado.toLowerCase().includes('perdida');
  const retroalimentacion = reunion.advisor_feedback || seg.retroalimentacion || seg.comentario || 'Sin retroalimentación registrada.';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg mx-4 max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEEEEC]">
          <div>
            <h2 className="text-sm font-semibold text-[#1F1D3D]">Detalle de Reunión</h2>
            <p className="text-xs text-[#B5B5AE]">{reunion.client_name}</p>
          </div>
          <button onClick={onClose} className="text-[#B5B5AE] hover:text-[#35325B]">
            ✕
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-[10px] text-[#B5B5AE] uppercase tracking-wider mb-1">Etapa</p>
              <p className="font-medium text-[#1F1D3D]">{reunion.opportunity_stage_label || '—'}</p>
            </div>
            <div>
              <p className="text-[10px] text-[#B5B5AE] uppercase tracking-wider mb-1">Resultado</p>
              <p className={`font-medium ${isGanada ? 'text-green-600' : isPerdida ? 'text-red-600' : 'text-[#1F1D3D]'}`}>
                {resultado || '—'}
              </p>
            </div>
            {reunion.country && (
              <div>
                <p className="text-[10px] text-[#B5B5AE] uppercase tracking-wider mb-1">País</p>
                <p className="font-medium text-[#1F1D3D]">{reunion.country}</p>
              </div>
            )}
            {reunion.client_phone && (
              <div>
                <p className="text-[10px] text-[#B5B5AE] uppercase tracking-wider mb-1">Teléfono</p>
                <p className="font-medium text-[#1F1D3D]">{reunion.client_phone}</p>
              </div>
            )}
          </div>
          <div className="pt-4 border-t border-[#EEEEEC]">
            <p className="text-[10px] text-[#B5B5AE] uppercase tracking-wider mb-2">Retroalimentación</p>
            <div className="bg-[#F5F5ED] rounded-lg p-4 text-sm text-[#35325B] leading-relaxed">
              {retroalimentacion}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}