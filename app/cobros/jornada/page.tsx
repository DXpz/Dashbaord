'use client';

import { Shell } from '@/components/layout/Shell';
import {
  Play,
  Phone,
  Mail,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { useState } from 'react';
import {
  CLIENTES_JORNADA,
  ClienteJornada,
  CLASIFICACION_BADGE,
} from '../jornada-data';

function formatMoney(n: number): string {
  if (n === 0) return '$0.00';
  return n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 });
}

export default function JornadaPage() {
  const emptyFilters = {
    desde: '', hasta: '', pais: '', asesor: '', tipoLead: '', origen: '', tipoLlamada: '',
  };
  const handleChange = () => {};
  const handleFiltrar = () => {};
  const handleLimpiar = () => {};

  const [jornadaActiva, setJornadaActiva] = useState(false);
  const [clientes] = useState<ClienteJornada[]>(CLIENTES_JORNADA);

  const totalClientes = clientes.length;
  const saldoTotal = clientes.reduce((acc, c) => acc + c.saldoTotal, 0);
  const moraMas90 = clientes.reduce((acc, c) => acc + c.mas90, 0);

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
              onClick={() => setJornadaActiva(true)}
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
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <KpiCard label="Clientes analizados" value={totalClientes} accent="#1F1D3D" />
          <KpiCard label="Saldo total" value={formatMoney(saldoTotal)} accent="#0c6aa1" isMoney />
          <KpiCard label="Mora +90 dias" value={formatMoney(moraMas90)} accent="#ef4444" isMoney />
        </section>

        <div className="bg-white border border-[#EEEEEC] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5ED]">
                <tr className="text-left text-[10px] uppercase tracking-wider text-[#B5B5AE] font-semibold">
                  <th className="px-3 py-3 w-10">#</th>
                  <th className="px-3 py-3">Codigo</th>
                  <th className="px-3 py-3">Cliente</th>
                  <th className="px-3 py-3">Estado</th>
                  <th className="px-3 py-3">Clasificacion</th>
                  <th className="px-3 py-3">Motivo</th>
                  <th className="px-3 py-3 text-right">No vencido</th>
                  <th className="px-3 py-3 text-right">0-30</th>
                  <th className="px-3 py-3 text-right">31-60</th>
                  <th className="px-3 py-3 text-right">61-90</th>
                  <th className="px-3 py-3 text-right">+90</th>
                  <th className="px-3 py-3 text-right">Saldo total</th>
                  <th className="px-3 py-3">Fecha evaluacion</th>
                </tr>
              </thead>
              <tbody>
                {clientes.map((c, idx) => {
                  const hayMas90 = c.mas90 > 0;
                  const hayMora = c.de31a60 > 0 || c.de61a90 > 0 || c.mas90 > 0;
                  return (
                    <tr
                      key={c.codigo + idx}
                      className={`border-t border-[#EEEEEC] hover:bg-[#F5F5ED]/40 ${hayMas90 ? 'bg-red-50/30' : ''}`}
                    >
                      <td className="px-3 py-2.5 text-xs text-[#B5B5AE] font-mono text-center">
                        {idx + 1}
                      </td>
                      <td className="px-3 py-2.5 text-xs font-medium text-[#1F1D3D] font-mono">
                        {c.codigo}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-[#1F1D3D] uppercase">
                        {c.cliente}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-[#35325B]">
                        {c.estado}
                      </td>
                      <td className="px-3 py-2.5">
                        {c.clasificacion ? (
                          <span className={`inline-block w-6 h-6 rounded font-bold text-xs flex items-center justify-center ${CLASIFICACION_BADGE[c.clasificacion]}`}>
                            {c.clasificacion}
                          </span>
                        ) : (
                          <span className="text-[#B5B5AE]">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-[#35325B]">
                        {c.motivo || <span className="text-[#B5B5AE]">—</span>}
                      </td>
                      <td className="px-3 py-2.5 text-right text-xs font-mono text-[#35325B]">
                        {formatMoney(c.noVencido)}
                      </td>
                      <td className={`px-3 py-2.5 text-right text-xs font-mono ${c.de0a30 > 0 ? 'text-[#1F1D3D]' : 'text-[#B5B5AE]'}`}>
                        {formatMoney(c.de0a30)}
                      </td>
                      <td className={`px-3 py-2.5 text-right text-xs font-mono ${c.de31a60 > 0 ? 'text-[#1F1D3D]' : 'text-[#B5B5AE]'}`}>
                        {formatMoney(c.de31a60)}
                      </td>
                      <td className={`px-3 py-2.5 text-right text-xs font-mono ${c.de61a90 > 0 ? 'text-amber-700' : 'text-[#B5B5AE]'}`}>
                        {formatMoney(c.de61a90)}
                      </td>
                      <td className={`px-3 py-2.5 text-right text-xs font-mono font-semibold ${c.mas90 > 0 ? 'text-red-600 bg-red-50' : 'text-[#B5B5AE]'}`}>
                        {formatMoney(c.mas90)}
                      </td>
                      <td className={`px-3 py-2.5 text-right text-xs font-mono font-bold ${hayMora ? 'text-red-600 bg-red-50' : 'text-[#1F1D3D]'}`}>
                        {formatMoney(c.saldoTotal)}
                      </td>
                      <td className="px-3 py-2.5 text-xs text-[#35325B] font-mono">
                        {c.fechaEvaluacion}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Shell>
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