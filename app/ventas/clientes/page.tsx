'use client';

import { Shell } from '@/components/layout/Shell';
import Link from 'next/link';
import {
  Phone,
  Star,
  AlertCircle,
  Search,
  ArrowLeft,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';
import { useVentasClientes } from '@/hooks';
import type { VtCliente } from '@/services/api/ventas';

type Satisfaccion = VtCliente['satisfaccion'];

const DEMO_CLIENTES: VtCliente[] = [
  { id: 1, sap_card_code: 'CL002214', nombre: 'BANCO DE DESARROLLO DE LA REPUBLICA DE EL SALVADOR', direccion: null, telefonos: '2260-5500', ciudad: 'San Salvador', categoria: null, correo: 'cobros@bandesal.gob.sv', vendedor_id: 1, satisfaccion: 'muy_satisfecho', dias_sin_contacto: 4, ultima_gestion: '2026-06-28', estado: 'contactado' },
  { id: 2, sap_card_code: 'CL002215', nombre: 'FONDO DE DESARROLLO ECONOMICO', direccion: null, telefonos: '2250-8800', ciudad: 'San Salvador', categoria: null, correo: 'contacto@fde.gob.sv', vendedor_id: 1, satisfaccion: 'satisfecho', dias_sin_contacto: 7, ultima_gestion: '2026-06-25', estado: 'sin_gestion' },
  { id: 3, sap_card_code: 'CL002216', nombre: 'FONDO SALVADORENO DE GARANTIAS', direccion: null, telefonos: '2290-1234', ciudad: 'San Salvador', categoria: null, correo: 'cobros@fosyga.gob.sv', vendedor_id: 1, satisfaccion: 'neutral', dias_sin_contacto: 3, ultima_gestion: '2026-06-29', estado: 'seguimiento' },
  { id: 4, sap_card_code: 'CL003287', nombre: 'INVERSIONES TOTALES, S.A. DE C.V.', direccion: null, telefonos: '2270-9911', ciudad: 'San Salvador', categoria: null, correo: 'cobros@invtotales.com.sv', vendedor_id: 1, satisfaccion: 'muy_satisfecho', dias_sin_contacto: 6, ultima_gestion: '2026-06-26', estado: 'renovacion' },
  { id: 5, sap_card_code: 'CL003289', nombre: 'MINISTERIO DE DESARROLLO LOCAL', direccion: null, telefonos: '2240-3344', ciudad: 'San Salvador', categoria: null, correo: 'cobros@mindel.gob.sv', vendedor_id: 1, satisfaccion: 'satisfecho', dias_sin_contacto: 17, ultima_gestion: '2026-06-15', estado: 'sin_gestion' },
  { id: 6, sap_card_code: 'CL003342', nombre: 'P.S. LA ESPERANZA, S.A. DE C.V.', direccion: null, telefonos: '2260-7788', ciudad: 'San Salvador', categoria: null, correo: 'cobros@psesperanza.com.sv', vendedor_id: 1, satisfaccion: 'insatisfecho', dias_sin_contacto: 1, ultima_gestion: '2026-07-01', estado: 'seguimiento' },
  { id: 7, sap_card_code: 'CL003354', nombre: 'DEVEL SECURITY, S.A. DE C.V.', direccion: null, telefonos: '2280-4455', ciudad: 'Antiguo Cuscatlan', categoria: null, correo: 'cobros@develsecurity.com.sv', vendedor_id: 1, satisfaccion: 'satisfecho', dias_sin_contacto: 2, ultima_gestion: '2026-06-30', estado: 'contactado' },
  { id: 8, sap_card_code: 'CL003376', nombre: 'CAJA DE CREDITO Y AHORRO DE SAN JUAN OPICO', direccion: null, telefonos: '2250-6633', ciudad: 'San Juan Opico', categoria: null, correo: 'cobros@ccsjuanopico.coop.sv', vendedor_id: 1, satisfaccion: 'neutral', dias_sin_contacto: 35, ultima_gestion: '2026-05-28', estado: 'sin_gestion' },
  { id: 9, sap_card_code: 'CL003401', nombre: 'COMERCIALIZADORA DEL PACIFICO, S.A. DE C.V.', direccion: null, telefonos: '2299-1100', ciudad: 'Soyapango', categoria: null, correo: 'cobros@cdelpacifico.com.sv', vendedor_id: 1, satisfaccion: 'muy_satisfecho', dias_sin_contacto: 3, ultima_gestion: '2026-06-29', estado: 'sin_gestion' },
  { id: 10, sap_card_code: 'CL003422', nombre: 'INDUSTRIAS METALURGICAS UNIDAS, S.A. DE C.V.', direccion: null, telefonos: '2271-3388', ciudad: 'Ilopango', categoria: null, correo: 'cobros@imusa.com.sv', vendedor_id: 1, satisfaccion: 'satisfecho', dias_sin_contacto: 5, ultima_gestion: '2026-06-27', estado: 'renovacion' },
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

export default function ClientesVentasPage() {
  const [query, setQuery] = useState('');
  const [filtroSat, setFiltroSat] = useState<'todos' | Satisfaccion>('todos');

  // Hook contra el backend real. Fallback a demo si el backend no responde.
  const { data, source } = useVentasClientes();
  const clientes: VtCliente[] = data && data.length > 0 ? data : DEMO_CLIENTES;
  const isDemo = source === 'demo';

  const filtered = clientes.filter((c) => {
    if (filtroSat !== 'todos' && c.satisfaccion !== filtroSat) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.sap_card_code.toLowerCase().includes(q) ||
      (c.ciudad || '').toLowerCase().includes(q)
    );
  });

  return (
    <Shell
      pageTitle="Mis Clientes"
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

        {isDemo && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-2 flex items-center gap-2 text-xs text-amber-800">
            <AlertCircle className="w-3.5 h-3.5" />
            Backend de Ventas no disponible. Mostrando datos demo.
          </div>
        )}

        <section className="bg-white border border-[#EEEEEC] rounded-xl p-3 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#B5B5AE] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por cliente, codigo o ciudad..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#EEEEEC] bg-[#F5F5ED] text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none focus:border-[#1F1D3D]"
            />
          </div>
          <select
            value={filtroSat}
            onChange={(e) => setFiltroSat(e.target.value as typeof filtroSat)}
            className="h-9 px-3 rounded-lg border border-[#EEEEEC] bg-white text-sm text-[#35325B] focus:outline-none focus:border-[#1F1D3D]"
          >
            <option value="todos">Toda satisfaccion</option>
            <option value="muy_satisfecho">Muy satisfecho</option>
            <option value="satisfecho">Satisfecho</option>
            <option value="neutral">Neutral</option>
            <option value="insatisfecho">Insatisfecho</option>
          </select>
          <Link
            href="/ventas/jornada"
            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-[#1F1D3D] text-white text-sm font-medium hover:bg-[#35325B]"
          >
            <MessageSquare className="w-4 h-4" />
            Ir a jornada
          </Link>
        </section>

        <div className="bg-white border border-[#EEEEEC] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-[#F5F5ED]">
                <tr className="text-left text-[10px] uppercase tracking-wider text-[#B5B5AE] font-semibold">
                  <th className="px-5 py-3">#</th>
                  <th className="px-5 py-3">Codigo</th>
                  <th className="px-5 py-3">Nombre Cliente</th>
                  <th className="px-5 py-3">Ciudad</th>
                  <th className="px-5 py-3">Satisfaccion</th>
                  <th className="px-5 py-3">Ultima gestion</th>
                  <th className="px-5 py-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-sm text-[#B5B5AE]">
                      Sin clientes que coincidan con los filtros
                    </td>
                  </tr>
                ) : (
                  filtered.map((c, idx) => (
                    <tr key={c.id} className="border-t border-[#EEEEEC] hover:bg-[#F5F5ED]/40">
                      <td className="px-5 py-3 text-xs text-[#B5B5AE] text-center font-mono">{idx + 1}</td>
                      <td className="px-5 py-3 text-xs">
                        <span className="text-[#0c6aa1] font-mono font-medium">
                          {c.sap_card_code}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#1F1D3D] uppercase">
                        {c.nombre}
                      </td>
                      <td className="px-5 py-3 text-xs text-[#35325B]">
                        {c.ciudad}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Stars value={satToStars(c.satisfaccion)} />
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${satBadge(c.satisfaccion)}`}>
                            {SATISFACCION_LABEL[c.satisfaccion]}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-xs text-[#35325B]">
                        <div>{c.ultima_gestion || '-'}</div>
                        {c.dias_sin_contacto >= 7 && (
                          <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                            Hace {c.dias_sin_contacto} dias
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors" title="Llamar">
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href="/ventas/jornada"
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-[#1F1D3D] text-white hover:bg-[#35325B] transition-colors"
                            title="Gestionar"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Shell>
  );
}
