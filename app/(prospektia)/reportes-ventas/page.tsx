'use client';

import { Shell } from '@/components/layout/Shell';
import Link from 'next/link';
import {
  FileText,
  Calendar,
  Users,
  Clock,
  AlertCircle,
  Star,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  RefreshCw,
} from 'lucide-react';
import { useState } from 'react';
import { useVentasReporteDiario } from '@/hooks';
import { RoleGuard } from '@/lib/role-guard';
import type { VtCliente } from '@/services/api/ventas';

const emptyFilters = {
  desde: '', hasta: '', pais: '', asesor: '', tipoLead: '', origen: '', tipoLlamada: '',
};
const handleChange = () => {};
const handleFiltrar = () => {};
const handleLimpiar = () => {};

type Satisfaccion = VtCliente['satisfaccion'];

interface Actividad {
  hora: string;
  cliente: string;
  codigo: string;
  accion: string;
  satisfaccion?: Satisfaccion;
  estado: 'contactado' | 'seguimiento' | 'renovacion' | 'sin_gestion';
}

interface Pendiente {
  id: string;
  codigo: string;
  nombre: string;
  ciudad: string;
  telefono: string;
  diasSinContacto: number;
  satisfaccion: Satisfaccion;
  estado: 'sin_gestion' | 'contactado' | 'seguimiento' | 'renovacion';
}

// Datos demo para fallback si el backend no responde.
// NOTA: a partir del refactor del 2026-07-07 ya no se usan datos demo.
//       Las listas se renderizan vacias si el backend no responde.
const DEMO_PENDIENTES: Pendiente[] = [];
const DEMO_ACTIVIDADES: Actividad[] = [];

const SATISFACCION_BADGE: Record<Satisfaccion, { label: string; bg: string; text: string; stars: number }> = {
  muy_satisfecho: { label: 'Muy satisfecho', bg: 'bg-emerald-50', text: 'text-emerald-700', stars: 5 },
  satisfecho: { label: 'Satisfecho', bg: 'bg-green-50', text: 'text-green-700', stars: 4 },
  neutral: { label: 'Neutral', bg: 'bg-slate-100', text: 'text-slate-600', stars: 3 },
  insatisfecho: { label: 'Insatisfecho', bg: 'bg-red-50', text: 'text-red-700', stars: 2 },
};

const ESTADO_DOT: Record<string, string> = {
  sin_gestion: 'bg-slate-400',
  contactado: 'bg-emerald-500',
  seguimiento: 'bg-blue-500',
  renovacion: 'bg-violet-500',
};

const ESTADO_BADGE: Record<string, { label: string; bg: string; text: string }> = {
  sin_gestion: { label: 'Sin gestion', bg: 'bg-slate-100', text: 'text-slate-500' },
  contactado: { label: 'Contactado', bg: 'bg-emerald-50', text: 'text-emerald-700' },
  seguimiento: { label: 'En seguimiento', bg: 'bg-blue-50', text: 'text-blue-700' },
  renovacion: { label: 'Renovacion', bg: 'bg-violet-50', text: 'text-violet-700' },
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

export default function ReportesVentasPage() {
  const today = new Date().toISOString().slice(0, 10);
  const [fecha, setFecha] = useState<string>(today);
  const [expandido, setExpandido] = useState<string | null>(null);

  // Hook contra el backend real. Fallback a data demo si no responde.
  const { data, source, loading } = useVentasReporteDiario(fecha);
  const isDemo = source === 'unavailable';
  const isUnavailable = isDemo; // alias semántico

  // Mapear datos del backend al formato de UI, con fallback a demo.
  const pendientes: Pendiente[] =
    data?.pendientes.map((c) => ({
      id: c.sap_card_code,
      codigo: c.sap_card_code,
      nombre: c.nombre,
      ciudad: c.ciudad || '',
      telefono: c.telefonos || '',
      diasSinContacto: c.dias_sin_contacto,
      satisfaccion: c.satisfaccion,
      estado: c.estado,
    })) || [];

  const actividades: Actividad[] =
    data?.recientes.map((r, i) => ({
      hora: r.hora,
      cliente: r.cliente_nombre,
      codigo: r.sap_card_code,
      accion: r.comentario,
      satisfaccion: r.satisfaccion,
      estado: r.estado,
    })) || [];

  const kpis = data
    ? {
        vendedor: data.vendedor.full_name || data.vendedor.email,
        email: data.vendedor.email,
        fecha: data.fecha,
        asignados: data.kpis.asignados,
        gestionados: data.kpis.gestionados,
        pendientes: data.kpis.pendientes,
        insatisfechos: data.kpis.insatisfechos,
        neutrales: data.kpis.neutrales,
        desatendidos: data.kpis.desatendidos,
        cumplimiento: data.kpis.cumplimiento_pct,
      }
    : {
        vendedor: 'Agente de Ventas Demo',
        email: 'ventas@red.com.sv',
        fecha,
        asignados: 10,
        gestionados: 4,
        pendientes: 6,
        insatisfechos: 1,
        neutrales: 2,
        desatendidos: 3,
        cumplimiento: 40,
      };

  return (
    <RoleGuard>
      <Shell
        pageTitle="Reportes de Ventas"
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
            href="/"
            className="inline-flex items-center gap-1.5 text-xs text-[#35325B] hover:text-[#1F1D3D] font-medium"
          >
            <ArrowLeft className="w-3 h-3" />
            Volver al panel
          </Link>

          {isDemo && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex items-center gap-2 text-xs text-amber-800">
              <AlertCircle className="w-3.5 h-3.5" />
              Backend de Ventas no disponible. Mostrando datos demo.
            </div>
          )}

          <section className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-base font-semibold text-[#1F1D3D]">Reporte diario del vendedor</h1>
              <p className="text-xs text-[#B5B5AE] mt-0.5">
                Sustituto del email diario: la gestion del vendedor consolidada en una vista.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs font-medium text-[#35325B]">Fecha</label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="h-9 px-3 rounded-lg border border-[#EEEEEC] bg-white text-sm text-[#1F1D3D] focus:outline-none focus:border-[#1F1D3D]"
              />
              <button
                onClick={() => setFecha(today)}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#EEEEEC] bg-white text-[#35325B] text-xs font-medium hover:bg-[#F5F5ED]"
                title="Hoy"
              >
                <RefreshCw className="w-3 h-3" />
                Hoy
              </button>
            </div>
          </section>

          <section className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-[10px] font-semibold text-[#B5B5AE] uppercase tracking-wider mb-0.5">
                Vendedor
              </p>
              <h2 className="text-base font-semibold text-[#1F1D3D]">{kpis.vendedor}</h2>
              <p className="text-xs text-[#B5B5AE] mt-0.5">{kpis.email}</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#B5B5AE]">
              <Calendar className="w-3 h-3" />
              Reporte del {kpis.fecha}
            </div>
          </section>

          <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <ReporteKpi icon={Users} label="Asignados" value={kpis.asignados} accent="#1F1D3D" />
            <ReporteKpi icon={Clock} label="Atendidos" value={kpis.gestionados} accent="#10b981" />
            <ReporteKpi
              icon={AlertCircle}
              label="Pendientes"
              value={kpis.pendientes}
              accent="#ef4444"
              highlight={kpis.pendientes > 0}
            />
            <ReporteKpi label="Cumplimiento" value={`${kpis.cumplimiento}%`} accent="#0c6aa1" />
          </section>

          <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="bg-white border border-[#EEEEEC] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#EEEEEC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <h3 className="text-sm font-semibold text-[#1F1D3D]">Clientes pendientes</h3>
                </div>
                <span className="text-[10px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded-full">
                  {kpis.pendientes}
                </span>
              </div>
              <div className="divide-y divide-[#EEEEEC] max-h-[480px] overflow-y-auto">
                {pendientes.map((p) => {
                  const sat = SATISFACCION_BADGE[p.satisfaccion];
                  const estado = ESTADO_BADGE[p.estado];
                  return (
                    <div key={p.id} className="px-5 py-3 hover:bg-[#F5F5ED]/40 flex items-start gap-3">
                      <div className="flex-shrink-0 w-9 h-9 rounded-md bg-[#F5F5ED] text-[#1F1D3D] flex items-center justify-center text-xs font-semibold">
                        {p.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-medium text-[#1F1D3D] truncate uppercase">
                            {p.nombre}
                          </p>
                          <span className="text-[10px] font-mono text-[#B5B5AE] flex-shrink-0">
                            {p.codigo}
                          </span>
                        </div>
                        <p className="text-[10px] text-[#B5B5AE] mt-0.5">
                          {p.ciudad} · {p.telefono}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${sat.bg} ${sat.text}`}>
                            {sat.label}
                          </span>
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${estado.bg} ${estado.text}`}>
                            {estado.label}
                          </span>
                          {p.diasSinContacto >= 7 && (
                            <span className="text-[10px] text-amber-700 font-medium">
                              <Clock className="w-3 h-3 inline mr-0.5" />
                              {p.diasSinContacto} dias
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => setExpandido(expandido === p.codigo ? null : p.codigo)}
                        className="flex-shrink-0 w-7 h-7 rounded-md bg-[#F5F5ED] text-[#35325B] hover:bg-[#EEEEEC] flex items-center justify-center"
                        title="Ver detalle"
                      >
                        {expandido === p.codigo ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="bg-white border border-[#EEEEEC] rounded-xl overflow-hidden">
              <div className="px-5 py-4 border-b border-[#EEEEEC] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#0c6aa1]" />
                  <h3 className="text-sm font-semibold text-[#1F1D3D]">Gestiones de hoy</h3>
                </div>
                <span className="text-[10px] font-semibold text-[#0c6aa1] bg-blue-50 px-2 py-0.5 rounded-full">
                  {actividades.length} acciones
                </span>
              </div>
              <div className="divide-y divide-[#EEEEEC] max-h-[480px] overflow-y-auto">
                {actividades.map((a, i) => {
                  const estado = ESTADO_BADGE[a.estado];
                  return (
                    <div key={i} className="px-5 py-3 hover:bg-[#F5F5ED]/40 flex items-start gap-3">
                      <div className="flex-shrink-0 w-12 text-[10px] font-mono font-semibold text-[#0c6aa1] pt-0.5">
                        {a.hora}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[#1F1D3D] truncate">
                          {a.cliente}
                        </p>
                        <p className="text-[10px] text-[#B5B5AE] mt-0.5">
                          {a.codigo}
                        </p>
                        <p className="text-[11px] text-[#35325B] mt-1 leading-snug line-clamp-2">
                          {a.accion}
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <span
                            className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${estado.bg} ${estado.text}`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${ESTADO_DOT[a.estado]}`} />
                            {estado.label}
                          </span>
                          {a.satisfaccion && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-[#F5F5ED] text-[#35325B]">
                              <Stars value={a.satisfaccion === 'muy_satisfecho' ? 5 : a.satisfaccion === 'satisfecho' ? 4 : a.satisfaccion === 'neutral' ? 3 : 2} />
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        </div>
      </Shell>
    </RoleGuard>
  );
}

function ReporteKpi({
  icon: Icon,
  label,
  value,
  accent,
  highlight,
}: {
  icon?: typeof Users;
  label: string;
  value: number | string;
  accent: string;
  highlight?: boolean;
}) {
  return (
    <div className={`bg-white border rounded-xl p-4 ${highlight ? 'border-red-200' : 'border-[#EEEEEC]'}`}>
      <div className="flex items-center gap-2 mb-2">
        {Icon && (
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center"
            style={{ backgroundColor: `${accent}1a` }}
          >
            <Icon className="w-3.5 h-3.5" style={{ color: accent }} />
          </div>
        )}
        <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider">
          {label}
        </p>
      </div>
      <p className={`text-3xl font-bold ${highlight ? 'text-red-700' : 'text-[#1F1D3D]'}`}>
        {value}
      </p>
    </div>
  );
}
