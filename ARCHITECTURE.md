# Arquitectura - RED Dashboard V5

## Visión General

Dashboard migrado de vanilla HTML/JS a Next.js 14 App Router. La arquitectura busca:
- **Separación de concerns**: UI components separados de lógica de datos
- **Type Safety**: TypeScript strict en todo el proyecto
- **Reutilización**: Componentes genéricos (KPICard, ChartCard) usados en múltiples páginas
- **Preservación de API**: Servicio de API mantiene el 100% de la lógica original

## Capas de la Aplicación

```
┌─────────────────────────────────────────────────┐
│                    Pages                         │
│  (page.tsx - Resumen, Asesores, Propuestas...)  │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│                  Shell Layout                    │
│  (Sidebar + FilterBar + children)               │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              UI Components                        │
│  Card, Button, Table, Dialog, Input, Select...   │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│                 Hooks                             │
│  useDashboard, useConnectionStatus, useAsesores │
└──────────────────────┬──────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────┐
│              Services / API                      │
│  api.ts - preserva lógica original api.js        │
└─────────────────────────────────────────────────┘
```

## Servicios (Services Layer)

### `services/api.ts`

Capa de comunicación HTTP. Copia literal de `api.js` con adaptaciones TypeScript.

**Responsabilidades:**
- Fetch con timeouts
- Auth headers (X-API-Key, ngrok-skip-browser-warning)
- Cacheo de respuestas (_cache, _cacheKey)
- Query building
- Mapeo de endpoints

**API Surface:**
```typescript
API.dashboard(desde, hasta, limite_motivos, limite_reuniones, opts)
API.resumen(desde, hasta, nombre, pais)
API.asesores(desde, hasta, group_by, nombre, pais)
API.negociacion(desde, hasta, nombre, pais)
API.reuniones(desde, hasta, limite, offset, extra)
API.fuentes(desde, hasta, extra)
API.tiempoRespuesta(desde, hasta, groupBy, extra)
API.nivelesEscalacion(desde, hasta, extra)
API.decisiones(desde, hasta, extra)
API.advisorsList(opts)
API.advisorsCreate(body)
API.advisorsPatch(id, body)
API.advisorsDelete(id)
API.leadHistory(opportunityNumber, mergeAudit)
API.propuestaHistory(auditId)
API.health() / API.ping()
```

## Hooks (Data Layer)

### `useDashboard(filters)`

Hook principal para obtener datos del dashboard.

**Parámetros:**
```typescript
interface FilterState {
  desde: string;      // Fecha inicio (YYYY-MM-DD)
  hasta: string;     // Fecha fin (YYYY-MM-DD)
  pais: string;      // Código país (SV/GT/vacío)
  asesor: string;    // Nombre asesor (vacío = todos)
}
```

**Retorna:**
```typescript
{ data: DashboardData | null, loading: boolean, error: string | null, refetch: () => void }
```

### `useConnectionStatus()`

Verifica conectividad con la API cada 30 segundos.

**Retorna:** `'connected' | 'connecting' | 'error'`

### `useAsesores(filters)`

Obtiene lista de asesores para popular el dropdown de filtros.

## Layout System

### Shell (`components/layout/Shell.tsx`)

Layout principal que envuelve cada página. Compuesto por:
- Sidebar (navegación)
- Header con título de página
- FilterBar (filtros de fecha, país, asesor)
- Área de contenido

### Sidebar (`components/layout/Sidebar.tsx`)

- Navegación fija en desktop (visible siempre)
- Mobile: overlay con toggle (hamburger menu)
- 7 items de navegación con iconos Lucide
- Estado activo según pathname (usePathname)
- Indicador de conexión en footer

### FilterBar (`components/layout/FilterBar.tsx`)

- Inputs de fecha (desde/hasta)
- Select de país (Todos/SV/GT)
- Select de asesor (dinámico desde API)
- Botones Filtrar/Limpiar
- Badge de estado de conexión

## Componentes UI

### Shadcn/ui Base Components

| Componente | Archivo | Props Principales |
|-------------|---------|-------------------|
| Button | `ui/button.tsx` | variant (default/destructive/outline/secondary/ghost/link), size (default/sm/lg/icon) |
| Card | `ui/card.tsx` | Header, Title, Content, Footer separados |
| Dialog | `ui/dialog.tsx` | Modal con overlay, close button automático |
| Table | `ui/table.tsx` | Table, Header, Body, Head, Row, Cell, Caption |
| Input | `ui/input.tsx` | type, placeholder, value, onChange, disabled |
| Select | `ui/select.tsx` | Trigger, Content, Item, Value, Group |
| Skeleton | `ui/skeleton.tsx` | className para dimensiones |

### Componentes de Negocio

#### KPICard (`kpi/KPICard.tsx`)

Tarjeta de métrica individual.
```typescript
interface KPICardProps {
  label: string;                    // Texto inferior
  value: string | number;           // Número principal
  icon: LucideIcon;                 // Icono Lucide
  color: 'blue' | 'green' | 'red' | 'orange' | 'purple' | 'cyan' | 'emerald';
  className?: string;
}
```

#### KPIGrid (`kpi/KPIGrid.tsx`)

Grid 4 columnas (responsive) de KPICards.
```typescript
interface KPIGridProps {
  data: {
    aceptados: number;
    perdidos: number;
    reuniones: number;
    propuestas: number;
    pendientes: number;
    enProceso: number;
    cerrados: number;
    ventasCerradas: number;
  };
}
```

#### ChartCard (`charts/ChartCard.tsx`)

Wrapper para contener gráficos. Header con título y acciones opcionales.
```typescript
interface ChartCardProps {
  title: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
}
```

## Páginas (App Router)

Cada página es un Server/Client Component que:
1. Define estado de filtros locales
2. Usa hooks para obtener datos
3. Renderiza Shell con contenido

### Flujo de Datos por Página

```
Usuario cambia filtro
        │
        ▼
setFilters({ ...prev, [key]: value })
        │
        ▼
useDashboard(filters) se re-ejecuta
        │
        ▼
API.dashboard(...) con nuevos params
        │
        ▼
loading = true → loading = false
        │
        ▼
UI se actualiza con nuevos datos
```

## Variables de Entorno

No se usan variables de entorno ya que la API base está hardcodeada en `api.ts` y se puede cambiar via `localStorage` (usuario) o `vercel.json` (deployment).

## Theming System

### CSS Variables (globals.css)

```css
:root {
  /* Brand Colors */
  --brand-dark: #145478;
  --brand-blue: #107ab4;
  --brand-red: #c8151b;

  /* Semantic Tokens */
  --background: #f4f6f9;
  --foreground: #0f172a;
  --card: #ffffff;
  --primary: var(--brand-dark);
  --border: #c8d0d8;

  /* Shadows */
  --radius: 6px;
}
```

### Dark Mode

Toggle via clase `.dark` en `<html>`. Sistema preparado para implementar theme provider.

## Proxy Configuration (Vercel)

Rewrites en `vercel.json` permiten que el frontend (en Vercel) se conecte al backend (200.35.189.139) sin CORS ni mixed content issues.

```javascript
// next.config.js
const nextConfig = {
  output: 'export',  // Static export para Vercel
  images: { unoptimized: true }
};
```

## Decisiones de Diseño

1. **App Router sobre Pages Router**: Mejor para futuras features (layouts anidados, loading boundaries)
2. **Tailwind sobre CSS Modules**: Consistencia con Shadcn/ui, faster development
3. **Radix UI (Shadcn) sobreHeadless UI**: Mejor accesibilidad, animaciones más controlables
4. **Preservar api.js tal cual**: Minimiza riesgo de romper integración con backend
5. **Output 'export'**: Para hosting estático (Vercel), no se necesita server runtime

## Patrones de Código

### Componente con hooks:
```typescript
'use client';

export function MyComponent() {
  const [state, setState] = useState(initial);

  return (
    <div>
      {/* UI */}
    </div>
  );
}
```

### Uso de Shell:
```typescript
export default function MyPage() {
  return (
    <Shell
      pageTitle="Mi Página"
      filters={filters}
      onFilterChange={handleFilterChange}
      onFiltrar={handleFiltrar}
      onLimpiar={handleLimpiar}
      asesores={asesoresOptions}
      connectionStatus={connectionStatus}
    >
      {/* Contenido de la página */}
    </Shell>
  );
}
```

## Métricas de Éxito (TODO)

- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3s
- [ ] Zero console errors
- [ ] Full accessibility audit (axe-core)