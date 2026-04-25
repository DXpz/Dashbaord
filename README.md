# RED Dashboard V5

**Migración del dashboard vanilla JS/HTML a Next.js + Tailwind + Shadcn/ui**

Dashboard de métricas para asesores de ventas con datos de leads, propuestas, reuniones y negociación.

## Stack Tecnológico

- **Framework**: Next.js 14 (App Router)
- **Estilos**: Tailwind CSS + CSS Variables para theming
- **UI Components**: Shadcn/ui (Radix UI primitives)
- **Iconos**: Lucide React
- **Gráficos**: Chart.js (migración desde vanilla) / Recharts disponible
- **Tipos**: TypeScript strict mode

## Estructura del Proyecto

```
DASHBOARD V5/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout con providers
│   ├── page.tsx                  # Resumen General (/)
│   ├── global.css                # Tailwind + variables CSS
│   ├── Asesores/page.tsx
│   ├── Propuestas/page.tsx
│   ├── Negociacion/page.tsx
│   ├── Reuniones/page.tsx
│   ├── OrigenLeads/page.tsx
│   └── GestionAsesores/page.tsx
├── components/
│   ├── ui/                       # Shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── dialog.tsx
│   │   ├── input.tsx
│   │   ├── select.tsx
│   │   ├── skeleton.tsx
│   │   └── table.tsx
│   ├── layout/
│   │   ├── Shell.tsx             # Layout principal (sidebar + content)
│   │   ├── Sidebar.tsx           # Navegación lateral
│   │   └── FilterBar.tsx         # Filtros superiores
│   ├── kpi/
│   │   ├── KPICard.tsx           # Tarjeta individual de métrica
│   │   └── KPIGrid.tsx           # Grid de tarjetas KPI
│   └── charts/
│       └── ChartCard.tsx         # Wrapper para gráficos
├── hooks/
│   ├── useDashboard.ts           # Hook para datos del dashboard
│   └── index.ts                  # Exports de hooks
├── services/
│   └── api.ts                    # API service (migrado de api.js)
├── lib/
│   └── utils.ts                  # Utilidades (cn, formatNumber, etc.)
├── vercel.json                   # Configuración proxy Vercel
└── package.json
```

## Setup Local

```bash
cd "DASHBOARD V5"
npm install
npm run dev
```

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Linting con Next.js ESLint |

## Configuración de Proxy (Vercel)

El archivo `vercel.json` configura rewrites para conectar con la API backend:

```json
{
  "rewrites": [
    { "source": "/api/metrics/:path*", "destination": "http://200.35.189.139/api/metrics/:path*" },
    { "source": "/api/health", "destination": "http://200.35.189.139/api/health" },
    ...
  ],
  "headers": [
    { "key": "X-API-Key", "value": "RedApi_2026_SuperSegura_9XK2" }
  ]
}
```

**Nota**: La API key ya no está expuesta en código frontend - se mueve a headers de Vercel.

## Páginas / Secciones

1. **/** - Resumen General: KPIs, gráficos de leads, pipeline, reuniones
2. **/asesores** - Rendimiento por asesor con tabla de métricas
3. **/propuestas** - Propuestas por rubro, tasa de cierre, motivos de pérdida
4. **/negociacion** - Métricas de negociación, cliente ha negociado
5. **/reuniones** - Listado de reuniones con paginación
6. **/origen-leads** - Distribución y evolución de leads por canal
7. **/gestion-asesores** - CRUD de asesores (activar/desactivar/eliminar)

## API Service

El servicio `services/api.ts` preserva toda la lógica del original `api.js`:

- ✅ Mismos endpoints y parámetros
- ✅ Sistema de cache (`_cache`, `_cacheKey`)
- ✅ Auth headers (`X-API-Key`, `ngrok-skip-browser-warning`)
- ✅ Timeouts configurables (25s fetch, 90s health)
- ✅ Caching de respuestas

## Theming

El diseño soporta light/dark mode mediante CSS variables en `globals.css`:

```css
:root {
  --brand-dark: #145478;
  --brand-red: #c8151b;
  --background: #f4f6f9;
  /* ... */
}

.dark {
  --background: #0f172a;
  --foreground: #f1f5f9;
  /* ... */
}
```

## Fases de Implementación

- [x] Setup proyecto + configuración
- [x] UI components base (Shadcn/ui)
- [x] Layout (Shell, Sidebar, FilterBar)
- [x] KPIGrid + KPICard
- [x] ChartCard wrapper
- [x] 7 páginas básicas
- [ ] Implementar gráficos reales (Chart.js/Recharts)
- [ ] Conectar datos reales de API
- [ ] Animaciones y transiciones
- [ ] Dark/Light mode toggle
- [ ] Documentación completa

## TODO

- [ ] Integrar Chart.js para gráficos reales
- [ ] Implementar paginación en /reuniones
- [ ] CRUD completo en /gestion-asesores
- [ ] Agregar loading skeletons más detallados
- [ ] Implementar toast notifications
- [ ] Error boundaries
- [ ] Responsive mobile detallado

---

**Migración**: Preserva toda la lógica de API existente, solo cambia la capa de presentación de vanilla HTML/CSS/JS a React + Tailwind.