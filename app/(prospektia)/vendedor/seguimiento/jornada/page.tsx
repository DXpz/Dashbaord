'use client';

import { Shell } from '@/components/layout/Shell';
import Link from 'next/link';
import {
  Phone,
  Clock,
  AlertCircle,
  Star,
  MessageSquare,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Search,
  Play,
  Calendar,
  Users,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { useVentasClientes } from '@/hooks';
import { VentasAPI, type VtCliente, type VtFeedback } from '@/services/api/ventas';
import { useAuth } from '@/lib/auth-context';

type Satisfaccion = VtCliente['satisfaccion'];
type Estado = VtCliente['estado'];

interface Retroalimentacion {
  fecha: string;
  gestor: string;
  comentario: string;
  satisfaccion: Satisfaccion;
}

interface Cliente extends VtCliente {
  contacto: string;
  telefono: string;
  retroalimentaciones: Retroalimentacion[];
}

function vtToCliente(c: VtCliente): Cliente {
  return {
    ...c,
    contacto: c.correo || '',
    telefono: c.telefonos || '',
    retroalimentaciones: [],
  };
}

const emptyFilters = {
  desde: '', hasta: '', pais: '', asesor: '', tipoLead: '', origen: '', tipoLlamada: '',
};
const handleChange = () => {};
const handleFiltrar = () => {};
const handleLimpiar = () => {};

const SATISFACCION_BADGE: Record<Satisfaccion, { label: string; bg: string; text: string }> = {
  muy_satisfecho: { label: 'Muy satisfecho', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  satisfecho: { label: 'Satisfecho', bg: 'bg-green-50', text: 'text-green-700' },
  neutral: { label: 'Neutral', bg: 'bg-slate-100', text: 'text-slate-600' },
  insatisfecho: { label: 'Insatisfecho', bg: 'bg-red-50', text: 'text-red-700' },
};

const ESTADO_BADGE: Record<Estado, { label: string; bg: string; text: string; dot: string }> = {
  sin_gestion: { label: 'Sin gestion', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
  contactado: { label: 'Contactado', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  seguimiento: { label: 'En seguimiento', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  renovacion: { label: 'Renovacion', bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500' },
};

function Stars({ value }: { value: number }) {
  return (
    <span className="inline-flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-3 h-3 ${i <= value ? 'fill-amber-400 text-amber-400' : 'text-[#EEEEEC]'}`}
        />
      ))}
    </span>
  );
}

function satToStars(s: Satisfaccion): number {
  return s === 'muy_satisfecho' ? 5 : s === 'satisfecho' ? 4 : s === 'neutral' ? 3 : 2;
}

function feedbackToRetro(f: VtFeedback, gestorNombre: string): Retroalimentacion {
  return {
    fecha: f.fecha,
    gestor: gestorNombre,
    comentario: f.comentario,
    satisfaccion: f.satisfaccion,
  };
}

export default function JornadaSeguimientoPage() {
  const { user } = useAuth();
  const gestorNombre = user?.full_name || 'Agente de Ventas';

  const [modalCliente, setModalCliente] = useState<Cliente | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [jornadaActiva, setJornadaActiva] = useState(false);
  const [query, setQuery] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | Estado>('todos');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const { data, source } = useVentasClientes();
  const isUnavailable = source === 'unavailable';
  const clientes: Cliente[] = (data ?? []).map(vtToCliente);

  const today = new Date();
  const dateLabel = today.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
  const saludo =
    today.getHours() < 12
      ? 'Buenos dias'
      : today.getHours() < 19
        ? 'Buenas tardes'
        : 'Buenas noches';

  const totalClientes = clientes.length;
  const gestionados = clientes.filter((c) => c.estado !== 'sin_gestion').length;
  const desatendidos = clientes.filter((c) => (c.dias_sin_contacto ?? 0) >= 7).length;
  const enRiesgo = clientes.filter(
    (c) => c.satisfaccion === 'insatisfecho' || c.satisfaccion === 'neutral'
  ).length;

  const filteredClientes = clientes.filter((c) => {
    if (filtroEstado !== 'todos' && c.estado !== filtroEstado) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.sap_card_code.toLowerCase().includes(q) ||
      c.contacto.toLowerCase().includes(q) ||
      (c.telefono || '').includes(q)
    );
  });

  // Cargar historial de feedback cuando se expande una fila
  useEffect(() => {
    if (!expandido) return;
    const cliente = clientes.find((c) => c.sap_card_code === expandido);
    if (!cliente || cliente.retroalimentaciones.length > 0) return;
    VentasAPI.listFeedback(expandido, 50)
      .then((list) => {
        const mapped = list.map((f) => feedbackToRetro(f, gestorNombre));
        // Actualizamos la lista en memoria
        const updated = clientes.map((c) =>
          c.sap_card_code === expandido ? { ...c, retroalimentaciones: mapped } : c
        );
        // Re-render no se hace automatico (clientes es derivado del hook).
        // En lugar de eso, lo guardamos en un map de expansiones:
        setExpandedRetro((prev) => ({ ...prev, [expandido]: mapped }));
      })
      .catch(() => {
        // Silenciar error
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [expandido]);

  const [expandedRetro, setExpandedRetro] = useState<Record<string, Retroalimentacion[]>>({});

  const handleGuardar = async (cliente: Cliente, data: Partial<Cliente>) => {
    setSaveError(null);
    setSaving(true);
    try {
      await VentasAPI.createFeedback(cliente.sap_card_code, {
        comentario: data.retroalimentaciones?.[0]?.comentario || 'Gestion registrada',
        satisfaccion: data.satisfaccion!,
        estado: data.estado,
        dias_sin_contacto: 0,
      });
      setModalCliente(null);
      setRefreshKey((k) => k + 1);
    } catch (e: unknown) {
      setSaveError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  if (isUnavailable) {
    return (
      <Shell
        pageTitle="Jornada de Seguimiento"
        filters={emptyFilters}
        onFilterChange={handleChange}
        onFiltrar={handleFiltrar}
        onLimpiar={handleLimpiar}
        asesores={[]}
        connectionStatus="error"
        showFilterBar={false}
      >
        <div className="max-w-3xl mx-auto pt-2 space-y-5">
          <Link
            href="/vendedor"
            className="inline-flex items-center gap-1.5 text-xs text-[#35325B] hover:text-[#1F1D3D] font-medium"
          >
            ← Volver al panel
          </Link>
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900">Backend de Ventas no disponible</h3>
              <p className="text-xs text-amber-800 mt-1">
                No se pueden cargar tus clientes ni registrar feedback. Verifica tu conexion o contacta al administrador.
              </p>
            </div>
          </div>
        </div>
      </Shell>
    );
  }

  if (!jornadaActiva) {
    return (
      <Shell
        pageTitle="Jornada de Seguimiento"
        filters={emptyFilters}
        onFilterChange={handleChange}
        onFiltrar={handleFiltrar}
        onLimpiar={handleLimpiar}
        asesores={[]}
        connectionStatus="connected"
        showFilterBar={false}
      >
        <div className="max-w-3xl mx-auto pt-2 space-y-5">
          <Link
            href="/vendedor"
            className="inline-flex items-center gap-1.5 text-xs text-[#35325B] hover:text-[#1F1D3D] font-medium"
          >
            ← Volver al panel
          </Link>

          <section className="bg-gradient-to-br from-[#1F1D3D] to-[#35325B] rounded-xl p-8 text-white">
            <p className="text-[11px] uppercase tracking-wider text-white/60 mb-1 inline-flex items-center gap-1.5">
              <Calendar className="w-3 h-3" />
              {dateLabel}
            </p>
            <h2 className="text-2xl font-semibold">{saludo}</h2>
            <p className="text-sm text-white/70 mt-1 mb-6">
              Tienes {totalClientes} clientes asignados. Inicia cuando estes listo para
              registrar su feedback.
            </p>
            <button
              onClick={() => setJornadaActiva(true)}
              className="inline-flex items-center gap-2 h-12 px-6 rounded-lg bg-white text-[#1F1D3D] font-semibold text-sm hover:bg-[#F5F5ED] transition-colors shadow-sm"
            >
              <Play className="w-5 h-5" />
              Iniciar jornada
            </button>
          </section>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PreJornadaKpi
              icon={Users}
              label="Clientes asignados"
              value={totalClientes}
              accent="#1F1D3D"
            />
            <PreJornadaKpi
              icon={Clock}
              label="Desatendidos (7+ dias)"
              value={desatendidos}
              highlight={desatendidos > 0}
              accent="#f59e0b"
            />
            <PreJornadaKpi
              icon={AlertCircle}
              label="En riesgo"
              value={enRiesgo}
              highlight={enRiesgo > 0}
              accent="#ef4444"
              sub="Insatisfechos o neutrales"
            />
          </section>
        </div>
      </Shell>
    );
  }

  if (clientes.length === 0) {
    return (
      <Shell
        pageTitle="Jornada de Seguimiento"
        filters={emptyFilters}
        onFilterChange={handleChange}
        onFiltrar={handleFiltrar}
        onLimpiar={handleLimpiar}
        asesores={[]}
        connectionStatus="connected"
        showFilterBar={false}
      >
        <div className="space-y-5 max-w-7xl">
          <Link
            href="/vendedor"
            className="inline-flex items-center gap-1.5 text-xs text-[#35325B] hover:text-[#1F1D3D] font-medium"
          >
            ← Volver al panel
          </Link>
          <div className="bg-white border border-[#EEEEEC] rounded-xl p-12 text-center">
            <AlertCircle className="w-12 h-12 text-[#B5B5AE] mx-auto mb-3" />
            <h3 className="text-base font-semibold text-[#1F1D3D] mb-1">No hay clientes asignados</h3>
            <p className="text-sm text-[#B5B5AE] mb-4">
              Aun no tienes clientes asignados en el backend de Ventas.
            </p>
            <button
              onClick={() => setJornadaActiva(false)}
              className="inline-flex items-center gap-2 h-9 px-4 rounded-lg border border-[#EEEEEC] bg-white text-[#35325B] text-sm font-medium hover:bg-[#F5F5ED]"
            >
              Volver al panel
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      pageTitle="Jornada de Seguimiento"
      filters={emptyFilters}
      onFilterChange={handleChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={[]}
      connectionStatus="connected"
      showFilterBar={false}
    >
      <div className="space-y-5 max-w-7xl">
        <Link
          href="/vendedor"
          className="inline-flex items-center gap-1.5 text-xs text-[#35325B] hover:text-[#1F1D3D] font-medium"
        >
          ← Volver al panel
        </Link>

        <section className="bg-white border border-[#EEEEEC] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold text-[#1F1D3D]">Jornada en curso</span>
              <span className="text-xs text-[#B5B5AE]">
                {gestionados} de {totalClientes} gestionados hoy
              </span>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-[#B5B5AE]">
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-slate-400" />
                Sin gestion
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Contactado
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                Seguimiento
              </span>
              <span className="inline-flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-violet-500" />
                Renovacion
              </span>
            </div>
          </div>
          <div className="w-full h-1.5 bg-[#F5F5ED] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1F1D3D] transition-all duration-300"
              style={{ width: `${(gestionados / totalClientes) * 100}%` }}
            />
          </div>
        </section>

        <section className="bg-white border border-[#EEEEEC] rounded-xl p-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#B5B5AE] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, codigo, contacto..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#EEEEEC] bg-[#F5F5ED] text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none focus:border-[#1F1D3D]"
            />
          </div>
          <select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value as typeof filtroEstado)}
            className="h-9 px-3 rounded-lg border border-[#EEEEEC] bg-white text-sm text-[#35325B] focus:outline-none focus:border-[#1F1D3D]"
          >
            <option value="todos">Todos los estados</option>
            <option value="sin_gestion">Sin gestion</option>
            <option value="contactado">Contactado</option>
            <option value="seguimiento">En seguimiento</option>
            <option value="renovacion">Renovacion</option>
          </select>
          <button
            onClick={() => setJornadaActiva(false)}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#EEEEEC] bg-white text-[#35325B] text-xs font-medium hover:bg-[#F5F5ED]"
          >
            Finalizar jornada
          </button>
        </section>

        <div className="bg-white border border-[#EEEEEC] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#1F1D3D]">
                <tr className="text-left text-[11px] font-semibold text-white">
                  <th className="px-5 py-3 w-12">#</th>
                  <th className="px-5 py-3">Codigo Cliente</th>
                  <th className="px-5 py-3">Nombre Cliente</th>
                  <th className="px-5 py-3">Contacto</th>
                  <th className="px-5 py-3">Satisfaccion</th>
                  <th className="px-5 py-3">Ultima gestion</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-8 text-center text-sm text-[#B5B5AE]">
                      Sin clientes que coincidan con los filtros
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map((c, idx) => {
                    const isExpanded = expandido === c.sap_card_code;
                    const gestionado = c.estado !== 'sin_gestion';
                    const retro = expandedRetro[c.sap_card_code] ?? c.retroalimentaciones;
                    return (
                      <>
                        <tr
                          key={c.sap_card_code}
                          className={`border-t border-[#EEEEEC] hover:bg-[#F5F5ED]/40 ${
                            gestionado ? 'opacity-80' : ''
                          }`}
                        >
                          <td className="px-5 py-3 text-xs text-[#B5B5AE] text-center font-mono">{idx + 1}</td>
                          <td className="px-5 py-3 text-xs">
                            <button
                              onClick={() => setExpandido(isExpanded ? null : c.sap_card_code)}
                              className="text-[#0c6aa1] hover:text-[#1F1D3D] hover:underline font-mono font-medium inline-flex items-center gap-1"
                            >
                              {c.sap_card_code}
                              {retro.length > 0 && (
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#EEEEEC] text-[10px] text-[#35325B]">
                                  {retro.length}
                                </span>
                              )}
                            </button>
                          </td>
                          <td className="px-5 py-3 text-xs text-[#1F1D3D] uppercase">
                            {c.nombre}
                          </td>
                          <td className="px-5 py-3 text-xs text-[#35325B]">
                            {c.contacto || '-'}
                          </td>
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-2">
                              <Stars value={satToStars(c.satisfaccion)} />
                              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${SATISFACCION_BADGE[c.satisfaccion].bg} ${SATISFACCION_BADGE[c.satisfaccion].text}`}>
                                {SATISFACCION_BADGE[c.satisfaccion].label}
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3 text-xs text-[#35325B]">
                            <div>{c.ultima_gestion || '-'}</div>
                            {(c.dias_sin_contacto ?? 0) >= 7 && (
                              <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                                Hace {c.dias_sin_contacto} dias
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-3">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${ESTADO_BADGE[c.estado].bg} ${ESTADO_BADGE[c.estado].text}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${ESTADO_BADGE[c.estado].dot}`} />
                              {ESTADO_BADGE[c.estado].label}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-right">
                            <div className="inline-flex items-center gap-1">
                              <button className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors" title="Llamar">
                                <Phone className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setModalCliente(c)}
                                className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#1F1D3D] text-white hover:bg-[#35325B] transition-colors"
                                title="Registrar feedback"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => setExpandido(isExpanded ? null : c.sap_card_code)}
                                className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#F5F5ED] text-[#35325B] hover:bg-[#EEEEEC] transition-colors"
                                title="Ver historial"
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 w-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && retro.length > 0 && (
                          <tr key={`${c.sap_card_code}-hist`} className="border-t border-[#EEEEEC] bg-[#F5F5ED]/50">
                            <td colSpan={8} className="px-5 py-4">
                              <div className="flex items-start gap-3">
                                <MessageSquare className="w-4 h-4 text-[#0c6aa1] flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                  <p className="text-[10px] font-semibold text-[#B5B5AE] uppercase tracking-wider mb-2">
                                    Historial de feedback ({retro.length})
                                  </p>
                                  <div className="space-y-2">
                                    {retro.map((r, i) => {
                                      const rSat = SATISFACCION_BADGE[r.satisfaccion];
                                      return (
                                        <div key={i} className="bg-white border border-[#EEEEEC] rounded-lg p-3">
                                          <div className="flex items-center justify-between mb-1.5 flex-wrap gap-2">
                                            <div className="flex items-center gap-2">
                                              <Stars value={satToStars(r.satisfaccion)} />
                                              <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${rSat.bg} ${rSat.text}`}>
                                                {rSat.label}
                                              </span>
                                            </div>
                                            <span className="text-[10px] text-[#B5B5AE]">
                                              {r.fecha} - {r.gestor}
                                            </span>
                                          </div>
                                          <p className="text-xs text-[#35325B] leading-relaxed">{r.comentario}</p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {modalCliente && (
        <FeedbackModal
          cliente={modalCliente}
          onClose={() => setModalCliente(null)}
          onSave={handleGuardar}
          saving={saving}
          error={saveError}
        />
      )}
    </Shell>
  );
}

function FeedbackModal({
  cliente,
  onClose,
  onSave,
  saving,
  error,
}: {
  cliente: Cliente;
  onClose: () => void;
  onSave: (cliente: Cliente, data: Partial<Cliente>) => void | Promise<void>;
  saving: boolean;
  error: string | null;
}) {
  const [satisfaccion, setSatisfaccion] = useState<Satisfaccion>(cliente.satisfaccion);
  const [comentario, setComentario] = useState('');
  const [estado, setEstado] = useState<Estado>(cliente.estado);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario.trim()) return;
    const hoy = new Date().toISOString().slice(0, 10);
    const nuevaRetro: Retroalimentacion = {
      fecha: hoy,
      gestor: 'Agente de Ventas',
      comentario: comentario.trim(),
      satisfaccion,
    };
    void onSave(cliente, {
      satisfaccion,
      estado,
      ultima_gestion: hoy,
      dias_sin_contacto: 0,
      retroalimentaciones: [nuevaRetro, ...(cliente.retroalimentaciones || [])],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEEEEC] flex-shrink-0">
          <div>
            <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-0.5">
              {cliente.sap_card_code}
            </p>
            <h3 className="text-base font-semibold text-[#1F1D3D] uppercase">
              {cliente.nombre}
            </h3>
            <p className="text-xs text-[#35325B] mt-0.5">
              {cliente.contacto || '-'} - {cliente.telefono || '-'}
            </p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center text-[#B5B5AE] hover:text-[#35325B] hover:bg-[#F5F5ED] rounded-lg">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#1F1D3D] uppercase tracking-wider mb-2">
              Estado del seguimiento
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['contactado', 'seguimiento', 'renovacion', 'sin_gestion'] as Estado[]).map((e) => {
                const opt = ESTADO_BADGE[e];
                const active = estado === e;
                return (
                  <button
                    type="button"
                    key={e}
                    onClick={() => setEstado(e)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      active
                        ? `${opt.bg} ${opt.text} border-current`
                        : 'border-[#EEEEEC] text-[#35325B] hover:bg-[#F5F5ED]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#1F1D3D] uppercase tracking-wider mb-2">
              Nivel de satisfaccion del cliente
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['muy_satisfecho', 'satisfecho', 'neutral', 'insatisfecho'] as Satisfaccion[]).map((s) => {
                const opt = SATISFACCION_BADGE[s];
                const active = satisfaccion === s;
                return (
                  <button
                    type="button"
                    key={s}
                    onClick={() => setSatisfaccion(s)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      active
                        ? `${opt.bg} ${opt.text} border-current`
                        : 'border-[#EEEEEC] text-[#35325B] hover:bg-[#F5F5ED]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-[#1F1D3D] uppercase tracking-wider mb-1.5">
              Comentario de retroalimentacion
            </label>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              rows={4}
              placeholder="Describa la retroalimentacion del cliente, quejas, sugerencias o comentarios..."
              className="w-full px-3 py-2 rounded-lg border border-[#EEEEEC] bg-[#F5F5ED] text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none focus:border-[#1F1D3D] resize-none"
              required
              minLength={10}
            />
            <p className="text-[10px] text-[#B5B5AE] mt-1">
              Minimo 10 caracteres. Se enviara al backend de Ventas.
            </p>
          </div>
        </form>

        <div className="px-5 py-3 border-t border-[#EEEEEC] flex items-center justify-end gap-2 flex-shrink-0">
          {error && (
            <p className="text-[11px] text-red-600 mr-auto">{error}</p>
          )}
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-[#EEEEEC] bg-white text-[#35325B] text-sm font-medium hover:bg-[#F5F5ED]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1F1D3D] hover:bg-[#35325B] text-white text-sm font-medium transition-colors disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-3.5 w-3.5" />
                Registrar feedback
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function PreJornadaKpi({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  highlight,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  sub?: string;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-white border rounded-xl p-4 ${highlight ? 'border-red-200' : 'border-[#EEEEEC]'}`}>
      <div className="flex items-center gap-2 mb-2">
        <div
          className="w-7 h-7 rounded-md flex items-center justify-center"
          style={{ backgroundColor: `${accent}1a` }}
        >
          <Icon className="w-3.5 w-3.5" style={{ color: accent }} />
        </div>
        <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className={`text-3xl font-bold ${highlight ? 'text-red-700' : 'text-[#1F1D3D]'}`}>
        {value}
      </p>
      {sub && <p className="text-[11px] text-[#B5B5AE] mt-1">{sub}</p>}
    </div>
  );
}
