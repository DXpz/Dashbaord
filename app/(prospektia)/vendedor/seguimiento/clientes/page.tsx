'use client';

import { VendedorContent } from '@/components/layout/VendedorContent';
import Link from 'next/link';
import {
  Phone,
  Star,
  AlertCircle,
  Search,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { useState } from 'react';
import { useVentasClientes } from '@/hooks';
import type { VtCliente } from '@/services/api/ventas';

type Satisfaccion = VtCliente['satisfaccion'];

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

export default function ClientesSeguimientoPage() {
  const [query, setQuery] = useState('');
  const [filtroSat, setFiltroSat] = useState<'todos' | Satisfaccion>('todos');

  const { data: clientes, loading, error, source } = useVentasClientes();
  const isUnavailable = source === 'unavailable';

  const filtered = (clientes ?? []).filter((c) => {
    if (filtroSat !== 'todos' && c.satisfaccion !== filtroSat) return false;
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      c.nombre.toLowerCase().includes(q) ||
      c.sap_card_code.toLowerCase().includes(q) ||
      (c.ciudad || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <VendedorContent pageTitle="Mis Clientes" showFilterBar={false}>
        <div className="space-y-5 max-w-7xl">
          <div className="bg-white border border-[#EEEEEC] rounded-xl p-12 text-center">
            <p className="text-sm text-[#B5B5AE]">Cargando clientes desde SAP...</p>
          </div>
        </div>
      </VendedorContent>
    );
  }

  if (isUnavailable) {
    return (
      <VendedorContent pageTitle="Mis Clientes" showFilterBar={false}>
        <div className="space-y-5 max-w-7xl">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-sm font-semibold text-amber-900">Backend de Ventas no disponible</h3>
              <p className="text-xs text-amber-800 mt-1">
                No se pudieron cargar tus clientes. Verifica tu conexion o contacta al administrador.
              </p>
              {error && <p className="text-[10px] text-amber-700 mt-2 font-mono">{error}</p>}
            </div>
          </div>
        </div>
      </VendedorContent>
    );
  }

  return (
    <VendedorContent pageTitle="Mis Clientes" showFilterBar={false}>
      <div className="space-y-5 max-w-7xl">
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
            href="/vendedor/seguimiento/jornada"
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
                  <th className="px-5 py-3 w-12">#</th>
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
                      {clientes?.length === 0
                        ? 'Aun no tienes clientes asignados en SAP.'
                        : 'Sin clientes que coincidan con los filtros'}
                    </td>
                  </tr>
                ) : (
                  filtered.map((c, idx) => (
                    <tr key={c.sap_card_code} className="border-t border-[#EEEEEC] hover:bg-[#F5F5ED]/40">
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
                        {c.ciudad || '-'}
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
                        {(c.dias_sin_contacto ?? 0) >= 7 && (
                          <div className="text-[10px] text-amber-600 font-medium mt-0.5">
                            Hace {c.dias_sin_contacto} dias
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            className="inline-flex items-center justify-center w-7 h-7 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Llamar"
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </button>
                          <Link
                            href="/vendedor/seguimiento/jornada"
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
    </VendedorContent>
  );
}
