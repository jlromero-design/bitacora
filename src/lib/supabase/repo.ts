/* ════════════════════════════════════════════════════════════
   Capa de acceso a datos Supabase — mapea filas (snake_case) ↔
   tipos de la app (camelCase), carga todo el estado de un usuario
   y siembra el viaje de ejemplo. Mantiene el shape de AppData.
   ════════════════════════════════════════════════════════════ */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { AppData } from "@/lib/types";
import { seedData } from "@/lib/seed";

/* ── Mapas appKey → columna db ── */
type FieldMap = Record<string, string>;

export const MAPS: Record<string, FieldMap> = {
  trips: {
    id: "id", title: "title", startsOn: "starts_on", endsOn: "ends_on",
    baseCurrency: "base_currency", notes: "notes",
    createdAt: "created_at", updatedAt: "updated_at", deletedAt: "deleted_at",
  },
  destinations: {
    id: "id", tripId: "trip_id", name: "name", country: "country",
    province: "province", city: "city", timezone: "timezone", currency: "currency",
    startsOn: "starts_on", endsOn: "ends_on", accommodation: "accommodation",
    reference: "reference", contactName: "contact_name", contactPhone: "contact_phone",
    notes: "notes", sortOrder: "sort_order",
    createdAt: "created_at", updatedAt: "updated_at", deletedAt: "deleted_at",
  },
  actions: {
    id: "id", tripId: "trip_id", destinationId: "destination_id",
    group: "group_key", kind: "kind", title: "title", description: "description",
    actionDate: "action_date", startsAt: "starts_at", endsAt: "ends_at",
    status: "status", priority: "priority", amount: "amount", currency: "currency",
    metadata: "metadata",
    createdAt: "created_at", updatedAt: "updated_at", deletedAt: "deleted_at",
  },
  notes: {
    id: "id", tripId: "trip_id", dayKey: "day_key", text: "text", tz: "tz",
    createdAt: "created_at", updatedAt: "updated_at",
  },
  budget_categories: {
    id: "id", tripId: "trip_id", name: "name", colorToken: "color_token",
    plannedAmount: "planned_amount", currency: "currency", sortOrder: "sort_order",
    createdAt: "created_at", updatedAt: "updated_at", deletedAt: "deleted_at",
  },
  budgets: {
    id: "id", tripId: "trip_id", scope: "scope", periodKey: "period_key",
    name: "name", amount: "amount", currency: "currency", categoryId: "category_id",
  },
  expenses: {
    id: "id", tripId: "trip_id", actionId: "action_id", categoryId: "category_id",
    destinationId: "destination_id", spentOn: "spent_on", title: "title",
    amount: "amount", currency: "currency", amountBase: "amount_base",
    baseCurrency: "base_currency", notes: "notes",
    createdAt: "created_at", updatedAt: "updated_at", deletedAt: "deleted_at",
  },
  exchange_rates: {
    id: "id", baseCurrency: "base_currency", quoteCurrency: "quote_currency",
    rate: "rate", rateKind: "rate_kind", sourceType: "source_type",
    sourceName: "source_name", validAt: "valid_at",
  },
  habits: {
    id: "id", tripId: "trip_id", name: "name", description: "description",
    targetPerWeek: "target_per_week", colorToken: "color_token", icon: "icon",
    createdAt: "created_at", updatedAt: "updated_at", deletedAt: "deleted_at",
  },
  habit_logs: {
    id: "id", habitId: "habit_id", loggedOn: "logged_on", value: "value", notes: "notes",
  },
  reminders: {
    id: "id", actionId: "action_id", remindAt: "remind_at", title: "title",
    message: "message", isSeen: "is_seen",
    createdAt: "created_at", deletedAt: "deleted_at",
  },
};

// Claves que requieren coerción al leer
const NUMERIC = new Set(["amount", "amountBase", "rate", "plannedAmount", "targetPerWeek", "sortOrder"]);
const TIME = new Set(["startsAt", "endsAt"]); // db time → "HH:mm"

type Row = Record<string, unknown>;

function fromDb<T>(row: Row, map: FieldMap): T {
  const out: Row = {};
  for (const [appKey, col] of Object.entries(map)) {
    let v = row[col];
    if (v != null) {
      if (NUMERIC.has(appKey)) v = Number(v);
      else if (TIME.has(appKey) && typeof v === "string") v = v.slice(0, 5);
    }
    out[appKey] = v ?? null;
  }
  return out as T;
}

/** Convierte un objeto de la app a fila db (snake), inyectando extras (user_id, trip_id). */
export function toDb(obj: Row, map: FieldMap, extra: Row = {}): Row {
  const out: Row = { ...extra };
  for (const [appKey, col] of Object.entries(map)) {
    if (obj[appKey] !== undefined) out[col] = obj[appKey];
  }
  return out;
}

/* ── Carga completa del estado de un usuario ── */
export async function loadAll(sb: SupabaseClient): Promise<AppData | null> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return null;

  // Perfil / ajustes
  const { data: prof } = await sb.from("profiles").select("*").eq("id", user.id).maybeSingle();

  // Viaje activo (el más reciente no borrado)
  const { data: trips } = await sb.from("trips").select("*")
    .is("deleted_at", null).order("created_at", { ascending: false }).limit(1);
  const tripRow = trips?.[0];
  if (!tripRow) return null; // no hay viaje → onboarding

  const tripId = tripRow.id as string;
  const seed = seedData();

  // Cargas en paralelo (RLS filtra por usuario)
  const [
    destinations, actions, notes, categories, budgets,
    expenses, rates, habits, habitLogs, reminders,
  ] = await Promise.all([
    sb.from("destinations").select("*").eq("trip_id", tripId),
    sb.from("actions").select("*").eq("trip_id", tripId),
    sb.from("notes").select("*"),
    sb.from("budget_categories").select("*").eq("trip_id", tripId),
    sb.from("budgets").select("*"),
    sb.from("expenses").select("*").eq("trip_id", tripId),
    sb.from("exchange_rates").select("*"),
    sb.from("habits").select("*"),
    sb.from("habit_logs").select("*"),
    sb.from("reminders").select("*"),
  ]);

  const map = <T,>(rows: Row[] | null, m: FieldMap): T[] =>
    (rows ?? []).map((r) => fromDb<T>(r, m));

  return {
    settings: prof
      ? {
          secondaryTimezone: prof.secondary_timezone ?? seed.settings.secondaryTimezone,
          secondaryLabel: prof.secondary_label ?? seed.settings.secondaryLabel,
          localLabel: prof.local_label ?? seed.settings.localLabel,
          zodiac: prof.zodiac ?? seed.settings.zodiac,
          birthday: prof.birthday ?? seed.settings.birthday,
        }
      : seed.settings,
    trip: fromDb(tripRow, MAPS.trips),
    destinations: map(destinations.data, MAPS.destinations),
    actions: map(actions.data, MAPS.actions),
    history: [],
    categories: map(categories.data, MAPS.budget_categories),
    budgets: map(budgets.data, MAPS.budgets),
    expenses: map(expenses.data, MAPS.expenses),
    rates: map(rates.data, MAPS.exchange_rates),
    habits: map(habits.data, MAPS.habits),
    habitLogs: map(habitLogs.data, MAPS.habit_logs),
    reminders: map(reminders.data, MAPS.reminders),
    notes: map(notes.data, MAPS.notes),
    personas:     [],
    personaItems: [],
  } as AppData;
}

/* ── Sembrado: inserta el viaje de ejemplo en la cuenta del usuario ──
   Los IDs del seed son legibles (trip-1, dest-bsas…) pero las columnas
   son uuid: remapeamos cada id a un uuid real y reescribimos las FKs. */
export async function seedToSupabase(sb: SupabaseClient): Promise<boolean> {
  const { data: { user } } = await sb.auth.getUser();
  if (!user) return false;
  const uid = user.id;
  const s = seedData();

  const m: Record<string, string> = {};
  const id = (k?: string | null): string | null => {
    if (!k) return null;
    if (!m[k]) m[k] = crypto.randomUUID();
    return m[k];
  };

  await sb.from("profiles").upsert({
    id: uid,
    secondary_timezone: s.settings.secondaryTimezone,
    secondary_label: s.settings.secondaryLabel,
    local_label: s.settings.localLabel,
    zodiac: s.settings.zodiac,
    birthday: s.settings.birthday,
  });

  // Padres (asignan uuid a su id)
  const trip = { ...s.trip, id: id(s.trip.id)! };
  await sb.from("trips").upsert(toDb(trip as unknown as Row, MAPS.trips, { user_id: uid }));

  const dests = s.destinations.map((d) => ({ ...d, id: id(d.id)!, tripId: id(d.tripId)! }));
  const cats = s.categories.map((c) => ({ ...c, id: id(c.id)!, tripId: id(c.tripId)! }));
  const habs = s.habits.map((h) => ({ ...h, id: id(h.id)!, tripId: id(h.tripId) }));

  const ins = (table: string, rows: Row[]) =>
    rows.length ? sb.from(table).upsert(rows) : Promise.resolve({ error: null });

  await Promise.all([
    ins("destinations", dests.map((d) => toDb(d as unknown as Row, MAPS.destinations, { user_id: uid }))),
    ins("budget_categories", cats.map((c) => toDb(c as unknown as Row, MAPS.budget_categories, { user_id: uid }))),
    ins("habits", habs.map((h) => toDb(h as unknown as Row, MAPS.habits, { user_id: uid }))),
  ]);

  // Acciones (dependen de destino) → asignan uuid a su id
  const acts = s.actions.map((a) => ({ ...a, id: id(a.id)!, tripId: id(a.tripId)!, destinationId: id(a.destinationId) }));
  await ins("actions", acts.map((a) => toDb(a as unknown as Row, MAPS.actions, { user_id: uid })));

  // Hijos restantes (id propio nuevo + FKs remapeadas)
  await Promise.all([
    ins("notes", s.notes.map((n) => toDb({ ...n, id: crypto.randomUUID() } as unknown as Row, MAPS.notes, { user_id: uid }))),
    ins("budgets", s.budgets.map((b) => toDb({ ...b, id: crypto.randomUUID(), categoryId: id(b.categoryId) } as unknown as Row, MAPS.budgets, { user_id: uid }))),
    ins("expenses", s.expenses.map((e) => toDb({ ...e, id: crypto.randomUUID(), tripId: id(e.tripId), actionId: id(e.actionId), categoryId: id(e.categoryId), destinationId: id(e.destinationId) } as unknown as Row, MAPS.expenses, { user_id: uid }))),
    ins("exchange_rates", s.rates.map((r) => toDb({ ...r, id: crypto.randomUUID() } as unknown as Row, MAPS.exchange_rates, { user_id: uid }))),
    ins("reminders", s.reminders.map((r) => toDb({ ...r, id: crypto.randomUUID(), actionId: id(r.actionId) } as unknown as Row, MAPS.reminders, { user_id: uid }))),
    ins("habit_logs", s.habitLogs.map((l) => toDb({ ...l, id: crypto.randomUUID(), habitId: id(l.habitId)! } as unknown as Row, MAPS.habit_logs, { user_id: uid }))),
  ]);

  return true;
}

/* ── Escrituras genéricas (las usa el store en el Paso 2) ── */
export async function upsertRow(sb: SupabaseClient, table: string, row: Row) {
  return sb.from(table).upsert(row);
}
export async function deleteRow(sb: SupabaseClient, table: string, id: string) {
  return sb.from(table).delete().eq("id", id);
}
