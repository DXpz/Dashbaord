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
  ArrowLeft,
  Search,
  Play,
  Calendar,
  Users,
} from 'lucide-react';
import { useState } from 'react';

type Satisfaccion = 'muy_satisfecho' | 'satisfecho' | 'neutral' | 'insatisfecho';
type Estado = 'sin_gestion' | 'contactado' | 'seguimiento' | 'renovacion';

interface Retroalimentacion {
  fecha: string;
  gestor: string;
  comentario: string;
  satisfaccion: Satisfaccion;
}

interface Cliente {
  codigo: string;
  nombre: string;
  contacto: string;
  cargo: string;
  telefono: string;
  correo: string;
  servicio: string;
  satisfaccion: Satisfaccion;
  diasSinContacto: number;
  ultimaGestion: string;
  estado: Estado;
  retroalimentaciones: Retroalimentacion[];
}

const MIS_CLIENTES: Cliente[] = [
  {
    codigo: 'CL002214',
    nombre: 'BANCO DE DESARROLLO DE LA REPUBLICA DE EL SALVADOR',
    contacto: 'Roberto Mendez', cargo: 'Gerente Comercial', telefono: '2260-5500', correo: 'cobros@bandesal.gob.sv',
    servicio: 'Colocacion Tier III', satisfaccion: 'muy_satisfecho', diasSinContacto: 4, ultimaGestion: '2026-06-28',
    estado: 'contactado',
    retroalimentaciones: [
      { fecha: '2026-06-28', gestor: 'Mirna Castillo', comentario: 'Cliente felicita al equipo por la atencion. Sin quejas tecnicas.', satisfaccion: 'muy_satisfecho' },
    ],
  },
  {
    codigo: 'CL002215',
    nombre: 'FONDO DE DESARROLLO ECONOMICO',
    contacto: 'Ana Lopez', cargo: 'Jefe de Creditos', telefono: '2250-8800', correo: 'contacto@fde.gob.sv',
    servicio: 'Servidor Backup', satisfaccion: 'satisfecho', diasSinContacto: 7, ultimaGestion: '2026-06-25',
    estado: 'sin_gestion',
    retroalimentaciones: [
      { fecha: '2026-06-25', gestor: 'Mirna Castillo', comentario: 'Todo correcto. Sugieren mejorar el tiempo de respuesta del soporte.', satisfaccion: 'satisfecho' },
    ],
  },
  {
    codigo: 'CL002216',
    nombre: 'FONDO SALVADORENO DE GARANTIAS',
    contacto: 'Carlos Ramirez', cargo: 'Director Financiero', telefono: '2290-1234', correo: 'cobros@fosyga.gob.sv',
    servicio: 'Fibra Dedicada', satisfaccion: 'neutral', diasSinContacto: 3, ultimaGestion: '2026-06-29',
    estado: 'seguimiento',
    retroalimentaciones: [
      { fecha: '2026-06-29', gestor: 'Mirna Castillo', comentario: 'Cliente reporta lentitud intermitente en el enlace principal. Se escalo a operaciones.', satisfaccion: 'neutral' },
    ],
  },
  {
    codigo: 'CL003287',
    nombre: 'INVERSIONES TOTALES, S.A. DE C.V.',
    contacto: 'Sofia Reyes', cargo: 'Gerente General', telefono: '2270-9911', correo: 'cobros@invtotales.com.sv',
    servicio: 'Colocacion Tier III + Backup', satisfaccion: 'muy_satisfecho', diasSinContacto: 6, ultimaGestion: '2026-06-26',
    estado: 'renovacion',
    retroalimentaciones: [
      { fecha: '2026-06-26', gestor: 'Roberto Mendez', comentario: 'Cliente confirma renovacion anual. Interesado en agregar modulo de monitoreo.', satisfaccion: 'muy_satisfecho' },
    ],
  },
  {
    codigo: 'CL003289',
    nombre: 'MINISTERIO DE DESARROLLO LOCAL',
    contacto: 'Patricia Silva', cargo: 'Director Administrativo', telefono: '2240-3344', correo: 'cobros@mindel.gob.sv',
    servicio: 'Colocacion', satisfaccion: 'satisfecho', diasSinContacto: 17, ultimaGestion: '2026-06-15',
    estado: 'sin_gestion',
    retroalimentaciones: [
      { fecha: '2026-06-15', gestor: 'Roberto Mendez', comentario: 'Cliente satisfecho. Pidio capacitacion para su personal tecnico.', satisfaccion: 'satisfecho' },
    ],
  },
  {
    codigo: 'CL003342',
    nombre: 'P.S. LA ESPERANZA, S.A. DE C.V.',
    contacto: 'Luis Castro', cargo: 'Gerente Financiero', telefono: '2260-7788', correo: 'cobros@psesperanza.com.sv',
    servicio: 'Backup Continuo', satisfaccion: 'insatisfecho', diasSinContacto: 1, ultimaGestion: '2026-07-01',
    estado: 'seguimiento',
    retroalimentaciones: [
      { fecha: '2026-07-01', gestor: 'Mirna Castillo', comentario: 'Cliente MOLESTO: tuvo caida del servicio 4 horas el viernes. Solicita compensacion y revision urgente del SLA.', satisfaccion: 'insatisfecho' },
    ],
  },
  {
    codigo: 'CL003354',
    nombre: 'DEVEL SECURITY, S.A. DE C.V.',
    contacto: 'Andres Molina', cargo: 'Director Comercial', telefono: '2280-4455', correo: 'cobros@develsecurity.com.sv',
    servicio: 'Colocacion Tier II', satisfaccion: 'satisfecho', diasSinContacto: 2, ultimaGestion: '2026-06-30',
    estado: 'contactado',
    retroalimentaciones: [
      { fecha: '2026-06-30', gestor: 'Mirna Castillo', comentario: 'Llamada de seguimiento. Cliente confirma que todo funciona bien.', satisfaccion: 'satisfecho' },
    ],
  },
  {
    codigo: 'CL003376',
    nombre: 'CAJA DE CREDITO Y AHORRO DE SAN JUAN OPICO, SOC. COOP. DE R.L. DE C.V.',
    contacto: 'Maria Rodriguez', cargo: 'Gerente General', telefono: '2250-6633', correo: 'cobros@ccsjuanopico.coop.sv',
    servicio: 'Servidor Backup + Fibra', satisfaccion: 'neutral', diasSinContacto: 35, ultimaGestion: '2026-05-28',
    estado: 'sin_gestion',
    retroalimentaciones: [
      { fecha: '2026-05-28', gestor: 'Roberto Mendez', comentario: 'Cliente reporta problemas con facturacion electronica. Se escalo a administracion.', satisfaccion: 'neutral' },
    ],
  },
  {
    codigo: 'CL003401',
    nombre: 'COMERCIALIZADORA DEL PACIFICO, S.A. DE C.V.',
    contacto: 'Eduardo Herrera', cargo: 'Gerente de Ventas', telefono: '2299-1100', correo: 'cobros@cdelpacifico.com.sv',
    servicio: 'Colocacion + Backup', satisfaccion: 'muy_satisfecho', diasSinContacto: 3, ultimaGestion: '2026-06-29',
    estado: 'sin_gestion',
    retroalimentaciones: [
      { fecha: '2026-06-29', gestor: 'Roberto Mendez', comentario: 'Cliente MUY satisfecho. Recomiendo para caso de estudio.', satisfaccion: 'muy_satisfecho' },
    ],
  },
  {
    codigo: 'CL003422',
    nombre: 'INDUSTRIAS METALURGICAS UNIDAS, S.A. DE C.V.',
    contacto: 'Reina Vasquez', cargo: 'Jefe de Cobros', telefono: '2271-3388', correo: 'cobros@imusa.com.sv',
    servicio: 'Colocacion Tier III', satisfaccion: 'satisfecho', diasSinContacto: 5, ultimaGestion: '2026-06-27',
    estado: 'renovacion',
    retroalimentaciones: [
      { fecha: '2026-06-27', gestor: 'Roberto Mendez', comentario: 'Renovacion firmada por 2 anos mas. Aumento del 15% por upgrade de capacidad.', satisfaccion: 'satisfecho' },
      { fecha: '2026-03-15', gestor: 'Mirna Castillo', comentario: 'Solicitan capacitacion tecnica para su equipo.', satisfaccion: 'satisfecho' },
    ],
  },
];

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

export default function JornadaVentasPage() {
  const [clientes, setClientes] = useState<Cliente[]>(MIS_CLIENTES);
  const [modalCliente, setModalCliente] = useState<Cliente | null>(null);
  const [expandido, setExpandido] = useState<string | null>(null);
  const [jornadaActiva, setJornadaActiva] = useState(false);
  const [query, setQuery] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<'todos' | Estado>('todos');

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
  const desatendidos = clientes.filter((c) => c.diasSinContacto >= 7).length;
  const enRiesgo = clientes.filter(
    (c) => c.satisfaccion === 'insatisfecho' || c.satisfaccion === 'neutral'
  ).length;

  const filteredClientes = clientes.filter((c) => {
    if (filtroEstado !== 'todos' && c.estado !== filtroEstado) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.codigo.toLowerCase().includes(q) ||
      c.contacto.toLowerCase().includes(q) ||
      c.telefono.includes(q)
    );
  });

  const handleGuardar = (codigo: string, data: Partial<Cliente>) => {
    setClientes((prev) => prev.map((c) => (c.codigo === codigo ? { ...c, ...data } : c)));
    setModalCliente(null);
  };

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
            href="/ventas"
            className="inline-flex items-center gap-1.5 text-xs text-[#35325B] hover:text-[#1F1D3D] font-medium"
          >
            <ArrowLeft className="w-3 h-3" />
            Volver al panel
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
            <PreJornadaKpi icon={Users} label="Clientes asignados" value={totalClientes} accent="#1F1D3D" />
            <PreJornadaKpi icon={Clock} label="Desatendidos (7+ dias)" value={desatendidos} highlight={desatendidos > 0} accent="#f59e0b" />
            <PreJornadaKpi icon={AlertCircle} label="En riesgo" value={enRiesgo} highlight={enRiesgo > 0} accent="#ef4444" sub="Insatisfechos o neutrales" />
          </section>
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
          href="/ventas"
          className="inline-flex items-center gap-1.5 text-xs text-[#35325B] hover:text-[#1F1D3D] font-medium"
        >
          <ArrowLeft className="w-3 h-3" />
          Volver al panel
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
                  <th className="px-5 py-3 text-right">MRR</th>
                  <th className="px-5 py-3">Satisfaccion</th>
                  <th className="px-5 py-3">Ultima gestion</th>
                  <th className="px-5 py-3">Estado</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-5 py-8 text-center text-sm text-[#B5B5AE]">
                      Sin clientes que coincidan con los filtros
                    </td>
                  </tr>
                ) : (
                  filteredClientes.map((c, idx) => {
                    const isExpanded = expandido === c.codigo;
                    const gestionado = c.estado !== 'sin_gestion';
                    return (
                      <>
                        <tr
                          key={c.codigo}
                          className={`border-t border-[#EEEEEC] hover:bg-[#F5F5ED]/40 ${gestionado ? 'opacity-80' : ''}`}
                        >
                          <td className="px-5 py-3 text-xs text-[#B5B5AE] text-center font-mono">{idx + 1}</td>
                          <td className="px-5 py-3 text-xs">
                            <button
                              onClick={() => setExpandido(isExpanded ? null : c.codigo)}
                              className="text-[#0c6aa1] hover:text-[#1F1D3D] hover:underline font-mono font-medium inline-flex items-center gap-1"
                            >
                              {c.codigo}
                              {c.retroalimentaciones.length > 0 && (
                                <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-[#EEEEEC] text-[10px] text-[#35325B]">
                                  {c.retroalimentaciones.length}
                                </span>
                              )}
                            </button>
                          </td>
                          <td className="px-5 py-3 text-xs text-[#1F1D3D] uppercase">
                            {c.nombre}
                          </td>
                          <td className="px-5 py-3 text-xs text-[#35325B]">
                            <div>{c.contacto}</div>
                            <div className="text-[10px] text-[#B5B5AE]">{c.cargo}</div>
                          </td>
                          <td className="px-5 py-3 text-right text-xs font-mono font-semibold text-[#1F1D3D]">
                            {c.servicio.includes('Backup') && c.servicio.includes('Coloc') ? '$1,500' : c.servicio.includes('Backup') ? '$850' : '$1,200'}
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
                            <div>{c.ultimaGestion}</div>
                            {c.diasSinContacto >= 7 && (
                              <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                                Hace {c.diasSinContacto} dias
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
                                onClick={() => setExpandido(isExpanded ? null : c.codigo)}
                                className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#F5F5ED] text-[#35325B] hover:bg-[#EEEEEC] transition-colors"
                                title="Ver historial"
                              >
                                {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                              </button>
                            </div>
                          </td>
                        </tr>
                        {isExpanded && c.retroalimentaciones.length > 0 && (
                          <tr key={`${c.codigo}-hist`} className="border-t border-[#EEEEEC] bg-[#F5F5ED]/50">
                            <td colSpan={9} className="px-5 py-4">
                              <div className="flex items-start gap-3">
                                <MessageSquare className="w-4 h-4 text-[#0c6aa1] flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                  <p className="text-[10px] font-semibold text-[#B5B5AE] uppercase tracking-wider mb-2">
                                    Historial de feedback ({c.retroalimentaciones.length})
                                  </p>
                                  <div className="space-y-2">
                                    {c.retroalimentaciones.map((r, i) => {
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
        <FeedbackModal cliente={modalCliente} onClose={() => setModalCliente(null)} onSave={handleGuardar} />
      )}
    </Shell>
  );
}

function FeedbackModal({
  cliente,
  onClose,
  onSave,
}: {
  cliente: Cliente;
  onClose: () => void;
  onSave: (codigo: string, data: Partial<Cliente>) => void;
}) {
  const [satisfaccion, setSatisfaccion] = useState<Satisfaccion>(cliente.satisfaccion);
  const [comentario, setComentario] = useState('');
  const [estado, setEstado] = useState<Estado>(cliente.estado);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comentario.trim()) return;
    const hoy = new Date().toISOString().slice(0, 10);
    onSave(cliente.codigo, {
      satisfaccion,
      estado,
      ultimaGestion: hoy,
      diasSinContacto: 0,
      retroalimentaciones: [
        { fecha: hoy, gestor: 'Agente de Ventas', comentario: comentario.trim(), satisfaccion },
        ...cliente.retroalimentaciones,
      ],
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEEEEC] flex-shrink-0">
          <div>
            <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-0.5">
              {cliente.codigo}
            </p>
            <h3 className="text-base font-semibold text-[#1F1D3D] uppercase">
              {cliente.nombre}
            </h3>
            <p className="text-xs text-[#35325B] mt-0.5">
              {cliente.contacto} ({cliente.cargo}) - {cliente.telefono}
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
              Minimo 10 caracteres. Se agregara al historial del cliente.
            </p>
          </div>
        </form>

        <div className="px-5 py-3 border-t border-[#EEEEEC] flex items-center justify-end gap-2 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 rounded-lg border border-[#EEEEEC] bg-white text-[#35325B] text-sm font-medium hover:bg-[#F5F5ED]"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="inline-flex items-center gap-1.5 h-9 px-4 rounded-lg bg-[#1F1D3D] hover:bg-[#35325B] text-white text-sm font-medium transition-colors"
          >
            <Save className="w-3.5 h-3.5" />
            Registrar feedback
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
          <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
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
