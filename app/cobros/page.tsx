'use client';

import { Shell } from '@/components/layout/Shell';
import { ChartCard } from '@/components/charts/ChartCard';
import {
  Play,
  Users,
  Receipt,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  ChevronRight,
  ArrowRight,
  Phone,
} from 'lucide-react';
import Link from 'next/link';
import {
  FACTURAS,
  ESTADO_FACTURA_BADGE,
  CLIENTES_DEUDORES,
} from './data';

function formatMoney(n: number): string {
  if (n === 0) return '$0';
  return n.toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  if (isNaN(d.getTime())) return iso;
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleDateString('es-ES', { month: 'short' });
  return `${day} ${month}`;
}

export default function CobrosPanelPage() {
  const emptyFilters = {
    desde: '', hasta: '', pais: '', asesor: '', tipoLead: '', origen: '', tipoLlamada: '',
  };
  const handleChange = () => {};
  const handleFiltrar = () => {};
  const handleLimpiar = () => {};

  const hoy = new Date();
  const saludo =
    hoy.getHours() < 12
      ? 'Buenos dias'
      : hoy.getHours() < 19
        ? 'Buenas tardes'
        : 'Buenas noches';
  const dateLabel = hoy.toLocaleDateString('es-ES', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  // KPIs operativos: cuanto falta por cobrar hoy, cuantos clientes debo llamar.
  const vencidas = FACTURAS.filter((f) => f.estado === 'vencida');
  const pagoParcial = FACTURAS.filter((f) => f.estado === 'pago_parcial');
  const pendientes = FACTURAS.filter((f) => f.estado === 'pendiente' || f.estado === 'en_revision');
  const montoVencido = vencidas.reduce((acc, f) => acc + (f.monto - f.montoPagado), 0);
  const montoPendiente = pendientes.reduce((acc, f) => acc + (f.monto - f.montoPagado), 0);
  const clientesParaLlamar = vencidas.length + pagoParcial.length + pendientes.length;

  // Top 5 clientes prioritarios: primero vencidos (mas dias), luego pago parcial, luego pendientes.
  const top5 = [...FACTURAS]
    .filter((f) => f.estado !== 'pagada' && f.estado !== 'cancelada')
    .sort((a, b) => {
      if (b.diasVencidos !== a.diasVencidos) return b.diasVencidos - a.diasVencidos;
      return a.fechaVencimiento < b.fechaVencimiento ? -1 : 1;
    })
    .slice(0, 5);

  // Cobranza de hoy (facturas pagadas hoy): dato demo fijo.
  const cobradoHoy = 1850;

  // Distribucion de la deuda por antiguedad (grafico horizontal).
  // Calculado desde diasVencidos + monto pendiente (monto - montoPagado).
  const bucketFromDias = (dias: number): string => {
    if (dias <= 0) return 'No vencido';
    if (dias <= 30) return '0-30 dias';
    if (dias <= 60) return '31-60 dias';
    if (dias <= 90) return '61-90 dias';
    return '+90 dias';
  };
  const bucketColors: Record<string, string> = {
    'No vencido': '#0c6aa1',
    '0-30 dias': '#f59e0b',
    '31-60 dias': '#f97316',
    '61-90 dias': '#dc2626',
    '+90 dias': '#991b1b',
  };
  const bucketsMap = new Map<string, number>();
  FACTURAS.forEach((f) => {
    const key = bucketFromDias(f.diasVencidos);
    const pendiente = Math.max(0, f.monto - f.montoPagado);
    bucketsMap.set(key, (bucketsMap.get(key) ?? 0) + pendiente);
  });
  const buckets = ['No vencido', '0-30 dias', '31-60 dias', '61-90 dias', '+90 dias'].map(
    (label) => ({ label, total: bucketsMap.get(label) ?? 0, color: bucketColors[label] })
  );
  const maxBucket = Math.max(...buckets.map((b) => b.total), 1);

  return (
    <Shell
      pageTitle="Panel de Cobros"
      filters={emptyFilters}
      onFilterChange={handleChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={[]}
      connectionStatus="connected"
      showFilterBar={false}
    >
      <div className="space-y-5 max-w-7xl">
        {/* Saludo + acciones rapidas */}
        <section className="bg-gradient-to-br from-[#1F1D3D] to-[#35325B] rounded-xl p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60 mb-1 inline-flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {dateLabel}
              </p>
              <h2 className="text-xl font-semibold">{saludo}, agente</h2>
              <p className="text-sm text-white/70 mt-0.5">
                Tienes {clientesParaLlamar} clientes por gestionar hoy.
              </p>
            </div>
            <Link
              href="/cobros/jornada"
              className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-white text-[#1F1D3D] font-semibold text-sm hover:bg-[#F5F5ED] transition-colors shadow-sm"
            >
              <Play className="w-4 h-4" />
              Iniciar jornada
            </Link>
          </div>
        </section>

        {/* KPIs operativos: cuanto falta por cobrar, cuantos clientes */}
        <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <OpKpi
            icon={AlertCircle}
            label="Vencido hoy"
            value={montoVencido}
            sub={`${vencidas.length} factura${vencidas.length !== 1 ? 's' : ''}`}
            accent="red"
            highlight
          />
          <OpKpi
            icon={Clock}
            label="Por cobrar"
            value={montoPendiente}
            sub={`${pendientes.length} pendiente${pendientes.length !== 1 ? 's' : ''}`}
            accent="amber"
          />
          <OpKpi
            icon={Users}
            label="Clientes por llamar"
            value={clientesParaLlamar}
            accent="indigo"
            isCount
          />
          <OpKpi
            icon={TrendingUp}
            label="Cobrado hoy"
            value={cobradoHoy}
            sub="+2 vs ayer"
            accent="emerald"
          />
        </section>

        {/* Acciones rapidas + Top 5 prioritarios */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Acciones rapidas */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-[#1F1D3D]">Acciones rapidas</h3>
            <Link
              href="/cobros/jornada"
              className="bg-white border border-[#EEEEEC] rounded-lg p-4 flex items-center justify-between hover:border-[#1F1D3D] hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#1F1D3D] text-white flex items-center justify-center">
                  <Play className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1F1D3D]">Iniciar jornada</p>
                  <p className="text-xs text-[#B5B5AE]">40 clientes asignados</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#B5B5AE] group-hover:text-[#1F1D3D] transition-colors" />
            </Link>
            <Link
              href="/cobros/clientes"
              className="bg-white border border-[#EEEEEC] rounded-lg p-4 flex items-center justify-between hover:border-[#1F1D3D] hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#0c6aa1] text-white flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1F1D3D]">Clientes con deuda</p>
                  <p className="text-xs text-[#B5B5AE]">{CLIENTES_DEUDORES.length} clientes</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#B5B5AE] group-hover:text-[#1F1D3D] transition-colors" />
            </Link>
            <Link
              href="/cobros/clientes"
              className="bg-white border border-[#EEEEEC] rounded-lg p-4 flex items-center justify-between hover:border-[#1F1D3D] hover:shadow-sm transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-sm font-medium text-[#1F1D3D]">Ver clientes con deuda</p>
                  <p className="text-xs text-[#B5B5AE]">Por antiguedad de mora</p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[#B5B5AE] group-hover:text-[#1F1D3D] transition-colors" />
            </Link>
          </div>

          {/* Top 5 clientes prioritarios */}
          <div className="lg:col-span-2 bg-white border border-[#EEEEEC] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#EEEEEC] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1F1D3D]">Prioridad hoy</h3>
                <p className="text-xs text-[#B5B5AE] mt-0.5">
                  Clientes ordenados por dias vencidos y monto
                </p>
              </div>
              <Link
                href="/cobros/clientes"
                className="text-xs text-[#35325B] hover:text-[#1F1D3D] font-medium inline-flex items-center gap-1"
              >
                Ver todos
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5ED]">
                <tr className="text-left text-[10px] uppercase tracking-wider text-[#B5B5AE] font-semibold">
                  <th className="px-5 py-2.5">Cliente</th>
                  <th className="px-5 py-2.5">Vence</th>
                  <th className="px-5 py-2.5 text-right">Pendiente</th>
                  <th className="px-5 py-2.5">Estado</th>
                  <th className="px-5 py-2.5 w-20"></th>
                </tr>
              </thead>
              <tbody>
                {top5.map((f) => {
                  const badge = ESTADO_FACTURA_BADGE[f.estado];
                  const pendiente = f.monto - f.montoPagado;
                  return (
                    <tr key={f.id} className="border-t border-[#EEEEEC]">
                      <td className="px-5 py-3">
                        <div className="text-sm font-medium text-[#1F1D3D]">
                          {f.empresa}
                        </div>
                        <div className="text-[11px] text-[#B5B5AE]">{f.cliente}</div>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#35325B]">
                        <div>{formatDate(f.fechaVencimiento)}</div>
                        {f.diasVencidos > 0 && (
                          <div className="text-[10px] text-red-600 font-medium">
                            {f.diasVencidos} dias vencido
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right text-sm font-mono font-semibold text-[#1F1D3D]">
                        {formatMoney(pendiente)}
                      </td>
                      <td className="px-5 py-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium ${badge.bg} ${badge.text}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                          {badge.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right">
                        <button
                          className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                          title="Llamar"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Distribucion de la deuda por bucket */}
        <section>
          <ChartCard
            title="Distribucion de la deuda"
            subtitle="Monto adeudado por antiguedad (USD)"
          >
            <div className="space-y-2.5">
              {buckets.map((b) => {
                const pct = (b.total / maxBucket) * 100;
                return (
                  <div key={b.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-[#35325B]">{b.label}</span>
                      <span className="text-xs font-mono text-[#1F1D3D] font-semibold">
                        {formatMoney(b.total)}
                      </span>
                    </div>
                    <div className="h-2.5 bg-[#F5F5ED] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${pct}%`, backgroundColor: b.color }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </ChartCard>
        </section>
      </div>
    </Shell>
  );
}

function OpKpi({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  highlight,
  isCount,
}: {
  icon: typeof AlertCircle;
  label: string;
  value: number;
  sub?: string;
  accent: 'red' | 'amber' | 'indigo' | 'emerald';
  highlight?: boolean;
  isCount?: boolean;
}) {
  const accentMap = {
    red: { bg: 'bg-red-50', text: 'text-red-700', bar: 'bg-red-500' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-700', bar: 'bg-amber-500' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', bar: 'bg-indigo-500' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-700', bar: 'bg-emerald-500' },
  };
  const a = accentMap[accent];

  return (
    <div
      className={`bg-white border rounded-xl p-4 ${
        highlight ? 'border-red-200' : 'border-[#EEEEEC]'
      }`}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-7 h-7 rounded-md ${a.bg} ${a.text} flex items-center justify-center`}>
          <Icon className="w-3.5 h-3.5" />
        </div>
        <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className={`text-2xl font-bold ${highlight ? 'text-red-700' : 'text-[#1F1D3D]'}`}>
        {isCount ? value.toLocaleString() : formatMoney(value)}
      </p>
      {sub && <p className="text-[11px] text-[#B5B5AE] mt-0.5">{sub}</p>}
    </div>
  );
}