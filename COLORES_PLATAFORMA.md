# Paleta de Colores — ProspektIA

Documento de referencia de los colores usados en la plataforma ProspektIA (frontend y branding).

## Colores principales (light mode)

Estos son los colores **primarios** de la marca, definidos en `app/globals.css` y `tailwind.config.ts`.

| Token | Color | Hex | Uso típico |
|---|---|---|---|
| `--space-indigo` | Space Indigo | `#1F1D3D` | Color principal de marca, botones primarios, títulos |
| `--space-indigo-light` | Space Indigo Light | `#35325B` | Hover, acentos secundarios, texto de apoyo |
| `--floral-white` | Floral White | `#F5F5ED` | Background principal (light mode) |
| `--white-smoke` | White Smoke | `#EEEEEC` | Background secundario, bordes sutiles, divisores |
| `--silver` | Silver | `#B5B5AE` | Texto muted, placeholders, scrollbars |

## Colores semánticos (light mode)

Estos colores mapean a roles específicos de la UI.

| Token | Color | Hex | Uso |
|---|---|---|---|
| `--bg-primary` | (mapea a Floral White) | `#F5F5ED` | Background principal de la app |
| `--bg-secondary` | (mapea a White Smoke) | `#EEEEEC` | Cards secundarios, tablas, headers |
| `--bg-card` | White | `#FFFFFF` | Background de cards/modales |
| `--text-primary` | (mapea a Space Indigo) | `#1F1D3D` | Texto principal, títulos |
| `--text-secondary` | (mapea a Space Indigo Light) | `#35325B` | Texto secundario, labels |
| `--text-muted` | (mapea a Silver) | `#B5B5AE` | Texto deshabilitado, hints, placeholders |
| `--border-color` | (mapea a White Smoke) | `#EEEEEC` | Bordes de inputs, cards |
| `--border-subtle` | (mapea a Floral White) | `#F5F5ED` | Bordes muy sutiles, separadores |
| `--accent` | (mapea a Space Indigo) | `#1F1D3D` | Elementos con foco (focus ring) |
| `--accent-hover` | (mapea a Space Indigo Light) | `#35325B` | Hover del accent |

## Colores dark mode

Para el dark mode (si se activa en el futuro), los tokens se invierten:

| Token | Color light | Color dark | Hex dark |
|---|---|---|---|
| `--bg-primary` | Floral White | Space Indigo | `#1F1D3D` |
| `--bg-secondary` | White Smoke | Space Indigo Light | `#35325B` |
| `--bg-card` | White | Indigo Card | `#252343` |
| `--text-primary` | Space Indigo | Floral White | `#F5F5ED` |
| `--text-secondary` | Space Indigo Light | White Smoke | `#EEEEEC` |
| `--text-muted` | Silver | Silver | `#B5B5AE` (igual) |
| `--border-color` | White Smoke | Space Indigo Light | `#35325B` |
| `--border-subtle` | Floral White | Indigo Subtle | `#2a2850` |
| `--accent` | Space Indigo | Silver | `#B5B5AE` |
| `--accent-hover` | Space Indigo Light | White Smoke | `#EEEEEC` |

## Tailwind config (color tokens)

En `tailwind.config.ts` se definen los siguientes tokens extendidos:

```typescript
colors: {
  primary: {
    DEFAULT: 'hsl(var(--primary))',
    foreground: 'hsl(var(--primary-foreground))',
  },
  secondary: {
    DEFAULT: 'hsl(var(--secondary))',
    foreground: 'hsl(var(--secondary-foreground))',
  },
  destructive: {
    DEFAULT: 'hsl(var(--destructive))',
    foreground: 'hsl(var(--destructive-foreground))',
  },
  muted: {
    DEFAULT: 'hsl(var(--muted))',
    foreground: 'hsl(var(--muted-foreground))',
  },
  accent: {
    DEFAULT: 'hsl(var(--accent))',
    foreground: 'hsl(var(--accent-foreground))',
  },
  brand: {
    dark: 'var(--brand-dark)',      // #1F1D3D
    blue: 'var(--brand-blue)',      // #35325B
    light: 'var(--brand-light)',    // #F5F5ED
    red: 'var(--brand-red)',        // (no definido en globals.css, probablemente rojo de error)
  },
}
```

## Colores específicos por componente

### Sidebar (navigation)

- Background: `var(--bg-primary)` (light: `#F5F5ED`, dark: `#1F1D3D`)
- Text: `var(--text-primary)` (light: `#1F1D3D`, dark: `#F5F5ED`)
- Hover: `var(--space-indigo-light)` (`#35325B`)

### Métricas y dashboard

- Cards: `var(--bg-card)` = `#FFFFFF`
- Background principal: `var(--bg-primary)` = `#F5F5ED`
- Títulos: `var(--text-primary)` = `#1F1D3D`
- Texto secundario: `var(--text-secondary)` = `#35325B`
- Texto muted: `var(--text-muted)` = `#B5B5AE`
- Border: `var(--border-color)` = `#EEEEEC`

### Botones primarios

- Background: `var(--space-indigo)` = `#1F1D3D`
- Text: White
- Hover: `var(--space-indigo-light)` = `#35325B`

### Botones secundarios

- Background: White o `var(--bg-secondary)`
- Text: `var(--space-indigo)` = `#1F1D3D`
- Border: `var(--border-color)` = `#EEEEEC`

### Status badges

| Estado | Color típico |
|---|---|
| Success (ganado) | Verde (#10b981 o similar) |
| Warning (en_proceso) | Amber (#f59e0b) |
| Error (perdido) | Red (#ef4444) |
| Info (no_calificado) | `var(--silver)` = `#B5B5AE` |

(Los colores exactos de success/warning/error se definen en cada componente individual con clases Tailwind como `bg-green-50`, `bg-red-50`, etc.)

## Paleta de marca (brand)

Definida en `tailwind.config.ts` como `colors.brand`:

| Token | Hex | Significado |
|---|---|---|
| `brand.dark` | `#1F1D3D` | Space Indigo (color principal oscuro) |
| `brand.blue` | `#35325B` | Space Indigo Light (acento) |
| `brand.light` | `#F5F5ED` | Floral White (claro) |
| `brand.red` | (rojo de error) | No definido en globals.css |

## Cómo aplicar en código nuevo

### En componentes (Tailwind con CSS variables)

```tsx
// Background principal
className="bg-[var(--bg-primary)]"

// Texto
className="text-[var(--text-primary)]"

// Border
className="border-[var(--border-color)]"

// Color principal de marca
className="bg-[var(--space-indigo)] text-white"
```

### Con tokens extendidos (tailwind.config.ts)

```tsx
// Usando brand.dark directamente
className="bg-brand-dark text-white"

// Con color semantico
className="bg-primary text-primary-foreground"
```

## Tipografía

- **Familia**: `Inter` (Google Fonts) con fallback a `-apple-system, BlinkMacSystemFont, sans-serif`
- **Pesos usados**: 300 (light), 400 (normal), 500 (medium), 600 (semibold), 700 (bold)
- **Letter-spacing**: `-0.01em` (body), `-0.02em` (headings)
- **Antialiasing**: Habilitado (`-webkit-font-smoothing: antialiased`)

## Archivos de referencia

- `app/globals.css` — definición de CSS variables (light + dark)
- `tailwind.config.ts` — tokens extendidos (`brand`, `primary`, etc.)
- `components/layout/Sidebar.tsx` — usa variables de color
- `components/layout/Shell.tsx` — usa variables de color

## Changelog

- 2026-06-30: Documento de referencia creado
