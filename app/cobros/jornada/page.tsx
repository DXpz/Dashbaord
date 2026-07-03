'use client';

import { Shell } from '@/components/layout/Shell';
import {
  Play,
  Phone,
  Clock,
  XCircle,
  Calendar,
  Pencil,
  Save,
  X,
} from 'lucide-react';
import { useState, useMemo } from 'react';
import {
  CLIENTES_JORNADA,
  ClienteJornada,
  ResultadoLlamada,
  RESULTADO_BADGE,
  CLASIFICACION_BADGE,
  HISTORIAL_JORNADA_ANTERIOR,
  HistorialCliente,
} from '../jornada-data';

function formatMoney(n: number): string {
  if (n === 0) return '$0.00';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

const RESULTADO_OPTIONS: ResultadoLlamada[] = [
  'contactado',
  'promesa_pago',
  'no_contesta',
  'rechazo',
  'numero_invalido',
  'reagendar',
];

export default function JornadaPage() {
  const emptyFilters = {
    desde: '', hasta: '', pais: '', asesor: '', tipoLead: '', origen: '', tipoLlamada: '',
  };
  const handleChange = () => {};
  const handleFiltrar = () => {};
  const handleLimpiar = () => {};

  const [jornadaActiva, setJornadaActiva] = useState(false);
  const [clientes, setClientes] = useState<ClienteJornada[]>(CLIENTES_JORNADA);
  const [filtroResultado, setFiltroResultado] = useState<'todos' | 'sin_gestion' | 'gestionados'>('todos');
  const [search, setSearch] = useState('');
  const [modalCliente, setModalCliente] = useState<ClienteJornada | null>(null);

  const totalClientes = clientes.length;
  const saldoTotal = clientes.reduce((acc, c) => acc + c.saldoTotal, 0);
  const moraMas90 = clientes.reduce((acc, c) => acc + c.mas90, 0);

  // Resumen de gestion del dia.
  const stats = useMemo(() => {
    const gestionados = clientes.filter((c) => c.resultado && c.resultado !== 'sin_gestion');
    const promesas = clientes.filter((c) => c.resultado === 'promesa_pago');
    const contactados = clientes.filter((c) => c.resultado === 'contactado');
    const noContesta = clientes.filter((c) => c.resultado === 'no_contesta');
    const rechazo = clientes.filter((c) => c.resultado === 'rechazo');
    const montoPromesas = promesas.reduce((acc, c) => acc + (c.montoPromesa ?? 0), 0);
    return {
      gestionados: gestionados.length,
      pendientes: totalClientes - gestionados.length,
      promesas: promesas.length,
      contactados: contactados.length,
      noContesta: noContesta.length,
      rechazo: rechazo.length,
      montoPromesas,
      progreso: totalClientes > 0 ? Math.round((gestionados.length / totalClientes) * 100) : 0,
    };
  }, [clientes, totalClientes]);

  const filteredClientes = useMemo(() => {
    let list = clientes;
    if (filtroResultado === 'sin_gestion')
      list = list.filter((c) => !c.resultado || c.resultado === 'sin_gestion');
    else if (filtroResultado === 'gestionados')
      list = list.filter((c) => c.resultado && c.resultado !== 'sin_gestion');
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.cliente.toLowerCase().includes(q) ||
          c.empresa.toLowerCase().includes(q) ||
          c.codigo.toLowerCase().includes(q) ||
          c.telefono.includes(q)
      );
    }
    return list;
  }, [clientes, filtroResultado, search]);

  const handleIniciar = () => {
    setJornadaActiva(true);
  };

  const handleFinalizar = () => {
    setJornadaActiva(false);
    setModalCliente(null);
  };

  const handleGuardarGestion = (
    codigo: string,
    data: {
      resultado: ResultadoLlamada;
      montoPromesa?: number;
      fechaPromesa?: string;
      notas?: string;
    }
  ) => {
    const now = new Date();
    const hora = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    setClientes((prev) =>
      prev.map((c) =>
        c.codigo === codigo
          ? {
              ...c,
              resultado: data.resultado,
              montoPromesa: data.montoPromesa,
              fechaPromesa: data.fechaPromesa,
              notas: data.notas,
              horaGestion: hora,
            }
          : c
      )
    );
    setModalCliente(null);
  };

  if (!jornadaActiva) {
    const today = new Date();
    const dateLabel = today.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return (
      <Shell
        pageTitle="Jornada"
        filters={emptyFilters}
        onFilterChange={handleChange}
        onFiltrar={handleFiltrar}
        onLimpiar={handleLimpiar}
        asesores={[]}
        connectionStatus="connected"
        showFilterBar={false}
      >
        <div className="max-w-5xl mx-auto pt-2 space-y-5">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-[11px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-1 inline-flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {dateLabel}
              </p>
              <h2 className="text-2xl font-semibold text-[#1F1D3D]">Bienvenido a tu jornada</h2>
              <p className="text-sm text-[#35325B] mt-1">
                Tienes {totalClientes} clientes asignados. Inicia cuando estes listo para gestionar.
              </p>
            </div>
            <button
              onClick={handleIniciar}
              className="inline-flex items-center gap-2 h-11 px-6 rounded-lg bg-[#1F1D3D] text-white text-sm font-medium hover:bg-[#35325B] transition-colors shadow-sm"
            >
              <Play className="w-4 h-4" />
              Iniciar jornada
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <KpiCard label="Clientes asignados" value={totalClientes} accent="#1F1D3D" />
            <KpiCard label="Saldo total" value={formatMoney(saldoTotal)} accent="#0c6aa1" isMoney />
            <KpiCard label="Mora +90 dias" value={formatMoney(moraMas90)} accent="#ef4444" isMoney />
          </div>

          <HistorialTable historial={HISTORIAL_JORNADA_ANTERIOR} />
        </div>
      </Shell>
    );
  }

  return (
    <Shell
      pageTitle="Jornada"
      filters={emptyFilters}
      onFilterChange={handleChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={[]}
      connectionStatus="connected"
      showFilterBar={false}
    >
      <div className="space-y-5 max-w-7xl">
        {/* Header de gestion con barra de progreso */}
        <section className="bg-white border border-[#EEEEEC] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-sm font-semibold text-[#1F1D3D]">Jornada en curso</span>
              <span className="text-xs text-[#B5B5AE]">
                {stats.gestionados} de {totalClientes} gestionados
              </span>
            </div>
            <button
              onClick={handleFinalizar}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-red-200 bg-white text-red-600 text-xs font-medium hover:bg-red-50 transition-colors"
            >
              <XCircle className="w-3.5 h-3.5" />
              Finalizar jornada
            </button>
          </div>
          <div className="w-full h-2 bg-[#F5F5ED] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#1F1D3D] transition-all duration-300"
              style={{ width: `${stats.progreso}%` }}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mt-4">
            <MiniStat label="Pendientes" value={stats.pendientes} color="#B5B5AE" />
            <MiniStat label="Contactados" value={stats.contactados} color="#0c6aa1" />
            <MiniStat label="Promesas" value={stats.promesas} color="#10b981" />
            <MiniStat label="$ Promesas" value={formatMoney(stats.montoPromesas)} color="#1F1D3D" isMoney />
            <MiniStat label="No contesta" value={stats.noContesta} color="#f59e0b" />
            <MiniStat label="Rechazo" value={stats.rechazo} color="#ef4444" />
          </div>
        </section>

        {/* Filtros */}
        <div className="bg-white border border-[#EEEEEC] rounded-xl p-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <input
              type="text"
              placeholder="Buscar cliente, empresa, codigo o telefono..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-[#EEEEEC] bg-[#F5F5ED] text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none focus:border-[#1F1D3D]"
            />
          </div>
          <div className="flex items-center gap-1 bg-[#F5F5ED] rounded-lg p-1">
            {[
              { id: 'todos' as const, label: 'Todos' },
              { id: 'sin_gestion' as const, label: 'Sin gestion' },
              { id: 'gestionados' as const, label: 'Gestionados' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setFiltroResultado(t.id)}
                className={`px-3 h-7 rounded-md text-xs font-medium transition-colors ${
                  filtroResultado === t.id
                    ? 'bg-white text-[#1F1D3D] shadow-sm'
                    : 'text-[#35325B] hover:text-[#1F1D3D]'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de clientes */}
        <div className="bg-white border border-[#EEEEEC] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5ED]">
                <tr className="text-left text-[10px] uppercase tracking-wider text-[#B5B5AE] font-semibold">
                  <th className="px-3 py-3 w-10">#</th>
                  <th className="px-3 py-3">Codigo</th>
                  <th className="px-3 py-3">Cliente</th>
                  <th className="px-3 py-3">Contacto</th>
                  <th className="px-3 py-3 text-right">Saldo total</th>
                  <th className="px-3 py-3">Clasif.</th>
                  <th className="px-3 py-3">Resultado</th>
                  <th className="px-3 py-3">Hora</th>
                  <th className="px-3 py-3">Notas</th>
                  <th className="px-3 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredClientes.map((c, idx) => {
                  const hayMas90 = c.mas90 > 0;
                  const gestionado = c.resultado && c.resultado !== 'sin_gestion';
                  const badge = gestionado ? RESULTADO_BADGE[c.resultado!] : null;
                  return (
                    <tr
                      key={c.codigo}
                      className={`border-t border-[#EEEEEC] hover:bg-[#F5F5ED]/40 ${hayMas90 ? 'bg-red-50/30' : ''} ${gestionado ? 'opacity-90' : ''}`}
                    >
                      <td className="px-3 py-2.5 text-xs text-[#B5B5AE] font-mono text-center">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2.5 text-xs font-medium text-[#1F1D3D] font-mono">
                        {c.codigo}
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="text-xs text-[#1F1D3D] uppercase font-medium">
                          {c.empresa}
                        </div>
                        <div className="text-[10px] text-[#B5B5AE]">{c.cliente}</div>
                      </td>
                      <td className="px-3 py-2.5 text-xs text-[#35325B] font-mono whitespace-nowrap">
                        {c.telefono}
                      </td>
                      <td
                        className={`px-3 py-2.5 text-right text-xs font-mono font-bold ${
                          hayMas90 ? 'text-red-600' : 'text-[#1F1D3D]'
                        }`}
                      >
                        {formatMoney(c.saldoTotal)}
                        {c.mas90 > 0 && (
                          <div className="text-[10px] text-red-600 font-medium">
                            +90: {formatMoney(c.mas90)}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {c.clasificacion ? (
                          <span
                            className={`inline-block w-6 h-6 rounded font-bold text-xs flex items-center justify-center ${CLASIFICACION_BADGE[c.clasificacion]}`}
                          >
                            {c.clasificacion}
                          </span>
                        ) : (
                          <span className="text-[#B5B5AE]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        {badge ? (
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${badge.bg} ${badge.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                            {badge.label}
                          </span>
                        ) : c.resultado === 'promesa_pago' && c.montoPromesa ? (
                          <div>
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium bg-emerald-50 text-emerald-700">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              Promesa
                            </span>
                            <div className="text-[10px] text-emerald-700 mt-0.5">
                              {formatMoney(c.montoPromesa)}
                              {c.fechaPromesa && ` / ${c.fechaPromesa}`}
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#B5B5AE]">— sin gestion —</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-[#35325B] font-mono">
                        {c.horaGestion || <span className="text-[#B5B5AE]">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-[#35325B] max-w-[180px] truncate">
                        {c.notas || <span className="text-[#B5B5AE]">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => setModalCliente(c)}
                            className="inline-flex items-center gap-1 px-2 h-7 rounded-md bg-[#1F1D3D] text-white text-[11px] font-medium hover:bg-[#35325B] transition-colors"
                            title="Gestionar llamada"
                          >
                            <Pencil className="w-3 h-3" />
                            {gestionado ? 'Editar' : 'Gestionar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filteredClientes.length === 0 && (
            <div className="text-center py-8 text-sm text-[#B5B5AE]">
              Sin clientes que coincidan con los filtros
            </div>
          )}
        </div>
      </div>

      <HistorialTable historial={HISTORIAL_JORNADA_ANTERIOR} />

      {modalCliente && (
        <GestionModal
          cliente={modalCliente}
          onClose={() => setModalCliente(null)}
          onSave={handleGuardarGestion}
        />
      )}
    </Shell>
  );
}

function GestionModal({
  cliente,
  onClose,
  onSave,
}: {
  cliente: ClienteJornada;
  onClose: () => void;
  onSave: (
    codigo: string,
    data: {
      resultado: ResultadoLlamada;
      montoPromesa?: number;
      fechaPromesa?: string;
      notas?: string;
    }
  ) => void;
}) {
  const [resultado, setResultado] = useState<ResultadoLlamada>(
    cliente.resultado && cliente.resultado !== 'sin_gestion'
      ? cliente.resultado
      : 'contactado'
  );
  const [montoPromesa, setMontoPromesa] = useState<string>(
    cliente.montoPromesa ? String(cliente.montoPromesa) : ''
  );
  const [fechaPromesa, setFechaPromesa] = useState<string>(cliente.fechaPromesa ?? '');
  const [notas, setNotas] = useState<string>(cliente.notas ?? '');

  const requierePromesa = resultado === 'promesa_pago';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(cliente.codigo, {
      resultado,
      montoPromesa: requierePromesa && montoPromesa ? Number(montoPromesa) : undefined,
      fechaPromesa: requierePromesa ? fechaPromesa || undefined : undefined,
      notas: notas.trim() || undefined,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#EEEEEC] flex-shrink-0">
          <div>
            <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-0.5">
              {cliente.codigo}
            </p>
            <h3 className="text-base font-semibold text-[#1F1D3D]">{cliente.empresa}</h3>
            <p className="text-xs text-[#35325B] mt-0.5">
              {cliente.cliente} · {cliente.telefono} · {formatMoney(cliente.saldoTotal)} adeudado
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center text-[#B5B5AE] hover:text-[#35325B] hover:bg-[#F5F5ED] rounded-lg"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-[#1F1D3D] uppercase tracking-wider mb-2">
              Resultado de la llamada
            </label>
            <div className="grid grid-cols-2 gap-2">
              {RESULTADO_OPTIONS.map((r) => {
                const opt = RESULTADO_BADGE[r];
                const active = resultado === r;
                return (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setResultado(r)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                      active
                        ? `${opt.bg} ${opt.text} border-current`
                        : 'border-[#EEEEEC] text-[#35325B] hover:bg-[#F5F5ED]'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${opt.dot}`} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {requierePromesa && (
            <div className="grid grid-cols-2 gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
              <div>
                <label className="block text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                  Monto prometido
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#B5B5AE]">
                    $
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={montoPromesa}
                    onChange={(e) => setMontoPromesa(e.target.value)}
                    placeholder="0.00"
                    className="w-full h-9 pl-7 pr-3 rounded-lg border border-emerald-200 bg-white text-sm text-[#1F1D3D] focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-semibold text-emerald-700 uppercase tracking-wider mb-1">
                  Fecha promesa
                </label>
                <input
                  type="date"
                  value={fechaPromesa}
                  onChange={(e) => setFechaPromesa(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-emerald-200 bg-white text-sm text-[#1F1D3D] focus:outline-none focus:border-emerald-500"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold text-[#1F1D3D] uppercase tracking-wider mb-1.5">
              Notas (opcional)
            </label>
            <textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              rows={3}
              placeholder="Ej: cliente dice que paga en 15 dias por tema de cierre de mes..."
              className="w-full px-3 py-2 rounded-lg border border-[#EEEEEC] bg-[#F5F5ED] text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none focus:border-[#1F1D3D] resize-none"
            />
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
            Guardar gestion
          </button>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  accent,
  isMoney,
}: {
  label: string;
  value: number | string;
  accent: string;
  isMoney?: boolean;
}) {
  return (
    <div className="bg-white border border-[#EEEEEC] rounded-xl p-5">
      <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-1.5">
        {label}
      </p>
      <p
        className={`${isMoney ? 'text-2xl lg:text-3xl' : 'text-4xl lg:text-5xl'} font-bold text-[#1F1D3D]`}
        style={typeof value === 'number' ? { color: accent } : undefined}
      >
        {value}
      </p>
    </div>
  );
}

function MiniStat({
  label,
  value,
  color,
  isMoney,
}: {
  label: string;
  value: string | number;
  color: string;
  isMoney?: boolean;
}) {
  return (
    <div className="text-center">
      <p className="text-[10px] uppercase tracking-wider text-[#B5B5AE] mb-0.5">{label}</p>
      <p
        className={`${isMoney ? 'text-sm font-bold' : 'text-lg font-bold'}`}
        style={{ color }}
      >
        {value}
      </p>
    </div>
  );
}

function HistorialTable({ historial }: { historial: HistorialCliente[] }) {
  if (historial.length === 0) return null;
  return (
    <div className="bg-white border border-[#EEEEEC] rounded-xl overflow-hidden">
      <div className="px-5 py-4 border-b border-[#EEEEEC]">
        <h3 className="text-sm font-semibold text-[#1F1D3D]">Jornada anterior</h3>
        <p className="text-xs text-[#B5B5AE] mt-0.5">
          Ultima gestion conocida de cada cliente — referencia rapida antes de llamar
        </p>
      </div>
      <div className="overflow-x-auto max-h-[420px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-[#F5F5ED] sticky top-0 z-10">
            <tr className="text-left text-[10px] uppercase tracking-wider text-[#B5B5AE] font-semibold">
              <th className="px-3 py-2.5">#</th>
              <th className="px-3 py-2.5">Codigo</th>
              <th className="px-3 py-2.5">Cliente</th>
              <th className="px-3 py-2.5">Gestor</th>
              <th className="px-3 py-2.5">Fecha gestion</th>
              <th className="px-3 py-2.5">Resultado</th>
              <th className="px-3 py-2.5">Compromiso</th>
              <th className="px-3 py-2.5">Comentario</th>
            </tr>
          </thead>
          <tbody>
            {historial.map((h, idx) => {
              const badge = RESULTADO_BADGE[h.resultado];
              return (
                <tr key={h.codigo + idx} className="border-t border-[#EEEEEC] hover:bg-[#F5F5ED]/40">
                  <td className="px-3 py-2.5 text-xs text-[#B5B5AE] font-mono text-center">
                    {idx + 1}
                  </td>
                  <td className="px-3 py-2.5 text-xs font-medium text-[#1F1D3D] font-mono">
                    {h.codigo}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-[#1F1D3D]">
                    {clienteNombre(h.codigo)}
                  </td>
                  <td className="px-3 py-2.5 text-xs text-[#35325B]">{h.gestor}</td>
                  <td className="px-3 py-2.5 text-xs text-[#35325B] font-mono whitespace-nowrap">
                    {h.fecha}
                  </td>
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${badge.bg} ${badge.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                      {badge.label}
                    </span>
                  </td>
                  <td className="px-3 py-2.5">
                    <div className="text-xs text-[#1F1D3D]">
                      {h.montoPrometido ? (
                        <span className="font-mono font-semibold text-emerald-700">
                          {formatMoney(h.montoPrometido)}
                        </span>
                      ) : (
                        <span className="text-[#B5B5AE]">—</span>
                      )}
                    </div>
                    <div className="text-xs text-[#35325B] mt-0.5 leading-snug max-w-[480px]">
                      {h.comentario}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function clienteNombre(codigo: string): string {
  const c = CLIENTES_JORNADA.find((x) => x.codigo === codigo);
  return c ? c.empresa : codigo;
}