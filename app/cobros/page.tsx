'use client';

import { Shell } from '@/components/layout/Shell';
import { ChartCard } from '@/components/charts/ChartCard';
import { ChartWrapper } from '@/components/charts/ChartWrapper';
import { Receipt, AlertCircle, TrendingUp, Clock } from 'lucide-react';
import Link from 'next/link';
import { FACTURAS, ESTADO_FACTURA_BADGE } from './data';

function formatMoney(n: number): string {
  return n.toLocaleString('es-SV', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
}

function formatDate(iso: string): string {
  const d = new Date(iso + 'T12:00:00');
  if (isNaN(d.getTime())) return iso;
  const day = d.getDate().toString().padStart(2, '0');
  const month = d.toLocaleDateString('es-ES', { month: 'short' });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

export default function CobrosPanelPage() {
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

  // Calculos en tiempo real desde data demo.
  const pendientes = FACTURAS.filter((f) => f.estado === 'pendiente' || f.estado === 'en_revision');
  const vencidas = FACTURAS.filter((f) => f.estado === 'vencida' || (f.estado === 'pago_parcial' && f.diasVencidos > 0));
  const pagadas = FACTURAS.filter((f) => f.estado === 'pagada');

  const totalPendiente = pendientes.reduce((acc, f) => acc + (f.monto - f.montoPagado), 0);
  const totalVencido = vencidas.reduce((acc, f) => acc + (f.monto - f.montoPagado), 0);
  const cobradoMes = pagadas
    .filter((f) => {
      const d = new Date(f.fechaEmision + 'T12:00:00');
      return d.getMonth() === new Date().getMonth() && d.getFullYear() === new Date().getFullYear();
    })
    .reduce((acc, f) => acc + f.montoPagado, 0);

  const totalFacturado = FACTURAS.reduce((acc, f) => acc + f.monto, 0);
  const totalCobrado = FACTURAS.reduce((acc, f) => acc + f.montoPagado, 0);
  const tasaCobro = totalFacturado > 0 ? Math.round((totalCobrado / totalFacturado) * 100) : 0;

  const kpis = [
    { label: 'Pendientes', value: pendientes.length, icon: Clock, accent: '#0c6aa1' },
    { label: 'Vencidas', value: vencidas.length, icon: AlertCircle, accent: '#ef4444', sub: formatMoney(totalVencido) },
    { label: 'Cobrado este mes', value: cobradoMes, icon: TrendingUp, accent: '#10b981', prefix: '$' },
    { label: 'Tasa de cobro', value: tasaCobro, icon: Receipt, accent: '#f59e0b', suffix: '%' },
  ];

  // Pipeline por estado (chart horizontal)
  const estados = ['pendiente', 'en_revision', 'pago_parcial', 'pagada', 'vencida'] as const;
  const pipelineData = estados.map((e) => {
    const items = FACTURAS.filter((f) => f.estado === e);
    const total = items.reduce((acc, f) => acc + f.monto, 0);
    return {
      estado: e,
      count: items.length,
      total,
      badge: ESTADO_FACTURA_BADGE[e],
    };
  });

  const maxTotal = Math.max(...pipelineData.map((p) => p.total), 1);

  // Proximos vencimientos (top 5 ordenados por dias vencidos desc)
  const topVencimientos = [...FACTURAS]
    .filter((f) => f.estado !== 'pagada' && f.estado !== 'cancelada')
    .sort((a, b) => b.diasVencidos - a.diasVencidos)
    .slice(0, 5);

  return (
    <Shell
      pageTitle="Panel Cobros"
      filters={emptyFilters}
      onFilterChange={handleChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={[]}
      connectionStatus="connected"
      showFilterBar={false}
    >
      <div className="space-y-5 max-w-7xl">
        <section>
          <p className="text-[11px] text-[#B5B5AE] mb-2 italic">
            Version demo — datos estaticos de muestra
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {kpis.map((k) => (
              <KpiCard key={k.label} {...k} />
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <PipelineCard data={pipelineData} maxTotal={maxTotal} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <ChartCard title="Cobranza por pais" subtitle="Monto facturado vs cobrado (USD)">
              <ChartWrapper
                type="bar"
                height="220px"
                data={{
                  labels: ['El Salvador (SV)', 'Guatemala (GT)'],
                  datasets: [
                    {
                      label: 'Facturado',
                      data: [
                        FACTURAS.filter((f) => f.pais === 'SV').reduce((a, f) => a + f.monto, 0),
                        FACTURAS.filter((f) => f.pais === 'GT').reduce((a, f) => a + f.monto, 0),
                      ],
                      backgroundColor: '#1F1D3D',
                      borderRadius: 0,
                      borderSkipped: false,
                    },
                    {
                      label: 'Cobrado',
                      data: [
                        FACTURAS.filter((f) => f.pais === 'SV').reduce((a, f) => a + f.montoPagado, 0),
                        FACTURAS.filter((f) => f.pais === 'GT').reduce((a, f) => a + f.montoPagado, 0),
                      ],
                      backgroundColor: '#10b981',
                      borderRadius: 0,
                      borderSkipped: false,
                    },
                  ],
                }}
                options={{
                  plugins: {
                    legend: { display: true, position: 'bottom', labels: { font: { family: 'Inter', size: 11 }, color: '#35325B' } },
                    tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.dataset.label}: $${ctx.raw.toLocaleString()}` } },
                  },
                  scales: {
                    x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 }, color: '#35325B' } },
                    y: { grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { font: { family: 'Inter', size: 11 }, color: '#B5B5AE', callback: (v: any) => `$${v}` } },
                  },
                }}
              />
            </ChartCard>

            <ChartCard title="Metodos de pago" subtitle="Distribucion del monto cobrado">
              <ChartWrapper
                type="doughnut"
                height="220px"
                data={{
                  labels: ['Transferencia', 'Tarjeta', 'Efectivo', 'Cheque'],
                  datasets: [{
                    data: (() => {
                      const totals: Record<string, number> = { Transferencia: 0, Tarjeta: 0, Efectivo: 0, Cheque: 0 };
                      FACTURAS.filter((f) => f.estado === 'pagada').forEach((f) => {
                        if (f.metodoPago) totals[f.metodoPago] += f.montoPagado;
                      });
                      return [totals.Transferencia, totals.Tarjeta, totals.Efectivo, totals.Cheque];
                    })(),
                    backgroundColor: ['#1F1D3D', '#10b981', '#f59e0b', '#0c6aa1'],
                    borderColor: '#FFFFFF',
                    borderWidth: 2,
                  }],
                }}
                options={{
                  plugins: {
                    legend: { display: true, position: 'bottom', labels: { font: { family: 'Inter', size: 11 }, color: '#35325B' } },
                    tooltip: { callbacks: { label: (ctx: any) => ` ${ctx.label}: $${ctx.raw.toLocaleString()}` } },
                  },
                  cutout: '65%',
                }}
              />
            </ChartCard>
          </div>
        </section>

        <section className="bg-white border border-[#EEEEEC] rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-[#EEEEEC] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-[#1F1D3D]">Proximos vencimientos</h3>
              <p className="text-xs text-[#B5B5AE] mt-0.5">Top 5 facturas con mayor mora</p>
            </div>
            <Link
              href="/cobros/facturas"
              className="text-xs text-[#35325B] hover:text-[#1F1D3D] font-medium"
            >
              Ver todas →
            </Link>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5ED]">
              <tr className="text-left text-[10px] uppercase tracking-wider text-[#B5B5AE] font-medium">
                <th className="px-5 py-2.5">Factura</th>
                <th className="px-5 py-2.5">Cliente</th>
                <th className="px-5 py-2.5">Vence</th>
                <th className="px-5 py-2.5 text-right">Monto</th>
                <th className="px-5 py-2.5 text-right">Pendiente</th>
                <th className="px-5 py-2.5">Estado</th>
              </tr>
            </thead>
            <tbody>
              {topVencimientos.map((f) => {
                const pendiente = f.monto - f.montoPagado;
                const badge = ESTADO_FACTURA_BADGE[f.estado];
                return (
                  <tr key={f.id} className="border-t border-[#EEEEEC]">
                    <td className="px-5 py-3 text-[#1F1D3D] font-medium text-xs">{f.numero}</td>
                    <td className="px-5 py-3">
                      <div>
                        <div className="text-[#1F1D3D] text-sm">{f.empresa}</div>
                        <div className="text-[#B5B5AE] text-xs">{f.cliente}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-[#35325B]">
                      {formatDate(f.fechaVencimiento)}
                      {f.diasVencidos > 0 && (
                        <span className="block text-[10px] text-red-600 font-medium">
                          {f.diasVencidos} dias vencido
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-right text-[#35325B] font-mono text-xs">
                      {formatMoney(f.monto)}
                    </td>
                    <td className="px-5 py-3 text-right text-[#1F1D3D] font-mono text-xs font-semibold">
                      {formatMoney(pendiente)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${badge.bg} ${badge.text}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      </div>
    </Shell>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  accent,
  prefix,
  suffix,
  sub,
}: {
  label: string;
  value: number;
  icon: typeof Receipt;
  accent: string;
  prefix?: string;
  suffix?: string;
  sub?: string;
}) {
  return (
    <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex flex-col items-center min-h-[140px]">
      <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: `${accent}1a` }}>
        <Icon className="w-5 h-5" style={{ color: accent }} />
      </div>
      <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-1.5 text-center">
        {label}
      </p>
      <p className="text-3xl lg:text-4xl font-bold text-[#1F1D3D] text-center">
        {prefix}{typeof value === 'number' && value >= 1000
          ? value.toLocaleString()
          : value}{suffix}
      </p>
      {sub && <p className="text-[11px] text-[#B5B5AE] mt-1">{sub}</p>}
    </div>
  );
}

function PipelineCard({ data, maxTotal }: { data: any[]; maxTotal: number }) {
  return (
    <div className="bg-white border border-[#EEEEEC] rounded-xl p-5">
      <h3 className="text-sm font-semibold text-[#1F1D3D] mb-4">Pipeline de cobranza</h3>
      <div className="space-y-3">
        {data.map((row: any) => {
          const pct = (row.total / maxTotal) * 100;
          return (
            <div key={row.estado}>
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`w-1.5 h-1.5 rounded-full ${row.badge.dot}`} />
                  <span className="text-xs font-medium text-[#1F1D3D]">{row.badge.label}</span>
                </div>
                <span className="text-[11px] text-[#35325B] font-mono">
                  {row.count} · ${row.total.toLocaleString()}
                </span>
              </div>
              <div className="relative h-2 rounded-full bg-[#F5F5ED] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: row.badge.dot.replace('bg-', '') }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}