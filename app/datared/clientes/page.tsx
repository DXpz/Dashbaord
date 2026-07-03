'use client';

import { Shell } from '@/components/layout/Shell';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table';
import {
  Search,
  Upload,
  Download,
  Plus,
  Phone,
  FileText,
  PhoneCall,
  Pencil,
  Trash2,
  CheckCircle2,
} from 'lucide-react';
import { useState } from 'react';
import { NuevoClienteModal } from './NuevoClienteModal';

// DEMO: Datos hardcodeados — pendiente conectar a endpoint /api/datared/clientes
type Estado = 'prospecto' | 'activo' | 'inactivo';

interface Cliente {
  id: number;
  empresa: string;
  inicial: string;
  estado: Estado;
  contacto: string;
  telefono: string;
  servicio: string | null;
  ingreso: string;
  renovacion: string | null;
}

const CLIENTES: Cliente[] = [
  { id: 1, empresa: 'Matus International', inicial: 'M', estado: 'prospecto', contacto: 'Norma Vargas', telefono: '7745 9377', servicio: 'Servidor Backup', ingreso: '02 jul 2026', renovacion: null },
  { id: 2, empresa: 'Interpharmas', inicial: 'I', estado: 'prospecto', contacto: 'recepcion', telefono: '2252-5418', servicio: 'Colocacion', ingreso: '01 jul 2026', renovacion: null },
  { id: 3, empresa: 'Grupo Natura', inicial: 'G', estado: 'prospecto', contacto: 'Diego Delgado', telefono: '6007 1288', servicio: 'Colocacion', ingreso: '01 jul 2026', renovacion: null },
  { id: 4, empresa: 'Dacotrans', inicial: 'D', estado: 'prospecto', contacto: 'Carlos Barrera', telefono: '7837-3609', servicio: 'Colocacion', ingreso: '01 jul 2026', renovacion: null },
  { id: 5, empresa: 'Chivo sa de cv', inicial: 'C', estado: 'prospecto', contacto: 'Karla Lopez', telefono: '-', servicio: null, ingreso: '30 jun 2026', renovacion: null },
  { id: 6, empresa: 'Trans Auto', inicial: 'T', estado: 'prospecto', contacto: 'Alvaro', telefono: '78381503', servicio: null, ingreso: '30 jun 2026', renovacion: null },
  { id: 7, empresa: 'UNO RENT A CAR', inicial: 'U', estado: 'prospecto', contacto: 'Joel Edgardo Rodriguez Jaco', telefono: '69282801', servicio: 'Colocacion', ingreso: '30 jun 2026', renovacion: null },
  { id: 8, empresa: 'Imprenta Wilbot', inicial: 'I', estado: 'prospecto', contacto: 'Reina de Vasquez', telefono: '78621127', servicio: null, ingreso: '30 jun 2026', renovacion: null },
  { id: 9, empresa: 'Aeromantenimiento', inicial: 'A', estado: 'prospecto', contacto: 'Eduardo Herrera', telefono: '64269371', servicio: null, ingreso: '30 jun 2026', renovacion: null },
  { id: 10, empresa: 'Holcim El Salvador', inicial: 'H', estado: 'activo', contacto: 'Maria Rodriguez', telefono: '2200-8800', servicio: 'Colocacion', ingreso: '15 may 2026', renovacion: '15 may 2027' },
  { id: 11, empresa: 'Banco Agricola', inicial: 'B', estado: 'activo', contacto: 'Jose Martinez', telefono: '2260-1010', servicio: 'Servidor Backup', ingreso: '03 mar 2026', renovacion: '03 mar 2027' },
  { id: 12, empresa: 'Tigo El Salvador', inicial: 'T', estado: 'inactivo', contacto: 'Carlos Mendez', telefono: '2290-9000', servicio: 'Colocacion', ingreso: '10 ene 2025', renovacion: '10 ene 2026' },
];

const ESTADO_BADGE: Record<Estado, { label: string; bg: string; text: string; dot: string }> = {
  prospecto: { label: 'Prospecto', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  activo: { label: 'Activo', bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  inactivo: { label: 'Inactivo', bg: 'bg-slate-100', text: 'text-slate-500', dot: 'bg-slate-400' },
};

const TABS: { id: 'todos' | Estado; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'prospecto', label: 'Prospectos' },
  { id: 'activo', label: 'Activos' },
  { id: 'inactivo', label: 'Inactivos' },
];

export default function ClientesPage() {
  const [tab, setTab] = useState<'todos' | Estado>('todos');
  const [query, setQuery] = useState('');
  const [showNuevo, setShowNuevo] = useState(false);

  const filtered = CLIENTES.filter((c) => {
    const matchTab = tab === 'todos' ? true : c.estado === tab;
    const q = query.toLowerCase();
    const matchQuery = !q || c.empresa.toLowerCase().includes(q) || c.contacto.toLowerCase().includes(q);
    return matchTab && matchQuery;
  });

  const counts = {
    todos: CLIENTES.length,
    prospecto: CLIENTES.filter((c) => c.estado === 'prospecto').length,
    activo: CLIENTES.filter((c) => c.estado === 'activo').length,
    inactivo: CLIENTES.filter((c) => c.estado === 'inactivo').length,
  };

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

  return (
    <Shell
      pageTitle="Clientes"
      filters={emptyFilters}
      onFilterChange={handleChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={[]}
      connectionStatus="connected"
      showFilterBar={false}
    >
      <div className="space-y-5 max-w-7xl">
        <header className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-xl font-semibold text-[#1F1D3D]">Clientes</h1>
            <p className="text-sm text-[#35325B] mt-0.5">Prospectos, activos e inactivos</p>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#EEEEEC] bg-white text-[#35325B] text-sm font-medium hover:bg-[#F5F5ED] transition-colors">
              <Upload className="w-4 h-4" />
              Importar CSV
            </button>
            <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg border border-[#EEEEEC] bg-white text-[#35325B] text-sm font-medium hover:bg-[#F5F5ED] transition-colors">
              <Download className="w-4 h-4" />
              Plantilla
            </button>
            <button
              onClick={() => setShowNuevo(true)}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg bg-[#1F1D3D] text-white text-sm font-medium hover:bg-[#35325B] transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuevo Cliente
            </button>
          </div>
        </header>

        <div className="bg-white border border-[#EEEEEC] rounded-xl p-4 flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 text-[#B5B5AE] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar empresa o contacto..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-lg border border-[#EEEEEC] bg-[#F5F5ED] text-sm text-[#1F1D3D] placeholder:text-[#B5B5AE] focus:outline-none focus:border-[#1F1D3D]"
            />
          </div>

          <select className="h-9 px-3 rounded-lg border border-[#EEEEEC] bg-white text-sm text-[#35325B] focus:outline-none focus:border-[#1F1D3D]">
            <option>Todos los sectores</option>
            <option>Financiero</option>
            <option>Salud</option>
            <option>Retail</option>
            <option>Tecnología</option>
          </select>

          <select className="h-9 px-3 rounded-lg border border-[#EEEEEC] bg-white text-sm text-[#35325B] focus:outline-none focus:border-[#1F1D3D]">
            <option>Todos los tamaños</option>
            <option>Pequeña</option>
            <option>Mediana</option>
            <option>Grande</option>
          </select>

          <input
            type="text"
            placeholder="dd / mm / yyyy"
            className="h-9 px-3 rounded-lg border border-[#EEEEEC] bg-white text-sm text-[#B5B5AE] w-36 focus:outline-none focus:border-[#1F1D3D]"
          />
          <input
            type="text"
            placeholder="dd / mm / yyyy"
            className="h-9 px-3 rounded-lg border border-[#EEEEEC] bg-white text-sm text-[#B5B5AE] w-36 focus:outline-none focus:border-[#1F1D3D]"
          />

          <div className="ml-auto flex items-center gap-1 bg-[#F5F5ED] rounded-lg p-1">
            {TABS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-3 h-7 rounded-md text-xs font-medium transition-colors ${
                  tab === t.id
                    ? 'bg-white text-[#1F1D3D] shadow-sm'
                    : 'text-[#35325B] hover:text-[#1F1D3D]'
                }`}
              >
                {t.label}
                <span className="ml-1.5 text-[10px] text-[#B5B5AE] font-mono">
                  {counts[t.id]}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white border border-[#EEEEEC] rounded-xl overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-10">
                  <input type="checkbox" className="rounded" />
                </TableHead>
                <TableHead>Empresa</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Teléfono</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Ingreso</TableHead>
                <TableHead>Renovación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((c) => {
                const badge = ESTADO_BADGE[c.estado];
                return (
                  <TableRow key={c.id}>
                    <TableCell>
                      <input type="checkbox" className="rounded" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-md bg-[#1F1D3D] text-white flex items-center justify-center text-xs font-semibold flex-shrink-0">
                          {c.inicial}
                        </div>
                        <span className="font-medium text-[#1F1D3D]">{c.empresa}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${badge.bg} ${badge.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                        {badge.label}
                      </span>
                    </TableCell>
                    <TableCell>{c.contacto}</TableCell>
                    <TableCell className="text-[#1F1D3D] font-mono text-xs">
                      {c.telefono}
                    </TableCell>
                    <TableCell>
                      {c.servicio ? (
                        <span className="inline-block px-2 py-0.5 rounded-md bg-[#1F1D3D] text-white text-xs font-medium">
                          {c.servicio}
                        </span>
                      ) : (
                        <span className="text-[#B5B5AE]">—</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-[#35325B]">{c.ingreso}</TableCell>
                    <TableCell className="text-xs text-[#35325B]">
                      {c.renovacion || <span className="text-[#B5B5AE]">—</span>}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end gap-1">
                        <ActionIcon icon={CheckCircle2} title="Activar" color="emerald" />
                        <ActionIcon icon={PhoneCall} title="Llamar" color="blue" />
                        <ActionIcon icon={FileText} title="Llamada" color="emerald" />
                        <ActionIcon icon={Phone} title="Teléfono" color="amber" />
                        <ActionIcon icon={Pencil} title="Editar" color="slate" />
                        <ActionIcon icon={Trash2} title="Eliminar" color="red" />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-[#B5B5AE]">
                    No hay clientes que coincidan con los filtros
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <NuevoClienteModal
        open={showNuevo}
        onOpenChange={setShowNuevo}
        onSave={(data) => {
          console.log('Nuevo cliente (DEMO):', data);
        }}
      />
    </Shell>
  );
}

function ActionIcon({
  icon: Icon,
  title,
  color,
}: {
  icon: typeof CheckCircle2;
  title: string;
  color: 'emerald' | 'blue' | 'amber' | 'red' | 'slate';
}) {
  const colorMap = {
    emerald: 'hover:bg-emerald-50 hover:text-emerald-600 text-emerald-600',
    blue: 'hover:bg-blue-50 hover:text-blue-600 text-blue-600',
    amber: 'hover:bg-amber-50 hover:text-amber-600 text-amber-600',
    red: 'hover:bg-red-50 hover:text-red-600 text-red-600',
    slate: 'hover:bg-slate-100 hover:text-slate-700 text-slate-500',
  };
  return (
    <button
      title={title}
      className={`w-7 h-7 rounded-md flex items-center justify-center bg-[#F5F5ED] transition-colors ${colorMap[color]}`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
