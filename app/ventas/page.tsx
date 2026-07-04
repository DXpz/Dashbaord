'use client';

import { Shell } from '@/components/layout/Shell';
import Link from 'next/link';
import {
  Play,
  Users,
  Calendar,
  Clock,
  AlertCircle,
  Star,
  ArrowRight,
  ChevronRight,
} from 'lucide-react';

type Satisfaccion = 'muy_satisfecho' | 'satisfecho' | 'neutral' | 'insatisfecho';

interface ClienteResumen {
  codigo: string;
  nombre: string;
  servicio: string;
  satisfaccion: Satisfaccion;
  diasSinContacto: number;
  ultimaGestion: string;
}

const CLIENTES: ClienteResumen[] = [
  { codigo: 'CL002214', nombre: 'BANCO DE DESARROLLO DE LA REPUBLICA DE EL SALVADOR', servicio: 'Colocacion Tier III', satisfaccion: 'muy_satisfecho', diasSinContacto: 4, ultimaGestion: '2026-06-28' },
  { codigo: 'CL002215', nombre: 'FONDO DE DESARROLLO ECONOMICO', servicio: 'Servidor Backup', satisfaccion: 'satisfecho', diasSinContacto: 7, ultimaGestion: '2026-06-25' },
  { codigo: 'CL002216', nombre: 'FONDO SALVADORENO DE GARANTIAS', servicio: 'Fibra Dedicada', satisfaccion: 'neutral', diasSinContacto: 3, ultimaGestion: '2026-06-29' },
  { codigo: 'CL003287', nombre: 'INVERSIONES TOTALES, S.A. DE C.V.', servicio: 'Colocacion Tier III + Backup', satisfaccion: 'muy_satisfecho', diasSinContacto: 6, ultimaGestion: '2026-06-26' },
  { codigo: 'CL003289', nombre: 'MINISTERIO DE DESARROLLO LOCAL', servicio: 'Colocacion', satisfaccion: 'satisfecho', diasSinContacto: 17, ultimaGestion: '2026-06-15' },
  { codigo: 'CL003342', nombre: 'P.S. LA ESPERANZA, S.A. DE C.V.', servicio: 'Backup Continuo', satisfaccion: 'insatisfecho', diasSinContacto: 1, ultimaGestion: '2026-07-01' },
  { codigo: 'CL003354', nombre: 'DEVEL SECURITY, S.A. DE C.V.', servicio: 'Colocacion Tier II', satisfaccion: 'satisfecho', diasSinContacto: 2, ultimaGestion: '2026-06-30' },
  { codigo: 'CL003376', nombre: 'CAJA DE CREDITO Y AHORRO DE SAN JUAN OPICO', servicio: 'Servidor Backup + Fibra', satisfaccion: 'neutral', diasSinContacto: 35, ultimaGestion: '2026-05-28' },
  { codigo: 'CL003401', nombre: 'COMERCIALIZADORA DEL PACIFICO, S.A. DE C.V.', servicio: 'Colocacion + Backup', satisfaccion: 'muy_satisfecho', diasSinContacto: 3, ultimaGestion: '2026-06-29' },
  { codigo: 'CL003422', nombre: 'INDUSTRIAS METALURGICAS UNIDAS, S.A. DE C.V.', servicio: 'Colocacion Tier III', satisfaccion: 'satisfecho', diasSinContacto: 5, ultimaGestion: '2026-06-27' },
];

const emptyFilters = {
  desde: '', hasta: '', pais: '', asesor: '', tipoLead: '', origen: '', tipoLlamada: '',
};
const handleChange = () => {};
const handleFiltrar = () => {};
const handleLimpiar = () => {};

const SATISFACCION_LABEL: Record<Satisfaccion, string> = {
  muy_satisfecho: 'Muy satisfecho',
  satisfecho: 'Satisfecho',
  neutral: 'Neutral',
  insatisfecho: 'Insatisfecho',
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

function satBadge(s: Satisfaccion): string {
  return s === 'muy_satisfecho'
    ? 'bg-emerald-50 text-emerald-700'
    : s === 'satisfecho'
      ? 'bg-green-50 text-green-700'
      : s === 'neutral'
        ? 'bg-slate-100 text-slate-600'
        : 'bg-red-50 text-red-700';
}

export default function VentasPage() {
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

  const totalClientes = CLIENTES.length;
  const desatendidos = CLIENTES.filter((c) => c.diasSinContacto >= 7).length;
  const insatisfechosArr = CLIENTES.filter(
    (c) => c.satisfaccion === 'insatisfecho' || c.satisfaccion === 'neutral'
  );
  const insatisfechos = insatisfechosArr.length;

  return (
    <Shell
      pageTitle="Mi Ventas"
      filters={emptyFilters}
      onFilterChange={handleChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={[]}
      connectionStatus="connected"
      showFilterBar={false}
    >
      <div className="space-y-5 max-w-7xl">
        <section className="bg-gradient-to-br from-[#1F1D3D] to-[#35325B] rounded-xl p-6 text-white">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-[11px] uppercase tracking-wider text-white/60 mb-1 inline-flex items-center gap-1.5">
                <Calendar className="w-3 h-3" />
                {dateLabel}
              </p>
              <h2 className="text-xl font-semibold">{saludo}</h2>
              <p className="text-sm text-white/70 mt-0.5">
                {totalClientes} clientes existentes a tu cargo. Da seguimiento y registra su feedback.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Link
                href="/ventas/clientes"
                className="inline-flex items-center gap-2 h-11 px-4 rounded-lg border border-white/30 bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
              >
                <Users className="w-4 h-4" />
                Mis clientes
              </Link>
              <Link
                href="/ventas/jornada"
                className="inline-flex items-center gap-2 h-11 px-5 rounded-lg bg-white text-[#1F1D3D] font-semibold text-sm hover:bg-[#F5F5ED] transition-colors shadow-sm"
              >
                <Play className="w-4 h-4" />
                Iniciar jornada
              </Link>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <MiKpi icon={Users} label="Mis clientes" value={totalClientes} accent="#1F1D3D" />
          <MiKpi icon={Clock} label="Desatendidos (7+ dias)" value={desatendidos} highlight={desatendidos > 0} accent="#f59e0b" />
          <MiKpi
            icon={AlertCircle}
            label="En riesgo"
            value={insatisfechos}
            highlight={insatisfechos > 0}
            accent="#ef4444"
            sub="Insatisfechos o neutrales"
          />
        </section>

        <section>
          <div className="bg-white border border-[#EEEEEC] rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#EEEEEC] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#1F1D3D]">Clientes para revisar</h3>
                <p className="text-xs text-[#B5B5AE] mt-0.5">
                  Ordenados por dias sin contacto y satisfaccion
                </p>
              </div>
              <Link
                href="/ventas/clientes"
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
                  <th className="px-5 py-2.5">Servicio</th>
                  <th className="px-5 py-2.5">Satisfaccion</th>
                  <th className="px-5 py-2.5">Ultima gestion</th>
                  <th className="px-5 py-2.5"></th>
                </tr>
              </thead>
              <tbody>
                {[...CLIENTES]
                  .sort((a, b) => {
                    const riskA =
                      a.satisfaccion === 'insatisfecho' ? 2 : a.satisfaccion === 'neutral' ? 1 : 0;
                    const riskB =
                      b.satisfaccion === 'insatisfecho' ? 2 : b.satisfaccion === 'neutral' ? 1 : 0;
                    if (riskA !== riskB) return riskB - riskA;
                    return b.diasSinContacto - a.diasSinContacto;
                  })
                  .slice(0, 6)
                  .map((c) => (
                    <tr key={c.codigo} className="border-t border-[#EEEEEC] hover:bg-[#F5F5ED]/40">
                      <td className="px-5 py-3">
                        <div className="text-xs font-medium text-[#1F1D3D] uppercase">{c.nombre}</div>
                        <div className="text-[10px] text-[#B5B5AE] font-mono">{c.codigo}</div>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#35325B]">{c.servicio}</td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Stars value={satToStars(c.satisfaccion)} />
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${satBadge(c.satisfaccion)}`}>
                            {SATISFACCION_LABEL[c.satisfaccion]}
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
                      <td className="px-5 py-3 text-right">
                        <ChevronRight className="w-4 h-4 text-[#B5B5AE] inline" />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </Shell>
  );
}

function MiKpi({
  icon: Icon,
  label,
  value,
  sub,
  accent,
  highlight,
}: {
  icon: typeof Users;
  label: string;
  value: number | string;
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
