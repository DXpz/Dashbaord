'use client';

import { VersionsShell } from '@/components/layout/VersionsShell';
import { FileText, Code, Database, Users } from 'lucide-react';

const VERSIONES = [
  {
    version: '2.1.8',
    fecha: '2026-06-19',
    cambios: [
      'Métricas por Etapas: nueva vista matriz con cabecera doble (nombre de etapa + valor SLA)',
      'Métricas por Etapas: columnas por etapa (Asignación, Reunión, Demo, Propuesta, Seguimiento, Cierre) con VENCIDO + días',
      'Métricas por Etapas: SLA total = suma de SLAs desde etapa actual hasta Cierre (17d para Reunión)',
      'Métricas por Etapas: columna Restante = SLA total - días vencido (positivo ámbar, negativo rojo)',
      'Métricas por Etapas: columna Días vencido y Estado (Confirmado/Pendiente)',
      'Métricas por Etapas: removed "Confirmar" button (vista solo para admin)',
      'Métricas por Etapas: filtrable por asesor, mes y año',
      'Pipeline de Ventas: tooltip del chart ahora dice "LEADS" en lugar de "Cerradas"',
      'Formulario: persistencia de borradores en localStorage (recuperación si cierra accidentalmente)',
      'Backend: lead ahora se puede cerrar como "Lead perdido" desde stage 1 (Asignación)',
      'Backend: fix timezone - naive datetime se interpreta como hora local SV/GT antes de guardar UTC',
      'Backend: fix manual DB para LD225 y LD245 (corregidos de 2:30/4:00 AM a 8:30/10:00 AM SV)',
    ],
  },
  {
    version: '2.1.7',
    fecha: '2026-06-19',
    cambios: [
      'Logos: agregados en /public/logos/ (prospektia.png = LOGOG, favicon.png = LOGOC)',
      'Sidebar: removidos textos "Dashboard / Metrics", ahora solo muestra el logo centrado',
      'Sidebar: logo más grande (170x43) y centrado con flex-1 wrapper',
      'Login: title de pestaña "ProspektIA | Dashboard" (metadata.title)',
      'Login: banner "¡Esperamos volverte a ver!" al hacer logout (5s, limpia ?bye=1 después)',
      'Login: useSearchParams envuelto en Suspense (fix de build)',
      'Favicon: usa solo /logos/favicon.png con sizes icon/shortcut/apple',
      'Reuniones: usa start_time_display del backend (DD/MM/YYYY hh:mm AM/PM, hora SV)',
    ],
  },
  {
    version: '2.1.6',
    fecha: '2026-06-19',
    cambios: [
      'Formulario: anti-spam en retroalimentación para todos los stages (Reunión, Demo, Propuesta, Seguimiento, Cierre)',
      'Formulario: contador "texto inválido (spam detectado)" en retroalimentación cuando se detecta spam',
      'Backend: bug SLA stage_deadline (psycopg2 interpretaba "%" como placeholder) — ahora usa "%%"',
      'Backend: refactor auditor loop con try-except por iteración + traceback en errores',
      'Backend: jefe notificado SOLO cuando SLA vence (no por intervalo)',
      'Backend: query de escalación incluye stage_*_overdue (antes solo pending)',
      'Backend: payload del webhook pre-mapea campos para HTMLs de Make (pais_nombre, tipo_reunion_label, client_email_display, fechas, etc)',
      'Backend: jefe_nombre por país (SV=Carlos Abrego, GT=Alexandra Londono via JEFE_NOMBRE_SV/GT)',
      'Backend: 6 HTMLs de Make entregados para acciones: alerta, notiREU, notificacion_jefe, retroalimentacion, envio_propuesta, seguimiento_cliente',
    ],
  },
  {
    version: '2.1.5',
    fecha: '2026-06-16',
    cambios: [
      'Filtros: nuevo filtro "Tipo de llamada" (Llamada Virtual, Reunión Presencial, Llamada Telefónica)',
      'Filtros: persisten entre vistas (Resumen, Reuniones, Propuestas) usando localStorage',
      'Reuniones: API.reuniones ahora filtra correctamente por asesor (antes no se enviaba el param)',
      'Reuniones: filtro tipoLlamada ahora se aplica correctamente',
      'Backend: distinción entre filtros globales (total_leads) y filtros específicos (lead_calificado, atendidos_por_asesor)',
      'Backend: atendidos_por_asesor cuenta solo leads realmente gestionados (con retroalimentación, en_proceso, cerrado, o stage > 1)',
      'Backend: leads_no_agendados ahora filtra por origen y asesor',
      'Backend: 89 leads backfilled con preferred_tipo_llamada desde stage_feedback_json[2].tipo_reunion',
    ],
  },
  {
    version: '2.1.4',
    fecha: '2026-06-15',
    cambios: [
      'Vista de Versiones ahora visible para todos los vendedores (GT y SV)',
      'Resumen de vendedor: calendario con eventos de leads, reuniones, propuestas y seguimientos',
      'Resumen de vendedor: simplificar vista (solo KPIs + calendario, sin charts)',
      'Resumen de vendedor: calendario usa start_time del endpoint /metrics/reuniones',
      'Resumen: cantidad de equipos se filtra por asesor, país, fechas y canal de origen',
      'Resumen: métrica total_equipos ahora viene del backend en /metrics/admin/dashboard',
      'Resumen: incluye total_equipos en filtro por asesor usando /metrics/asesor',
      'Filtros: cache con TTL de 30s para evitar datos desactualizados',
      'Métricas Etapas: dropdown de asesores carga correctamente con filtros del mes/año',
      'Formulario: motivo_perdida sin prefijo "SIN CONTACTO - " (formato: razon: descripcion)',
      'Formulario: navegación entre etapas no guarda si no hay cambios (dirty state)',
      'Vendedor: asesores de GT y SV ahora tienen acceso completo al formulario de leads',
    ],
  },
  {
    version: '2.1.3',
    fecha: '2026-06-11',
    cambios: [
      'Corrección: los asesores de Guatemala no podían escribir en el formulario de cada lead',
      'Página vendedor/formulario ahora siempre se abre editable',
      'Modo lectura con banner rojo solo se aplica a vendedor/reuniones para GT',
      'Se agrega canal de origen PostIAlo Mailing en Crear Lead',
      'Eliminado opción duplicada "Redes Sociales" (ya existe "PostIAlo Redes Sociales")',
      'Valor de PostIAlo corregido a "PostIAlo Redes Sociales" exacto en filtros y formulario',
      'Agregada columna "Canal" en vista Reuniones mostrando fuente del lead',
      'Columna "Canal" editable en modo edición de Reuniones',
    ],
  },
  {
    version: '2.1.2',
    fecha: '2026-06-08',
    cambios: [
      'Agregar columna Tipo Lead en vista Reuniones',
      'Permitir cambiar el tipo de lead desde la tabla de Reuniones',
      'Agregar filtro global por Calificado, No calificado y Pendiente',
      'Propagar el filtro de tipo de lead a los reportes y métricas relacionadas',
    ],
  },
  {
    version: '2.1.1',
    fecha: '2026-06-08',
    cambios: [
      'Formulario de actualización de lead más responsivo en móvil y escritorio',
      'Validación por etapa: no permite avanzar sin completar campos obligatorios',
      'Retroalimentación obligatoria y notas opcionales en todas las etapas',
      'Encabezado del lead muestra también el nombre del asesor',
      'Vista Reuniones recupera la columna de contacto con el teléfono del cliente',
      'Filtro de asesor actualiza toda la vista del resumen con datos del asesor seleccionado',
    ],
  },
  {
    version: '2.0.1',
    fecha: '2026-06-08',
    cambios: [
      'Agregar Tipo de Reunión en vista Reuniones',
      'Agregar Requiere Demo en vista Reuniones',
      'Agregar Fecha de reunión en vista Reuniones',
      'Agregar Cantidad de equipos en etapa Propuesta',
      'Agregar Cantidad de equipos en etapa Cierre',
    ],
  },
  {
    version: '2.0.0',
    fecha: '2026-06-08',
    cambios: [
      'Sistema de recuperación de contraseña por correo',
      'Cada usuario solo ve datos de su país (Guatemala o El Salvador)',
      'Round Robin muestra asesores correctos según país',
      'Opción de cambiar contraseña en el menú para admin y vendedor',
      'Fix: esperar a que cargue el usuario antes de mostrar datos',
    ],
  },
  {
    version: '1.9.0',
    fecha: '2026-05-26',
    cambios: [
      'Gráfico de ventas cerradas mostrando cuáles se ganaron y cuáles se perdieron',
      'Menú lateral funciona en celular con botón hamburguesa',
      'Filtros simplificados, solo mes y año',
      'Vista reuniones sin columna de etapa',
      'Se muestran usuario y contraseña al crear asesores',
    ],
  },
  {
    version: '1.8.0',
    fecha: '2026-05-20',
    cambios: [
      'Dashboard separado para vendedores con sus propias métricas',
      'Vendedor puede ver sus reuniones y dar feedback',
      'Badges de estado: venta concretada o lead perdido',
      'Leads pendientes se muestran en rojo',
    ],
  },
  {
    version: '1.7.0',
    fecha: '2026-05-15',
    cambios: [
      'CRUD completo para gestionar asesores',
      'País del asesor limitado a Guatemala o El Salvador',
      'Al crear lead, país se llena automático según el admin',
      'Dropdown de asesores en reuniones filtra por país del admin',
    ],
  },
  {
    version: '1.6.0',
    fecha: '2026-05-10',
    cambios: [
      'Vista de origen de leads con gráfico de canales',
      'Tarjetas: total de leads, canal principal, canales activos',
      'Detalle expandible por fuente',
    ],
  },
  {
    version: '1.5.0',
    fecha: '2026-05-05',
    cambios: [
      'Vista Round Robin con gráfico circular',
      'Asesores inactivos en round robin',
      'Admin puede asignar leads manualmente',
    ],
  },
  {
    version: '1.4.0',
    fecha: '2026-04-28',
    cambios: [
      'Dashboard admin con métricas completas',
      'Gráfico de embudo por etapas de venta',
      'Filtros por mes, año, país y asesor',
    ],
  },
  {
    version: '1.3.0',
    fecha: '2026-04-20',
    cambios: [
      'Vista Reuniones con búsqueda y paginación',
      'Badges de etapa por color',
      'Feedback por reunión',
    ],
  },
  {
    version: '1.2.0',
    fecha: '2026-04-15',
    cambios: [
      'Vista Asesores con ranking y gráfico',
      'Tabla con tasas de aceptación y cierre',
      'Top 3 asesores',
    ],
  },
  {
    version: '1.1.0',
    fecha: '2026-04-10',
    cambios: [
      'Login con usuario y contraseña',
      'Rutas protegidas, solo usuarios logueados',
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
    <VersionsShell>
      <div className="space-y-6 max-w-3xl mx-auto">
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
    </VersionsShell>
  );
}
