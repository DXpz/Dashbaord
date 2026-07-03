/**
 * Registry de ecosistemas.
 *
 * Cada ecosistema declara su metadata, los items de su sidebar
 * y donde vive la raiz de sus rutas en Next.js.
 *
 * Para agregar un nuevo ecosistema:
 *  1. Agregar entrada a ECOSYSTEM_REGISTRY
 *  2. Crear carpeta app/<id>/ con sus pages
 *  3. Crear services/api/<id>/ con su cliente
 *  4. Listo — el switcher, sidebar y Shell lo detectan automaticamente.
 */

import {
  LayoutDashboard,
  Users,
  Calendar,
  ShieldCheck,
  Info,
  FileText,
  AlertTriangle,
  CircleDot,
  Globe,
  TrendingUp,
  type LucideIcon,
} from 'lucide-react';

export interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export interface EcosystemConfig {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  rootPrefix: string;
  sidebarItems: SidebarItem[];
  /** Roles que pueden ver este ecosistema (ademas de super_admin que ve todos). */
  allowedRoles: string[];
}

export const ECOSYSTEM_REGISTRY: Record<string, EcosystemConfig> = {
  prospektia: {
    id: 'prospektia',
    label: 'Red Intelfon',
    shortLabel: 'Red Intelfon',
    description: 'CRM de Leads y Pipeline de Ventas',
    rootPrefix: '',
    allowedRoles: ['admin', 'manager', 'advisor'],
    sidebarItems: [
      { href: '/', label: 'Resumen', icon: LayoutDashboard },
      { href: '/asesores', label: 'Asesores', icon: Users },
      { href: '/propuestas', label: 'Propuestas', icon: FileText },
      { href: '/reuniones', label: 'Reuniones', icon: Calendar },
      { href: '/metricas-etapas', label: 'Métricas Etapas', icon: AlertTriangle, adminOnly: true },
      { href: '/round-robin', label: 'Round Robin', icon: CircleDot },
      { href: '/origen-leads', label: 'Origen Leads', icon: Globe },
      { href: '/gestion-asesores', label: 'Gestión', icon: ShieldCheck },
      { href: '/formulario', label: 'Formulario', icon: FileText },
      { href: '/versiones', label: 'Versiones', icon: Info },
    ],
  },
  datared: {
    id: 'datared',
    label: 'DataRed',
    shortLabel: 'DataRed',
    description: 'Resguardo de Medios y Data Center',
    rootPrefix: '/datared',
    allowedRoles: ['admin', 'manager'],
    sidebarItems: [
      { href: '/datared', label: 'Panel DataRed', icon: LayoutDashboard },
      { href: '/datared/clientes', label: 'Clientes', icon: Users },
      { href: '/datared/reuniones', label: 'Reuniones', icon: Calendar },
      { href: '/datared/usuarios', label: 'Usuarios', icon: ShieldCheck },
      { href: '/datared/versiones', label: 'Versiones', icon: Info },
    ],
  },
  cobros: {
    id: 'cobros',
    label: 'Cobros',
    shortLabel: 'Cobros',
    description: 'Facturacion y seguimiento de pagos',
    rootPrefix: '/cobros',
    allowedRoles: ['gestor_cobros', 'admin'],
    sidebarItems: [
      { href: '/cobros', label: 'Panel Cobros', icon: LayoutDashboard },
      { href: '/cobros/jornada', label: 'Jornada', icon: Calendar },
      { href: '/cobros/clientes', label: 'Clientes', icon: Users },
    ],
  },
  ventas: {
    id: 'ventas',
    label: 'Ventas',
    shortLabel: 'Ventas',
    description: 'Modulo de ventas (pendiente)',
    rootPrefix: '/ventas',
    allowedRoles: ['admin'],
    sidebarItems: [
      { href: '/ventas', label: 'Panel Ventas', icon: TrendingUp },
    ],
  },
};

export function getEcosystem(id: string): EcosystemConfig | undefined {
  return ECOSYSTEM_REGISTRY[id];
}

export function listEcosystems(): EcosystemConfig[] {
  return Object.values(ECOSYSTEM_REGISTRY);
}

export function getEcosystemByRoute(pathname: string): EcosystemConfig | undefined {
  if (pathname.startsWith('/datared')) return ECOSYSTEM_REGISTRY.datared;
  if (pathname.startsWith('/cobros')) return ECOSYSTEM_REGISTRY.cobros;
  if (pathname.startsWith('/ventas')) return ECOSYSTEM_REGISTRY.ventas;
  return ECOSYSTEM_REGISTRY.prospektia;
}

/**
 * Devuelve los ecosistemas que el usuario puede SELECCIONAR en el switcher.
 *
 * - Super admin: prospektia + datared (Cobros no se muestra, se accede por URL directa).
 * - gestor_cobros: solo cobros.
 * - admin/manager: prospektia + datared.
 * - advisor: solo prospektia.
 */
export function getEcosystemsForRole(role: string, isSuperAdmin: boolean): EcosystemConfig[] {
  if (isGestorCobrosRole(role)) {
    return [ECOSYSTEM_REGISTRY.cobros];
  }
  if (isSuperAdmin || role === 'admin' || role === 'manager') {
    return [ECOSYSTEM_REGISTRY.prospektia, ECOSYSTEM_REGISTRY.datared];
  }
  return listEcosystems().filter((e) => e.allowedRoles.includes(role));
}

function isGestorCobrosRole(role: string): boolean {
  return role === 'gestor_cobros';
}