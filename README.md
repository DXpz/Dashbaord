# RED Dashboard V5

Dashboard de métricas para asesores de ventas con datos de leads, propuestas, reuniones y negociación.

## Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Estilos**: Tailwind CSS + CSS Variables
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Iconos**: Lucide React
- **Gráficos**: Chart.js
- **Tipos**: TypeScript

## Estructura del Proyecto

```
DASHBOARD V5/
├── app/
│   ├── page.tsx                  # Resumen General
│   ├── reuniones/page.tsx        # Listado de reuniones
│   ├── propuestas/page.tsx       # Propuestas y tasas
│   ├── negociacion/page.tsx      # Métricas de negociación
│   ├── origen-leads/page.tsx     # Origen de leads
│   ├── gestion-asesores/page.tsx # CRUD de asesores
│   └── formulario/               # Formulario de leads
├── components/
│   ├── ui/                      # Shadcn/ui components
│   ├── layout/                  # Shell, Sidebar, FilterBar
│   ├── kpi/                     # KPICard, KPIGrid
│   ├── charts/                  # ChartCard, ChartWrapper
│   └── formulario/              # Formulario component
├── hooks/
│   ├── useDashboard.ts           # Hooks de datos
│   └── useFilters.ts            # Estado de filtros
├── services/
│   └── api.ts                   # Servicio de API
└── lib/
    ├── auth-context.tsx          # Contexto de autenticación
    └── utils.ts                 # Utilidades
```

## Setup

```bash
npm install
npm run dev
```

## Variables de Entorno

```env
API_KEY=your_api_key_here
```

El backend API está configurado en `services/api.ts`.

## Scripts

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Linting ESLint |

## Páginas

1. **`/`** - Resumen General: KPIs, gráficos de leads, pipeline
2. **`/reuniones`** - Listado de reuniones con paginación y edición
3. **`/propuestas`** - Propuestas por rubro, tasa de cierre, motivos de pérdida
4. **`/negociacion`** - Métricas de negociación
5. **`/origen-leads`** - Distribución de leads por canal
6. **`/gestion-asesores`** - CRUD de asesores

## Autenticación

El dashboard usa autenticación via cookie (`api_token`). El contexto de auth está en `lib/auth-context.tsx`.

## Vistas

### Admin
- Todas las métricas aggregated
- Gestión de asesores
- Vista de todos los leads

### Vendedor
- Solo sus propios leads
- Formulario de actualización de lead
