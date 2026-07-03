'use client';

import { Shell } from '@/components/layout/Shell';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Calendar,
  Search,
  ChevronLeft,
  ChevronRight,
  X,
  MapPin,
  Building2,
  Users,
  Clock,
} from 'lucide-react';
import { useState, useMemo } from 'react';

const PAGE_SIZE = 8;

type Estado = 'programada' | 'completada' | 'cancelada' | 'reagendada';
type Modalidad = 'presencial' | 'virtual' | 'telefonica';

interface Reunion {
  id: number;
  titulo: string;
  empresa: string;
  contacto: string;
  modalidad: Modalidad;
  fecha: string;
  hora: string;
  duracion: number;
  comercial: string;
  pais: 'SV' | 'GT';
  estado: Estado;
  notas: string;
  servicio: string;
}

const REUNIONES: Reunion[] = [
  { id: 1, titulo: 'Demo Colocación Tier III', empresa: 'Matus International', contacto: 'Norma Vargas', modalidad: 'presencial', fecha: '2026-07-08', hora: '10:00', duracion: 60, comercial: 'Patricia Salinas', pais: 'SV', estado: 'programada', notas: 'Cliente evaluando opciones Tier III para expansión Q3', servicio: 'Colocacion' },
  { id: 2, titulo: 'Presentación Backup Continuo', empresa: 'Interpharmas', contacto: 'recepcion', modalidad: 'virtual', fecha: '2026-07-05', hora: '14:30', duracion: 45, comercial: 'Patricia Salinas', pais: 'SV', estado: 'programada', notas: 'Resguardo de medios críticos para 3 sites', servicio: 'Servidor Backup' },
  { id: 3, titulo: 'Negociación Colocación', empresa: 'Grupo Natura', contacto: 'Diego Delgado', modalidad: 'presencial', fecha: '2026-07-03', hora: '09:00', duracion: 90, comercial: 'Carlos Barrera', pais: 'SV', estado: 'completada', notas: 'Pendiente firma de contrato. SLA 99.982% aceptado', servicio: 'Colocacion' },
  { id: 4, titulo: 'Cierre Dacotrans', empresa: 'Dacotrans', contacto: 'Carlos Barrera', modalidad: 'presencial', fecha: '2026-07-02', hora: '16:00', duracion: 60, comercial: 'Patricia Salinas', pais: 'SV', estado: 'completada', notas: 'Cierre exitoso. Activación en 15 días', servicio: 'Colocacion' },
  { id: 5, titulo: 'Llamada inicial', empresa: 'Chivo sa de cv', contacto: 'Karla Lopez', modalidad: 'telefonica', fecha: '2026-07-01', hora: '11:00', duracion: 30, comercial: 'Karla Lopez', pais: 'SV', estado: 'cancelada', notas: 'Cliente sin presupuesto Q3, reagendar Q4', servicio: 'Servidor Backup' },
  { id: 6, titulo: 'Revisión técnica', empresa: 'Trans Auto', contacto: 'Alvaro', modalidad: 'virtual', fecha: '2026-07-04', hora: '15:00', duracion: 45, comercial: 'Diego Delgado', pais: 'SV', estado: 'reagendada', notas: 'Reagendada por solicitud del cliente', servicio: 'Colocacion' },
  { id: 7, titulo: 'Propuesta UNO Rent', empresa: 'UNO RENT A CAR', contacto: 'Joel Edgardo Rodriguez', modalidad: 'presencial', fecha: '2026-07-09', hora: '10:30', duracion: 60, comercial: 'Patricia Salinas', pais: 'SV', estado: 'programada', notas: 'Revisar términos del SLA y penalizaciones', servicio: 'Colocacion' },
  { id: 8, titulo: 'Onboarding Imprenta Wilbot', empresa: 'Imprenta Wilbot', contacto: 'Reina de Vasquez', modalidad: 'virtual', fecha: '2026-06-28', hora: '14:00', duracion: 30, comercial: 'Diego Delgado', pais: 'SV', estado: 'completada', notas: 'Onboarding completado, listo para go-live', servicio: 'Servidor Backup' },
  { id: 9, titulo: 'Llamada Aeromantenimiento', empresa: 'Aeromantenimiento', contacto: 'Eduardo Herrera', modalidad: 'telefonica', fecha: '2026-07-10', hora: '09:30', duracion: 30, comercial: 'Karla Lopez', pais: 'SV', estado: 'programada', notas: 'Confirmar requerimientos de fibra dedicada', servicio: 'Fibra' },
  { id: 10, titulo: 'Demo Holcim ES', empresa: 'Holcim El Salvador', contacto: 'Maria Rodriguez', modalidad: 'presencial', fecha: '2026-07-12', hora: '11:00', duracion: 90, comercial: 'Patricia Salinas', pais: 'SV', estado: 'programada', notas: 'Tour por data center + presentación ejecutiva', servicio: 'Colocacion' },
  { id: 11, titulo: 'Revisión Banco Agricola', empresa: 'Banco Agricola', contacto: 'Jose Martinez', modalidad: 'virtual', fecha: '2026-07-11', hora: '15:30', duracion: 60, comercial: 'Carlos Barrera', pais: 'SV', estado: 'programada', notas: 'Q2 review + nuevos requisitos PCI-DSS', servicio: 'Servidor Backup' },
  { id: 12, titulo: 'Cierre Tigo GT', empresa: 'Tigo El Salvador', contacto: 'Carlos Mendez', modalidad: 'presencial', fecha: '2026-06-20', hora: '10:00', duracion: 60, comercial: 'Lucia Conde', pais: 'GT', estado: 'completada', notas: 'Renovación anual firmada', servicio: 'Colocacion' },
  { id: 13, titulo: 'Demo Bac Guatemala', empresa: 'BAC Guatemala', contacto: 'Roberto Mendez', modalidad: 'virtual', fecha: '2026-07-15', hora: '14:00', duracion: 45, comercial: 'Lucia Conde', pais: 'GT', estado: 'programada', notas: 'Backups cifrados AES-256 para 4 sites', servicio: 'Servidor Backup' },
  { id: 14, titulo: 'Negociación Tigo', empresa: 'Tigo Guatemala', contacto: 'Ana Lopez', modalidad: 'presencial', fecha: '2026-07-06', hora: '10:00', duracion: 90, comercial: 'Mabel Flores', pais: 'GT', estado: 'reagendada', notas: 'Cliente pidió más tiempo para revisión legal', servicio: 'Colocacion' },
];

const ESTADO_BADGE: Record<Estado, { label: string; bg: string; text: string; dot: string }> = {
  programada: { label: 'Programada', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  completada: { label: 'Completada', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  cancelada: { label: 'Cancelada', bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
  reagendada: { label: 'Reagendada', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
};

const MODALIDAD_ICON: Record<Modalidad, typeof MapPin> = {
  presencial: MapPin,
  virtual: Calendar,
  telefonica: Building2,
};

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  if (isNaN(d.getTime())) return iso;
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleDateString('es-ES', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function ReunionesDataRedPage() {
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Reunion | null>(null);
  const [filterEstado, setFilterEstado] = useState<'todos' | Estado>('todos');
  const [filterPais, setFilterPais] = useState<'todos' | 'SV' | 'GT'>('todos');

  const filtered = useMemo(() => {
    let list = REUNIONES;
    if (filterEstado !== 'todos') list = list.filter((r) => r.estado === filterEstado);
    if (filterPais !== 'todos') list = list.filter((r) => r.pais === filterPais);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(
        (r) =>
          r.titulo.toLowerCase().includes(q) ||
          r.empresa.toLowerCase().includes(q) ||
          r.contacto.toLowerCase().includes(q) ||
          r.comercial.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
  }, [query, filterEstado, filterPais]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const emptyFilters = {
    desde: '',
    hasta: '',
    pais: '',
    asesor: '',
    tipoLead: '',
    origen: '',
    tipoLlamada: '',
  };
  const handleChange = () => {};
  const handleFiltrar = () => {};
  const handleLimpiar = () => {};

  return (
    <Shell
      pageTitle="Reuniones"
      filters={emptyFilters}
      onFilterChange={handleChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={[]}
      connectionStatus="connected"
      showFilterBar={false}
    >
      <div className="space-y-5 max-w-7xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#1F1D3D]/5 flex items-center justify-center rounded-lg">
              <Calendar className="w-5 h-5 text-[#1F1D3D]" strokeWidth={1.5} />
            </div>
            <div>
              <p className="text-sm font-medium text-[#1F1D3D]">
                {filtered.length} Reuniones
              </p>
              <p className="text-xs text-[#B5B5AE] mt-0.5">
                Programadas, completadas y reagendadas
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#B5B5AE] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por título, empresa o contacto..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#EEEEEC] bg-[#F5F5ED] text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none focus:border-[#1F1D3D]"
            />
          </div>
          <select
            value={filterEstado}
            onChange={(e) => {
              setFilterEstado(e.target.value as typeof filterEstado);
              setPage(1);
            }}
            className="h-9 px-3 rounded-lg border border-[#EEEEEC] bg-white text-sm text-[#35325B] focus:outline-none focus:border-[#1F1D3D]"
          >
            <option value="todos">Todos los estados</option>
            <option value="programada">Programada</option>
            <option value="completada">Completada</option>
            <option value="reagendada">Reagendada</option>
            <option value="cancelada">Cancelada</option>
          </select>
          <select
            value={filterPais}
            onChange={(e) => {
              setFilterPais(e.target.value as typeof filterPais);
              setPage(1);
            }}
            className="h-9 px-3 rounded-lg border border-[#EEEEEC] bg-white text-sm text-[#35325B] focus:outline-none focus:border-[#1F1D3D]"
          >
            <option value="todos">Todos los países</option>
            <option value="SV">El Salvador</option>
            <option value="GT">Guatemala</option>
          </select>
        </div>

        <div className="bg-white border border-[#EEEEEC] rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Reunión</TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Modalidad</TableHead>
                <TableHead>Comercial</TableHead>
                <TableHead>País</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginated.length > 0 ? (
                paginated.map((r) => {
                  const badge = ESTADO_BADGE[r.estado];
                  const ModoIcon = MODALIDAD_ICON[r.modalidad];
                  return (
                    <TableRow
                      key={r.id}
                      onClick={() => setSelected(r)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-[#1F1D3D] rounded-md flex items-center justify-center flex-shrink-0">
                            <ModoIcon className="w-4 h-4 text-white" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-[#1F1D3D]">{r.titulo}</p>
                            <p className="text-xs text-[#B5B5AE]">{r.contacto}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-[#35325B]">{r.empresa}</span>
                        {r.servicio && (
                          <span className="block text-[10px] text-[#B5B5AE] mt-0.5">
                            {r.servicio}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-xs text-[#1F1D3D] font-medium">
                          {formatDate(r.fecha)}
                        </div>
                        <div className="text-[11px] text-[#B5B5AE]">
                          {r.hora} · {r.duracion} min
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-[#35325B] capitalize">
                          {r.modalidad}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-[#35325B]">
                        {r.comercial}
                      </TableCell>
                      <TableCell>
                        <span className="text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-1 rounded font-medium">
                          {r.pais}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${badge.bg} ${badge.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-[#B5B5AE]">
                    Sin reuniones que coincidan con los filtros
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-[#EEEEEC] flex items-center justify-between">
              <span className="text-xs text-[#B5B5AE]">
                Mostrando {(page - 1) * PAGE_SIZE + 1}–
                {Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
              </span>
              <div className="flex items-center gap-1 bg-[#F5F5ED] p-1 rounded">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="h-7 w-7 rounded flex items-center justify-center text-[#35325B] hover:bg-white disabled:opacity-40 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="text-xs text-[#35325B] px-2">
                  {page} / {totalPages}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="h-7 w-7 rounded flex items-center justify-center text-[#35325B] hover:bg-white disabled:opacity-40 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {selected && <ReunionDetalle reunion={selected} onClose={() => setSelected(null)} />}
    </Shell>
  );
}

function ReunionDetalle({ reunion, onClose }: { reunion: Reunion; onClose: () => void }) {
  const badge = ESTADO_BADGE[reunion.estado];
  const ModoIcon = MODALIDAD_ICON[reunion.modalidad];
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEEEEC] flex-shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-md bg-[#1F1D3D] flex items-center justify-center flex-shrink-0">
              <ModoIcon className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-[#1F1D3D] truncate">
                {reunion.titulo}
              </h3>
              <p className="text-xs text-[#B5B5AE] truncate">
                {reunion.empresa} · {reunion.servicio}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#B5B5AE] hover:text-[#35325B] hover:bg-[#F5F5ED] rounded-lg transition-colors flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${badge.bg} ${badge.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
              {badge.label}
            </span>
            <span className="text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-1 rounded font-medium">
              {reunion.pais}
            </span>
            <span className="text-xs bg-[#1F1D3D] text-white px-2 py-1 rounded font-medium">
              {reunion.servicio}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-[#F5F5ED] rounded-xl p-4 space-y-3">
              <h4 className="text-[10px] font-semibold text-[#B5B5AE] uppercase tracking-wider">
                Detalles
              </h4>
              <DetailRow label="Fecha" value={formatDate(reunion.fecha)} />
              <DetailRow label="Hora" value={`${reunion.hora} (${reunion.duracion} min)`} />
              <DetailRow label="Modalidad" value={reunion.modalidad} />
              <DetailRow label="País" value={reunion.pais} />
            </div>

            <div className="border border-[#EEEEEC] rounded-xl p-4 space-y-3">
              <h4 className="text-[10px] font-semibold text-[#B5B5AE] uppercase tracking-wider">
                Involucrados
              </h4>
              <DetailRow label="Empresa" value={reunion.empresa} />
              <DetailRow label="Contacto" value={reunion.contacto} />
              <DetailRow label="Comercial" value={reunion.comercial} />
            </div>
          </div>

          <div className="bg-[#1F1D3D] rounded-xl p-4">
            <h4 className="text-[10px] font-semibold text-[#B5B5AE] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Users className="w-3 h-3" />
              Notas
            </h4>
            <p className="text-sm text-white leading-relaxed">{reunion.notas}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm items-center gap-2">
      <span className="text-[#B5B5AE] flex items-center gap-1.5">
        {label === 'Hora' && <Clock className="w-3 h-3" />}
        {label}
      </span>
      <span className="font-medium text-[#1F1D3D] text-right">{value}</span>
    </div>
  );
}
