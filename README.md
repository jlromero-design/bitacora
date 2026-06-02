# Vale Juri · bitácora

Plataforma personal de registro diario de viaje para Vale. Agenda, finanzas,
hábitos, pendientes y "en casa" — todo conectado a un calendario central.
Estética nocturna metalizada (azul tinta + latón).

## Stack

- **Next.js 16** (App Router, Turbopack) + **TypeScript**
- **Tailwind CSS 4** (tema CSS-first en `globals.css`)
- **date-fns** (fechas es-AR, sin corrimiento UTC)
- **Persistencia local** (`localStorage`) — diseñada para migrar a **Supabase** más adelante.

> Supabase (Auth, Postgres, RLS, Edge Functions) está **diferido** a pedido.
> La capa de datos (`src/lib/store.tsx`) espeja el schema del plan, así que
> la migración será reemplazar el store por server actions sin tocar la UI.

## Correr en local

```bash
pnpm install
pnpm dev      # http://localhost:3000  →  redirige a /agenda
```

Otros comandos:

```bash
pnpm build               # build de producción (Turbopack)
pnpm start               # servir el build
pnpm exec tsc --noEmit   # typecheck
```

## Estructura

```
src/
  app/
    layout.tsx              fuentes (Cinzel/EB Garamond/Geist) + lang es-AR
    page.tsx                redirige a /agenda
    globals.css             tokens de diseño (tema nocturno metalizado)
    (app)/
      layout.tsx            envuelve todo en <AppShell>
      agenda/               timeline diario + nota del día
      finanzas/             conversor, estimador ARS, presupuesto, cotizaciones
      habitos/              rachas y últimos 7 días
      pendientes/           trámites a distancia
      en-casa/              afectos + pagos remotos
      destinos/             itinerario editable
      papelera/             recuperación de borrados (soft delete)
  components/
    shell/                  header flotante, menú hamburguesa, alertas al abrir
    calendar/               calendario colapsable con dots por grupo
    actions/                editor de actividades (sheet)
    ui.tsx, icons.tsx       primitivas + íconos SVG originales
  lib/
    types.ts                modelo de dominio (espeja schema Supabase)
    store.tsx               estado + CRUD + soft delete + historial (localStorage)
    selectors.ts            derivados puros (dots, rachas, presupuesto, alertas)
    seed.ts                 datos de ejemplo (el viaje real, editable)
    dates.ts / fx.ts        fechas es-AR y moneda/impuestos
```

## Datos

Todo lo cargado es **editable y persistente** en el navegador. Para volver al
ejemplo: menú hamburguesa → *Restaurar datos de ejemplo*.

## Accesibilidad

Foco visible, targets ≥ 44px, `aria-pressed` / `role="progressbar"` / `aria-live`,
labels reales en inputs, skip link y `prefers-reduced-motion`.

## Pendiente (diferido)

- Conexión a Supabase (Auth + Postgres + RLS + Storage).
- Edge Functions: cotizaciones automáticas trazables y recordatorios.
- El SQL de migración está documentado en `AGENT_IMPLEMENTATION_PLAN.md`.
