'use client';

import { VersionsShell } from '@/components/layout/VersionsShell';
import { Code, FileText, Database, Users } from 'lucide-react';

const VERSIONES = [
  {
    version: '0.5.0',
    fecha: '2026-07-02',
    cambios: [
      'Ecosistema dual ProspektIA + DataRed: super admin puede alternar entre ambos dashboards sin recargar',
      'Sidebar: pill switch ProspektIA / DataRed visible solo para is_super_admin=true',
      'Persistencia del ecosistema seleccionado en localStorage (prospektia_ecosystem)',
      'Vista de Clientes DataRed con tabla, filtros, tabs y modal Nuevo Cliente (9 campos)',
      'Vista de Usuarios DataRed con creación, activación y eliminación de miembros del equipo',
      'Vista de Versiones DataRed con changelog independiente',
      'Resumen DataRed: KPIs grandes estilo ProspektIA + 2 pipelines Chart.js verticales',
      'Backend: is_super_admin agregado al payload de /login y /me (fix de visibilidad del switch)',
    ],
  },
  {
    version: '0.4.0',
    fecha: '2026-06-25',
    cambios: [
      'Landing pública de DataRed (datared.com.sv) con paleta azul/cyan institucional',
      'Chatbot IA embebido (ElevenLabs) en la landing para atención al cliente',
      'Secciones: Data Center, Resguardo en la Nube, Cumplimiento, Backup Continuo',
      'Estilo glassmorphism y animaciones (fade-in-up, float, pulse-slow)',
    ],
  },
  {
    version: '0.3.0',
    fecha: '2026-06-15',
    cambios: [
      'Identidad de marca DataRed: paleta de azules (#0c6aa1, #38bdf8, #0369a1)',
      'Logo y tipografía Inter como estándar de la familia de productos',
      'Definición de servicios principales: Colocación, Servidor Backup, Fibra, Resguardo',
    ],
  },
  {
    version: '0.2.0',
    fecha: '2026-05-30',
    cambios: [
      'Aprovisionamiento de infraestructura para Data Center Tier III',
      'Réplicas cifradas AES-256 en 2 sitios geográficos (SV y GT)',
      'Procedimientos de onboarding ISO 27001 documentados',
    ],
  },
  {
    version: '0.1.0',
    fecha: '2026-05-10',
    cambios: [
      'Kickoff del producto DataRed dentro del ecosistema Red',
      'Definición de alcance: data center + resguardo de medios + CRM de clientes',
      'Asignación de equipo comercial y técnico inicial',
    ],
  },
];

export default function VersionesDataRedPage() {
  return (
    <VersionsShell>
      <div className="space-y-6 max-w-3xl mx-auto">
        <div className="bg-white border border-[#EEEEEC] p-6">
          <h2 className="text-lg font-semibold text-[#1F1D3D] mb-1">
            DataRed — Versiones
          </h2>
          <p className="text-sm text-[#B5B5AE]">
            Control de cambios del producto DataRed (Data Center &amp; Resguardo)
          </p>
        </div>

        <div className="space-y-4">
          {VERSIONES.map((v) => (
            <div key={v.version} className="bg-white border border-[#EEEEEC]">
              <div className="px-4 py-3 border-b border-[#EEEEEC] flex items-center gap-2">
                <span className="text-sm font-semibold text-[#1F1D3D]">
                  v{v.version}
                </span>
                <span className="text-xs text-[#B5B5AE]">•</span>
                <span className="text-xs text-[#B5B5AE]">{v.fecha}</span>
              </div>
              <div className="p-4">
                <ul className="space-y-2">
                  {v.cambios.map((c, i) => (
                    <li
                      key={i}
                      className="flex items-start gap-2 text-sm text-[#35325B]"
                    >
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
          <h3 className="text-sm font-semibold text-[#1F1D3D] mb-3">
            Stack Tecnológico
          </h3>
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
    </VersionsShell>
  );
}
