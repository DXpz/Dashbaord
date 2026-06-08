'use client';

import { FileText, Code, Database, Users } from 'lucide-react';

const VERSIONES = [
  {
    version: '2.0.0',
    fecha: '2026-06-08',
    cambios: [
      'Flujo de recuperación de contraseña (forgot-password, change-password)',
      'Filtro de país por código de usuario (GT/SV) en todos los hooks',
      'Vista Round Robin con country_code dinámico',
      'Menú "Cambiar contraseña" en sidebar admin y vendedor',
      'Fix: esperar user antes de hacer fetch para respetar country_code',
    ],
  },
  {
    version: '1.9.0',
    fecha: '2026-05-26',
    cambios: [
      'Gráfico CIERRE stacked bar con toggle Ganadas/Perdidas',
      'Sidebar hamburger para mobile',
      'Filtro FilterBar simplificado (solo Mes/Año)',
      'Vista reuniones sin columna Etapa',
      'Credenciales de asesor en gestión-asesores',
    ],
  },
  {
    version: '1.8.0',
    fecha: '2026-05-20',
    cambios: [
      'Dashboard vendedor con métricas propias',
      'Vista vendedor/reuniones con feedback',
      'VendedorStatusBadge: Venta concretada / Lead perdido',
      'Lead pendiente en dashboard admin (texto rojo)',
    ],
  },
  {
    version: '1.7.0',
    fecha: '2026-05-15',
    cambios: [
      'Gestión-asesores CRUD completo',
      'Dropdowns país limitados a GT/SV',
      'Formulario lead: pais pre-fill desde user.country_code',
      'Reuniones advisor dropdown filtrado por country_code',
    ],
  },
  {
    version: '1.6.0',
    fecha: '2026-05-10',
    cambios: [
      'Origen Leads con distribución por canal',
      'KPIs: Leads Totales, Canal Principal, Canales Activos',
      'Detalle por fuente expandible',
    ],
  },
  {
    version: '1.5.0',
    fecha: '2026-05-05',
    cambios: [
      'Vista Round Robin con gráfico circular',
      'Inactivos round-robin',
      'Asignación manual por administrador',
    ],
  },
  {
    version: '1.4.0',
    fecha: '2026-04-28',
    cambios: [
      'Dashboard admin con métricas completas',
      'Gráfico de embudo por etapas',
      'Filtros por Mes/Año/Pais/Asesor',
    ],
  },
  {
    version: '1.3.0',
    fecha: '2026-04-20',
    cambios: [
      'Vista Reuniones con búsqueda y paginación',
      'StageBadge por etapa',
      'Feedback por reunión',
    ],
  },
  {
    version: '1.2.0',
    fecha: '2026-04-15',
    cambios: [
      'Vista Asesores con ranking y gráfico',
      'Tabla detalle con tasas de aceptación/cierre',
      'Top 3 asesores',
    ],
  },
  {
    version: '1.1.0',
    fecha: '2026-04-10',
    cambios: [
      'Login con auth por JWT',
      'Middleware de protección de rutas',
      'Dashboard vendedor básico',
    ],
  },
  {
    version: '1.0.0',
    fecha: '2026-04-01',
    cambios: [
      'Proyecto inicial',
      'Stack: Next.js 14 + Tailwind + Shadcn/ui + Chart.js',
      'Backend: API en 200.35.189.139:3001',
    ],
  },
];

export default function VersionesPage() {
  return (
    <div className="min-h-screen bg-[#EEEEEC]">
      <header className="bg-[#F5F5ED] border-b border-[#EEEEEC] px-6 py-4">
        <h1 className="text-base font-semibold text-[#1F1D3D]">Versiones</h1>
      </header>

      <main className="p-6">
        <div className="space-y-6 max-w-3xl">
          <div className="bg-white border border-[#EEEEEC] p-6">
            <h2 className="text-lg font-semibold text-[#1F1D3D] mb-1">Dashboard V5</h2>
            <p className="text-sm text-[#B5B5AE]">Control de versiones y cambios realizados</p>
          </div>

          <div className="space-y-4">
            {VERSIONES.map((v) => (
              <div key={v.version} className="bg-white border border-[#EEEEEC]">
                <div className="px-4 py-3 border-b border-[#EEEEEC] flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#1F1D3D]">v{v.version}</span>
                  <span className="text-xs text-[#B5B5AE]">•</span>
                  <span className="text-xs text-[#B5B5AE]">{v.fecha}</span>
                </div>
                <div className="p-4">
                  <ul className="space-y-2">
                    {v.cambios.map((c, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-[#35325B]">
                        <span className="text-[#B5B5AE] mt-1">•</span>
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white border border-[#EEEEEC] p-6">
            <h3 className="text-sm font-semibold text-[#1F1D3D] mb-3">Stack Tecnológico</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-[#35325B]">
                <Code className="w-4 h-4 text-[#B5B5AE]" />
                <span>Next.js 14 + TypeScript</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#35325B]">
                <FileText className="w-4 h-4 text-[#B5B5AE]" />
                <span>Tailwind + Shadcn/ui</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#35325B]">
                <Database className="w-4 h-4 text-[#B5B5AE]" />
                <span>API: 200.35.189.139:3001</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#35325B]">
                <Users className="w-4 h-4 text-[#B5B5AE]" />
                <span>Chart.js + lucide-react</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}