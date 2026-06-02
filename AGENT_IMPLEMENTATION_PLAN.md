# Vale Juri - Plataforma personal de viaje

## Objetivo

Convertir el mockup actual en una aplicacion profesional para registro diario de actividades de viaje. Debe funcionar como una agenda tecnologica personal: registrar, editar, eliminar, recuperar, recordar y consultar acciones del viaje desde una interfaz elegante, sobria y con identidad visual magica-metalizada.

Stack objetivo:

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase Auth, Postgres, Storage, Realtime y Edge Functions

Nota de diseno: el usuario va a compartir un sitio de referencia visual. Antes de implementar la UI final, extraer de esa referencia: navegacion, ritmo visual, jerarquia, espaciados, textura, motion y tono cromatico. Mantener la estetica actual como base nocturna, sobria y metalizada.

## Principios de producto

1. El calendario es el centro del sistema.
2. Todo lo que se registre desde cualquier modulo debe aparecer reflejado en el calendario.
3. No repetir navegaciones. Debe existir un solo menu principal.
4. Todas las entidades editables deben soportar:
   - crear
   - leer
   - editar
   - eliminar suavemente
   - recuperar
   - registrar historial basico de cambios
5. Las alertas deben aparecer al abrir la app.
6. Las cotizaciones deben poder actualizarse automaticamente y tambien editarse manualmente.
7. La app debe sentirse personal, no corporativa: utilitaria, elegante y preparada para uso diario.

## Direccion de UI

### Header

Reemplazar el header actual por una barra superior flotante.

Estado expandido:

- Izquierda: sello/brujula.
- Texto principal: `Vale Juri`.
- Subtexto debajo: `bitacora`, con menor enfasis, tipografia simple y peso bajo.
- Derecha: menu hamburguesa.
- La barra debe tener vidrio oscuro, borde metalizado sutil y sombra suave.

Estado compacto al hacer scroll:

- Mostrar solo `Vale Juri`.
- Ocultar subtitulo.
- Mantener el menu hamburguesa a la derecha.
- Reducir alto, padding y brillo del header.

### Menu principal

Conservar solo el primer menu. No repetir debajo.

Items principales:

- Agenda
- Finanzas
- Habitos
- Pendientes
- En casa

Destinos no debe competir como tab principal. Debe estar dentro de Agenda o accesible desde el menu hamburguesa como configuracion del viaje.

### Calendario siempre visible

El primer bloque visible de la app debe ser el calendario colapsable.

Estados:

- Expandido: mes completo, resumen de acciones por dia, filtros por grupo.
- Colapsado: semana actual o tira horizontal de dias.

Cada dia debe marcar acciones por grupo:

- Finanzas: borde o punto bordo metalizado.
- Habitos: verde metalizado.
- Pendientes: dorado metalizado.
- En casa: azul metalizado.
- Agenda/destinos: laton/neutro.

Al tocar un dia:

- Mostrar timeline del dia.
- Agrupar acciones por hora.
- Permitir crear accion rapida.
- Permitir filtrar por tipo.

### Paleta funcional

Mantener fondo nocturno sobrio con brillo contenido.

Tokens recomendados:

- Fondo: navy profundo / negro azulado.
- Superficie: azul tinta translucido.
- Texto principal: marfil.
- Texto secundario: gris azulado.
- Metal base: laton suave.
- Finanzas: bordo metalizado.
- Habitos: verde metalizado.
- Pendientes: dorado metalizado.
- En casa: azul metalizado.

No usar una paleta de un solo tono. El sistema debe distinguir grupos sin parecer infantil.

## Modulos funcionales

### Agenda

Registro diario de actividades.

Acciones:

- Crear actividad.
- Editar actividad.
- Eliminar actividad con `deleted_at`.
- Recuperar actividad eliminada.
- Adjuntar comprobantes, fotos o notas.
- Asignar destino.
- Asignar fecha, hora inicio, hora fin.
- Marcar estado: planificado, confirmado, hecho, cancelado.
- Crear recordatorio.

Campos clave:

- titulo
- descripcion
- fecha
- hora_inicio
- hora_fin
- tipo
- estado
- destino_id
- costo opcional
- moneda opcional
- adjuntos opcionales
- recordatorios opcionales

### Finanzas

Renombrar `Dinero` a `Finanzas`.

Funciones:

- Presupuesto total disponible.
- Presupuesto por categoria.
- Registro de gastos.
- Conversor ARS, USD, EUR, GBP.
- Cotizaciones automaticas.
- Cotizaciones manuales.
- Fuente y timestamp de cada cotizacion.
- Diferentes tipos de cotizacion argentina:
  - oficial
  - tarjeta
  - MEP
  - blue
  - manual

Categorias sugeridas para viaje a Europa:

- Alojamiento
- Transporte internacional
- Transporte local
- Comida
- Cafes y snacks
- Excursiones
- Museos y entradas
- Compras
- Regalos
- Medicamentos y farmacia
- Seguro de viaje
- Telefonia / eSIM
- Equipaje y accesorios
- Tramites
- Emergencias
- Estudios / examen / investigacion
- Mascotas / casa
- Otros

IA/cotizaciones:

- Usar una Edge Function programada para capturar cotizaciones desde proveedores configurados.
- Guardar cada respuesta cruda en tabla de auditoria.
- Normalizar valores en `exchange_rates`.
- Permitir override manual por usuario.
- Si falla la fuente automatica, usar ultimo valor valido y mostrar alerta.
- No depender de IA generativa para valores numericos financieros. La IA puede clasificar gastos, sugerir categorias y detectar inconsistencias, pero la cotizacion debe venir de fuentes de datos trazables.

### Habitos

Lista de habitos con progreso semanal y global.

Ejemplos iniciales:

- Preparacion de examen
- Meditacion
- Caminata diaria
- Lectura
- Hidratacion
- Dormir 7 horas
- Practica de idioma
- Registro de gastos

Funciones:

- Crear habito.
- Marcar check por dia.
- Editar check.
- Eliminar/recuperar habito.
- Ver semana actual.
- Ver racha actual.
- Ver mejor racha.
- Ver progreso global por porcentaje.
- Crear eventos asociados al habito.
- Relacionar habito con destino o etapa del viaje.

### Pendientes

Tareas por hacer que no necesariamente pertenecen a casa.

Ejemplos:

- Revisar email.
- Reservar pasajes.
- Comparar boletos.
- Comprar regalos.
- Comprar medicamentos.
- Resolver encargos.
- Cambiar articulo.
- Subir documentacion.
- Confirmar excursion.

Funciones:

- Prioridad: baja, media, alta, critica.
- Fecha limite.
- Estado: pendiente, en curso, bloqueado, hecho, cancelado.
- Recordatorio.
- Adjuntos.
- Notas.
- Convertir pendiente en actividad de agenda.

### En casa

Todo lo remoto que queda activo durante el viaje.

Tipos:

- Pagos de servicios.
- Suscripciones.
- Tareas remotas.
- Encargos familiares.
- Mascotas.
- Casa/departamento.
- Documentacion local.
- Cobranzas.

Funciones:

- Registrar responsable.
- Registrar vencimiento.
- Registrar recurrencia.
- Registrar si requiere comprobante.
- Recordatorios al abrir la app.
- Estado y prioridad.

### Destinos

Debe ser gestionable, pero no como menu principal repetido.

Funciones:

- Cargar destinos.
- Fecha desde / hasta.
- Ciudad / pais.
- Moneda local.
- Zona horaria.
- Alojamiento.
- Notas.
- Excursiones por destino.
- Tickets por excursion.
- Estado del ticket: pendiente, reservado, pagado, usado, cancelado.
- Adjuntar comprobantes.
- Mostrar destino activo segun fecha.

## Alertas al abrir

Al iniciar sesion o abrir la app:

1. Leer recordatorios vencidos.
2. Leer recordatorios de hoy.
3. Leer pendientes criticos.
4. Leer pagos proximos.
5. Leer tickets sin comprobante.
6. Leer cotizaciones vencidas.
7. Mostrar un panel inicial compacto con acciones rapidas.

## Modelo de datos Supabase

Usar `auth.users` para identidad. Todas las tablas de usuario deben tener `user_id uuid not null references auth.users(id)`.

Habilitar RLS en todas las tablas publicas. Politica base: el usuario solo accede a sus filas.

### Enums

```sql
create type action_group as enum (
  'agenda',
  'finance',
  'habit',
  'task',
  'home',
  'destination'
);

create type action_status as enum (
  'planned',
  'confirmed',
  'in_progress',
  'done',
  'cancelled',
  'archived'
);

create type priority_level as enum (
  'low',
  'medium',
  'high',
  'critical'
);

create type ticket_status as enum (
  'pending',
  'reserved',
  'paid',
  'used',
  'cancelled',
  'refunded'
);

create type rate_source_type as enum (
  'api',
  'manual',
  'fallback'
);
```

### Tablas principales

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null default 'Vale Juri',
  subtitle text not null default 'bitacora',
  default_currency text not null default 'ARS',
  timezone text not null default 'America/Argentina/Buenos_Aires',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table trips (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  starts_on date not null,
  ends_on date not null,
  base_currency text not null default 'ARS',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (starts_on <= ends_on)
);

create table destinations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  country text,
  city text,
  timezone text,
  currency text not null,
  starts_on date not null,
  ends_on date not null,
  accommodation text,
  notes text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (starts_on <= ends_on)
);

create table actions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid not null references trips(id) on delete cascade,
  destination_id uuid references destinations(id) on delete set null,
  group_key action_group not null,
  title text not null,
  description text,
  action_date date not null,
  starts_at time,
  ends_at time,
  status action_status not null default 'planned',
  priority priority_level not null default 'medium',
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,
  check (ends_at is null or starts_at is null or starts_at < ends_at)
);

create table action_history (
  id uuid primary key default gen_random_uuid(),
  action_id uuid not null references actions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  operation text not null,
  before_data jsonb,
  after_data jsonb,
  created_at timestamptz not null default now()
);
```

### Finanzas

```sql
create table budget_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid not null references trips(id) on delete cascade,
  name text not null,
  color_token text not null default 'finance',
  planned_amount numeric(12,2) not null default 0,
  currency text not null default 'ARS',
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid not null references trips(id) on delete cascade,
  action_id uuid references actions(id) on delete set null,
  category_id uuid references budget_categories(id) on delete set null,
  destination_id uuid references destinations(id) on delete set null,
  spent_on date not null,
  title text not null,
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null,
  amount_base numeric(12,2),
  base_currency text not null default 'ARS',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table exchange_rates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  base_currency text not null,
  quote_currency text not null,
  rate numeric(18,8) not null check (rate > 0),
  rate_kind text not null default 'official',
  source_type rate_source_type not null default 'api',
  source_name text,
  valid_at timestamptz not null,
  raw_payload jsonb,
  created_at timestamptz not null default now()
);
```

### Habitos

```sql
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid references trips(id) on delete cascade,
  name text not null,
  description text,
  target_per_week integer not null default 7,
  color_token text not null default 'habit',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  habit_id uuid not null references habits(id) on delete cascade,
  logged_on date not null,
  value boolean not null default true,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (habit_id, logged_on)
);
```

### Pendientes, casa, tickets y comprobantes

```sql
create table reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  action_id uuid references actions(id) on delete cascade,
  remind_at timestamptz not null,
  title text not null,
  message text,
  is_seen boolean not null default false,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table tickets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid not null references trips(id) on delete cascade,
  destination_id uuid references destinations(id) on delete set null,
  action_id uuid references actions(id) on delete set null,
  title text not null,
  provider text,
  ticket_date date,
  ticket_time time,
  status ticket_status not null default 'pending',
  amount numeric(12,2),
  currency text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);

create table attachments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  trip_id uuid references trips(id) on delete cascade,
  action_id uuid references actions(id) on delete cascade,
  ticket_id uuid references tickets(id) on delete cascade,
  expense_id uuid references expenses(id) on delete cascade,
  bucket text not null default 'trip-files',
  path text not null,
  file_name text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

## RLS base

Aplicar a todas las tablas con `user_id`:

```sql
alter table actions enable row level security;

create policy "users_select_own_actions"
on actions for select
using (auth.uid() = user_id);

create policy "users_insert_own_actions"
on actions for insert
with check (auth.uid() = user_id);

create policy "users_update_own_actions"
on actions for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users_delete_own_actions"
on actions for delete
using (auth.uid() = user_id);
```

Preferir soft delete desde la app. El delete fisico solo para limpieza administrativa.

## Vistas

Crear vistas con `security_invoker = true`.

```sql
create view calendar_action_summary
with (security_invoker = true) as
select
  user_id,
  trip_id,
  action_date,
  group_key,
  count(*) as total,
  count(*) filter (where status = 'done') as done_total
from actions
where deleted_at is null
group by user_id, trip_id, action_date, group_key;
```

## Arquitectura Next.js

Rutas:

```txt
src/app/
  layout.tsx
  page.tsx
  (app)/
    layout.tsx
    agenda/page.tsx
    finanzas/page.tsx
    habitos/page.tsx
    pendientes/page.tsx
    en-casa/page.tsx
    destinos/page.tsx
    papelera/page.tsx
  auth/
    login/page.tsx
  api/
    exchange-rates/refresh/route.ts
    reminders/due/route.ts
```

Componentes:

```txt
src/components/
  shell/floating-header.tsx
  shell/hamburger-menu.tsx
  calendar/collapsible-calendar.tsx
  calendar/day-action-dots.tsx
  actions/action-timeline.tsx
  actions/action-editor-sheet.tsx
  finance/exchange-rate-panel.tsx
  finance/budget-category-list.tsx
  habits/habit-week-grid.tsx
  reminders/opening-alerts.tsx
  destinations/destination-editor.tsx
```

Server Actions:

```txt
src/app/actions/
  actions.ts
  finances.ts
  habits.ts
  reminders.ts
  destinations.ts
  restore.ts
```

Reglas:

- Server Components para lectura inicial.
- Client Components solo para calendario, sheets, formularios interactivos y toggles.
- Supabase server client en helpers lazy.
- No inicializar clientes externos a nivel de modulo.

## Edge Functions / Automatizacion

### `refresh-exchange-rates`

Frecuencia: cada 6 o 12 horas.

Responsabilidades:

- Consultar fuentes configuradas.
- Guardar payload crudo.
- Normalizar ARS/USD/EUR/GBP.
- Guardar `valid_at`.
- Marcar si se uso fallback.
- Notificar si la cotizacion esta vencida.

### `due-reminders`

Frecuencia: cada hora.

Responsabilidades:

- Buscar recordatorios vencidos no vistos.
- Devolverlos al abrir app.
- Opcional: enviar email/push en fase posterior.

## Acciones del agente implementador

1. Crear proyecto Next.js si aun no existe.
2. Migrar tokens visuales del mockup a `globals.css` y Tailwind theme.
3. Implementar `FloatingHeader`.
4. Eliminar menu duplicado debajo del header.
5. Crear calendario colapsable como primer bloque de la app.
6. Implementar timeline diario con datos mock primero.
7. Crear schema Supabase con migraciones.
8. Crear RLS y probar con usuario autenticado.
9. Conectar Supabase Auth.
10. Implementar CRUD de `actions`.
11. Implementar soft delete y pantalla de recuperacion.
12. Implementar Finanzas:
    - categorias
    - gastos
    - presupuesto
    - cotizaciones automaticas/manuales
13. Implementar Habitos:
    - checks diarios
    - rachas
    - progreso semanal/global
14. Implementar Pendientes.
15. Implementar En casa.
16. Implementar Destinos, excursiones, tickets y comprobantes.
17. Implementar alertas al abrir.
18. Agregar Storage para comprobantes.
19. Verificar desktop y mobile con capturas.
20. Ajustar segun sitio de referencia visual del usuario.

## Prompt maestro para agente

Construir una aplicacion Next.js + Tailwind + Supabase llamada `Vale Juri`. Es una plataforma personal de registro diario para viajeros. Usar el mockup `mockup.html` como base visual, pero profesionalizarlo siguiendo estas reglas:

- Header flotante: `Vale Juri`, subtitulo `bitacora`, menu hamburguesa a la derecha. Al hacer scroll se compacta y queda solo `Vale Juri`.
- Un solo menu principal: Agenda, Finanzas, Habitos, Pendientes, En casa. No repetir menu debajo.
- Primer bloque visible: calendario colapsable, siempre conectado con acciones de todos los modulos.
- Colores por grupo: Finanzas bordo metalizado, Habitos verde metalizado, Pendientes dorado metalizado, En casa azul metalizado.
- Todo registro debe poder crearse, editarse, eliminarse suavemente y recuperarse.
- Usar Supabase con RLS por usuario.
- Implementar cotizaciones automaticas trazables y override manual.
- Implementar presupuestos por categorias de viaje a Europa.
- Implementar destinos con duracion, excursiones, tickets, comprobantes y estados de pago.
- Implementar alertas al abrir por recordatorios, vencimientos, pagos, tickets y cotizaciones vencidas.
- Mantener una UI sobria, oscura, elegante y metalizada. Evitar duplicaciones, ruido visual y textos explicativos innecesarios en pantalla.

## Pendiente para cerrar direccion visual

El usuario debe compartir el sitio de referencia. Cuando lo comparta:

1. Analizar header, navegacion, cards, calendario, motion y paleta.
2. Ajustar tokens.
3. Actualizar componentes principales.
4. Verificar desktop/mobile.
