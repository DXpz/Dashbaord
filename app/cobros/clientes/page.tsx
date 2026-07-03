'use client';

import { Shell } from '@/components/layout/Shell';
import { Search, Phone, Mail, AlertCircle } from 'lucide-react';
import { CLIENTES_DEUDORES } from '../data';
import { useState, useMemo } from 'react';

function formatMoney(n: number): string {
  return n.toLocaleString('es-SV', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 });
}

export default function ClientesCobrosPage() {
  const emptyFilters = {
    desde: '', hasta: '', pais: '', asesor: '', tipoLead: '', origen: '', tipoLlamada: '',
  };
  const handleChange = () => {};
  const handleFiltrar = () => {};
  const handleLimpiar = () => {};

  const [query, setQuery] = useState('');
  const [pais, setPais] = useState<'todos' | 'SV' | 'GT'>('todos');
  const [soloMora, setSoloMora] = useState(false);

  const filtered = useMemo(() => {
    let list = CLIENTES_DEUDORES;
    if (pais !== 'todos') list = list.filter((c) => c.pais === pais);
    if (soloMora) list = list.filter((c) => c.facturasVencidas > 0);
    if (query) {
      const q = query.toLowerCase();
      list = list.filter((c) =>
        c.cliente.toLowerCase().includes(q) ||
        c.empresa.toLowerCase().includes(q) ||
        c.correo.toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => b.totalAdeudado - a.totalAdeudado);
  }, [query, pais, soloMora]);

  const totalAdeudado = filtered.reduce((acc, c) => acc + c.totalAdeudado, 0);
  const totalConMora = filtered.filter((c) => c.facturasVencidas > 0).length;

  return (
    <Shell
      pageTitle="Clientes con deuda"
      filters={emptyFilters}
      onFilterChange={handleChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={[]}
      connectionStatus="connected"
      showFilterBar={false}
    >
      <div className="space-y-5 max-w-7xl">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-[#EEEEEC] rounded-xl p-4">
            <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-1">Clientes con deuda</p>
            <p className="text-3xl font-bold text-[#1F1D3D]">{filtered.length}</p>
          </div>
          <div className="bg-white border border-[#EEEEEC] rounded-xl p-4">
            <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-1">Total adeudado</p>
            <p className="text-3xl font-bold text-[#1F1D3D]">{formatMoney(totalAdeudado)}</p>
          </div>
          <div className="bg-white border border-[#EEEEEC] rounded-xl p-4">
            <p className="text-[10px] font-medium text-[#B5B5AE] uppercase tracking-wider mb-1">En mora</p>
            <p className="text-3xl font-bold text-red-600">{totalConMora}</p>
          </div>
        </div>

        <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#B5B5AE] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente, empresa o correo..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#EEEEEC] bg-[#F5F5ED] text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none focus:border-[#1F1D3D]"
            />
          </div>
          <select
            value={pais}
            onChange={(e) => setPais(e.target.value as typeof pais)}
            className="h-9 px-3 rounded-lg border border-[#EEEEEC] bg-white text-sm text-[#35325B] focus:outline-none focus:border-[#1F1D3D]"
          >
            <option value="todos">Todos los paises</option>
            <option value="SV">El Salvador</option>
            <option value="GT">Guatemala</option>
          </select>
          <label className="flex items-center gap-2 cursor-pointer h-9 px-3 rounded-lg border border-[#EEEEEC] bg-white">
            <input
              type="checkbox"
              checked={soloMora}
              onChange={(e) => setSoloMora(e.target.checked)}
              className="w-4 h-4 accent-[#1F1D3D]"
            />
            <span className="text-sm text-[#35325B]">Solo en mora</span>
          </label>
        </div>

        <div className="bg-white border border-[#EEEEEC] rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-[#F5F5ED]">
              <tr className="text-left text-[10px] uppercase tracking-wider text-[#B5B5AE] font-medium">
                <th className="px-5 py-3">Cliente</th>
                <th className="px-5 py-3">Contacto</th>
                <th className="px-5 py-3">Pais</th>
                <th className="px-5 py-3 text-center">Facturas</th>
                <th className="px-5 py-3 text-right">Adeudado</th>
                <th className="px-5 py-3 text-right">Mora prom.</th>
                <th className="px-5 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((c) => {
                const enMora = c.facturasVencidas > 0;
                return (
                  <tr key={c.clienteId} className="border-t border-[#EEEEEC] hover:bg-[#F5F5ED]/40">
                    <td className="px-5 py-3">
                      <div>
                        <div className="text-[#1F1D3D] font-medium text-sm">{c.empresa}</div>
                        <div className="text-[#B5B5AE] text-xs">{c.cliente}</div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3 text-xs text-[#35325B]">
                        <span className="inline-flex items-center gap-1"><Phone className="w-3 h-3 text-[#B5B5AE]" />{c.telefono}</span>
                        <span className="inline-flex items-center gap-1"><Mail className="w-3 h-3 text-[#B5B5AE]" />{c.correo}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs bg-[#F5F5ED] text-[#35325B] px-2 py-0.5 rounded font-medium">{c.pais}</span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className="text-[#1F1D3D] font-medium text-sm">
                          {c.facturasPendientes + c.facturasVencidas}
                        </span>
                        {c.facturasVencidas > 0 && (
                          <span className="text-[10px] text-red-600 font-medium inline-flex items-center gap-0.5 mt-0.5">
                            <AlertCircle className="w-2.5 h-2.5" />
                            {c.facturasVencidas} vencida{c.facturasVencidas !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`font-mono text-sm font-semibold ${enMora ? 'text-red-600' : 'text-[#1F1D3D]'}`}>
                        {formatMoney(c.totalAdeudado)}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className={`text-xs font-medium ${enMora ? 'text-red-600' : 'text-[#B5B5AE]'}`}>
                        {c.diasPromedioMora > 0 ? `${c.diasPromedioMora} dias` : '—'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          title="Llamar"
                          className="w-7 h-7 rounded-md flex items-center justify-center bg-[#F5F5ED] text-emerald-600 hover:bg-emerald-50 transition-colors"
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </button>
                        <button
                          title="Correo"
                          className="w-7 h-7 rounded-md flex items-center justify-center bg-[#F5F5ED] text-[#0c6aa1] hover:bg-blue-50 transition-colors"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              }) : (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-[#B5B5AE]">
                    No hay clientes con deuda que coincidan con los filtros
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Shell>
  );
}