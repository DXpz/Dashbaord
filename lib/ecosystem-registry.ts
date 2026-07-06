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
  Briefcase,
  BarChart3,
  Settings,
  Lock,
  type LucideIcon,
} from 'lucide-react';

export interface SidebarItem {
  href: string;
  label: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export interface SidebarGroup {
  /** ID unico del grupo (para keys y estado de colapso). */
  id: string;
  /** Etiqueta visible del grupo (la "carpeta"). */
  label: string;
  /** Icono opcional del grupo. Si no se da, no se muestra. */
  icon?: LucideIcon;
  /** Items dentro del grupo. */
  items: SidebarItem[];
  /** Si es true, se muestra colapsado por default. */
  defaultCollapsed?: boolean;
}

export interface EcosystemConfig {
  id: string;
  label: string;
  shortLabel: string;
  description: string;
  rootPrefix: string;
  /**
   * Items del sidebar. Puede ser SidebarItem[] (plano) o SidebarGroup[] (agrupado).
   * Si se pasa un array mixto, los SidebarItem sin 'items' se renderizan sueltos
   * y los SidebarGroup con 'items' se renderizan como carpetas.
   */
  sidebarItems: Array<SidebarItem | SidebarGroup>;
  /** Roles que pueden ver este ecosistema (ademas de super_admin que ve todos). */
  allowedRoles: string[];
}

function isGroup(item: SidebarItem | SidebarGroup): item is SidebarGroup {
  return Array.isArray((item as SidebarGroup).items);
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
      {
        id: 'operaciones',
        label: 'Operaciones',
        icon: Briefcase,
        items: [
          { href: '/asesores', label: 'Asesores', icon: Users },
          { href: '/propuestas', label: 'Propuestas', icon: FileText },
          { href: '/reuniones', label: 'Reuniones', icon: Calendar },
          { href: '/round-robin', label: 'Round Robin', icon: CircleDot },
        ],
      },
      {
        id: 'metricas',
        label: 'Métricas',
        icon: BarChart3,
        items: [
          { href: '/metricas-etapas', label: 'Métricas Etapas', icon: AlertTriangle, adminOnly: true },
          { href: '/origen-leads', label: 'Origen Leads', icon: Globe },
          { href: '/negociacion', label: 'Negociación', icon: TrendingUp },
        ],
      },
      {
        id: 'administracion',
        label: 'Administración',
        icon: Settings,
        items: [
          { href: '/gestion-asesores', label: 'Gestión', icon: ShieldCheck },
          { href: '/formulario', label: 'Formulario', icon: FileText },
          { href: '/versiones', label: 'Versiones', icon: Info },
          { href: '/change-password', label: 'Cambiar contraseña', icon: Lock },
        ],
      },
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
      {
        id: 'dr-gestion',
        label: 'Gestión',
        icon: Briefcase,
        items: [
          { href: '/datared/clientes', label: 'Clientes', icon: Users },
          { href: '/datared/reuniones', label: 'Reuniones', icon: Calendar },
          { href: '/datared/usuarios', label: 'Usuarios', icon: ShieldCheck },
          { href: '/change-password', label: 'Cambiar contraseña', icon: Lock },
        ],
      },
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
      {
        id: 'cobros-cuenta',
        label: 'Mi cuenta',
        icon: Settings,
        items: [
          { href: '/change-password', label: 'Cambiar contraseña', icon: Lock },
        ],
      },
    ],
  },
  ventas: {
    id: 'ventas',
    label: 'Ventas',
    shortLabel: 'Ventas',
    description: 'Modulo de gestion de ventas a clientes',
    rootPrefix: '/ventas',
    allowedRoles: ['gestor_ventas', 'admin'],
    sidebarItems: [
      { href: '/ventas', label: 'Panel Ventas', icon: TrendingUp },
      { href: '/ventas/clientes', label: 'Mis Clientes', icon: Users },
      { href: '/ventas/jornada', label: 'Jornada', icon: Calendar },
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
 * - gestor_ventas: solo ventas.
 * - admin/manager: prospektia + datared.
 * - advisor: solo prospektia.
 */
export function getEcosystemsForRole(role: string, isSuperAdmin: boolean): EcosystemConfig[] {
  if (isGestorCobrosRole(role)) {
    return [ECOSYSTEM_REGISTRY.cobros];
  }
  if (isGestorVentasRole(role)) {
    return [ECOSYSTEM_REGISTRY.ventas];
  }
  if (isSuperAdmin || role === 'admin' || role === 'manager') {
    return [ECOSYSTEM_REGISTRY.prospektia, ECOSYSTEM_REGISTRY.datared];
  }
  return listEcosystems().filter((e) => e.allowedRoles.includes(role));
}

function isGestorCobrosRole(role: string): boolean {
  return role === 'gestor_cobros';
}

function isGestorVentasRole(role: string): boolean {
  return role === 'gestor_ventas';
}