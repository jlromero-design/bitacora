-- ════════════════════════════════════════════════════════════
-- Vale Juri · bitácora — Esquema completo
-- Cubre: perfil/ajustes, viaje, destinos (con contacto), acciones
-- (agenda/finanzas/pendientes/casa con vuelos en metadata), notas
-- con tz, presupuestos por período, gastos, cotizaciones, hábitos,
-- recordatorios e historial. RLS por usuario en todas las tablas.
-- ════════════════════════════════════════════════════════════

create extension if not exists pgcrypto;

-- ── Enums ──────────────────────────────────────────────────
do $$ begin
  create type action_group   as enum ('agenda','finance','habit','task','home','destination');
exception when duplicate_object then null; end $$;
do $$ begin
  create type action_status  as enum ('planned','confirmed','in_progress','done','cancelled','archived');
exception when duplicate_object then null; end $$;
do $$ begin
  create type priority_level as enum ('low','medium','high','critical');
exception when duplicate_object then null; end $$;
do $$ begin
  create type rate_source    as enum ('api','manual','fallback');
exception when duplicate_object then null; end $$;
do $$ begin
  create type budget_scope   as enum ('day','week','month');
exception when duplicate_object then null; end $$;

-- ── Helper: updated_at automático ──────────────────────────
create or replace function set_updated_at() returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

-- ── profiles (1 fila por usuario; incluye ajustes / reloj dual) ──
create table if not exists profiles (
  id                 uuid primary key references auth.users(id) on delete cascade,
  display_name       text not null default 'Vale Juri',
  subtitle           text not null default 'bitácora',
  default_currency   text not null default 'ARS',
  device_timezone    text,                       -- informativo
  secondary_timezone text not null default 'Europe/London',
  secondary_label    text not null default 'ENG',
  local_label        text not null default 'AR',
  zodiac             text not null default 'leo',
  birthday           text not null default '08-03',   -- MM-DD
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- ── trips ──────────────────────────────────────────────────
create table if not exists trips (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  title         text not null,
  starts_on     date not null,
  ends_on       date not null,
  base_currency text not null default 'ARS',
  notes         text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  check (starts_on <= ends_on)
);

-- ── destinations ──────────────────────────────────────────
create table if not exists destinations (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  trip_id       uuid not null references trips(id) on delete cascade,
  name          text not null,
  country       text,
  province      text,
  city          text,
  timezone      text not null default 'Europe/London',
  currency      text not null default 'EUR',
  starts_on     date not null,
  ends_on       date not null,
  accommodation text,
  reference     text,
  contact_name  text,
  contact_phone text,
  notes         text,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  deleted_at    timestamptz,
  check (starts_on <= ends_on)
);

-- ── actions (agenda/finance/task/home/destination; kind + metadata) ──
create table if not exists actions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  trip_id        uuid not null references trips(id) on delete cascade,
  destination_id uuid references destinations(id) on delete set null,
  group_key      action_group not null,
  kind           text,                          -- vuelo/tour/visita/curso/...
  title          text not null,
  description    text,
  action_date    date not null,
  starts_at      time,
  ends_at        time,
  status         action_status  not null default 'planned',
  priority       priority_level not null default 'medium',
  amount         numeric(12,2),
  currency       text,
  metadata       jsonb not null default '{}'::jsonb,  -- datos de vuelo, responsable, etc.
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

create table if not exists action_history (
  id          uuid primary key default gen_random_uuid(),
  action_id   uuid not null references actions(id) on delete cascade,
  user_id     uuid not null references auth.users(id) on delete cascade,
  operation   text not null,                    -- create/update/soft_delete/restore/status
  summary     text,
  created_at  timestamptz not null default now()
);

-- ── notes (bitácora; una por día, con tz donde se escribió) ──
create table if not exists notes (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  trip_id     uuid references trips(id) on delete cascade,
  day_key     date not null,
  text        text not null default '',
  tz          text not null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (user_id, day_key)
);

-- ── budget_categories ──────────────────────────────────────
create table if not exists budget_categories (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  trip_id        uuid not null references trips(id) on delete cascade,
  name           text not null,
  color_token    text not null default 'finanzas',
  planned_amount numeric(12,2) not null default 0,
  currency       text not null default 'ARS',
  sort_order     integer not null default 0,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

-- ── budgets (asignaciones por período: día/semana/mes) ──────
create table if not exists budgets (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  trip_id     uuid references trips(id) on delete cascade,
  scope       budget_scope not null,
  period_key  text not null,                    -- day:yyyy-MM-dd · week:yyyy-Www · month:yyyy-MM
  name        text not null,
  amount      numeric(12,2) not null default 0,
  currency    text not null default 'ARS',
  category_id uuid references budget_categories(id) on delete set null,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- ── expenses ───────────────────────────────────────────────
create table if not exists expenses (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  trip_id        uuid not null references trips(id) on delete cascade,
  action_id      uuid references actions(id) on delete set null,
  category_id    uuid references budget_categories(id) on delete set null,
  destination_id uuid references destinations(id) on delete set null,
  spent_on       date not null,
  title          text not null,
  amount         numeric(12,2) not null check (amount >= 0),
  currency       text not null,
  amount_base    numeric(12,2),
  base_currency  text not null default 'ARS',
  notes          text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz
);

-- ── exchange_rates (oficial/tarjeta/mep/blue/manual; vivo o manual) ──
create table if not exists exchange_rates (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references auth.users(id) on delete cascade,
  base_currency  text not null default 'ARS',
  quote_currency text not null,
  rate           numeric(18,8) not null check (rate > 0),
  rate_kind      text not null default 'tarjeta',  -- official/tarjeta/mep/blue/manual
  source_type    rate_source not null default 'manual',
  source_name    text,
  valid_at       timestamptz not null default now(),
  raw_payload    jsonb,
  created_at     timestamptz not null default now(),
  unique (user_id, quote_currency, rate_kind)
);

-- ── habits + habit_logs ────────────────────────────────────
create table if not exists habits (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users(id) on delete cascade,
  trip_id         uuid references trips(id) on delete cascade,
  name            text not null,
  description     text,
  target_per_week integer not null default 7,
  color_token     text not null default 'habitos',
  icon            text not null default 'sol',     -- clave de ícono
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  deleted_at      timestamptz
);

create table if not exists habit_logs (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  habit_id   uuid not null references habits(id) on delete cascade,
  logged_on  date not null,
  value      boolean not null default true,
  notes      text,
  created_at timestamptz not null default now(),
  unique (habit_id, logged_on)
);

-- ── reminders ──────────────────────────────────────────────
create table if not exists reminders (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  action_id  uuid references actions(id) on delete cascade,
  remind_at  timestamptz not null,
  title      text not null,
  message    text,
  is_seen    boolean not null default false,
  created_at timestamptz not null default now(),
  deleted_at timestamptz
);

-- ── Índices útiles ─────────────────────────────────────────
create index if not exists idx_actions_user_date on actions(user_id, action_date) where deleted_at is null;
create index if not exists idx_actions_group     on actions(user_id, group_key)   where deleted_at is null;
create index if not exists idx_expenses_user_date on expenses(user_id, spent_on)  where deleted_at is null;
create index if not exists idx_budgets_period     on budgets(user_id, scope, period_key);
create index if not exists idx_habitlogs_habit    on habit_logs(habit_id, logged_on);
create index if not exists idx_destinations_trip  on destinations(user_id, trip_id) where deleted_at is null;

-- ── Triggers updated_at ────────────────────────────────────
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','trips','destinations','actions','notes','budget_categories',
    'budgets','expenses','habits'
  ] loop
    execute format(
      'drop trigger if exists trg_%1$s_updated on %1$s;
       create trigger trg_%1$s_updated before update on %1$s
       for each row execute function set_updated_at();', t);
  end loop;
end $$;

-- ── Auto-provisión de profile al crear usuario ─────────────
create or replace function handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id) values (new.id) on conflict do nothing;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ════════════════════════════════════════════════════════════
-- RLS — el usuario sólo accede a sus propias filas
-- ════════════════════════════════════════════════════════════
do $$
declare t text;
begin
  foreach t in array array[
    'profiles','trips','destinations','actions','action_history','notes',
    'budget_categories','budgets','expenses','exchange_rates','habits',
    'habit_logs','reminders'
  ] loop
    execute format('alter table %s enable row level security;', t);
  end loop;
end $$;

-- profiles: la PK es el propio id de usuario
drop policy if exists profiles_rw on profiles;
create policy profiles_rw on profiles
  using (auth.uid() = id) with check (auth.uid() = id);

-- resto de tablas: columna user_id
do $$
declare t text;
begin
  foreach t in array array[
    'trips','destinations','actions','action_history','notes',
    'budget_categories','budgets','expenses','exchange_rates','habits',
    'habit_logs','reminders'
  ] loop
    execute format('drop policy if exists %1$s_rw on %1$s;', t);
    execute format(
      'create policy %1$s_rw on %1$s
         using (auth.uid() = user_id)
         with check (auth.uid() = user_id);', t);
  end loop;
end $$;

-- ── Vista de resumen para el calendario (security_invoker) ──
create or replace view calendar_action_summary
with (security_invoker = true) as
select user_id, trip_id, action_date, group_key,
       count(*) as total,
       count(*) filter (where status = 'done') as done_total
from actions
where deleted_at is null
group by user_id, trip_id, action_date, group_key;
