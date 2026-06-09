/* ════════════════════════════════════════════════════════════
   Modelo de dominio — Vale Juri
   Espeja el schema Supabase del plan (mismos campos/enums) para
   que la migración futura sea directa. Por ahora vive en local.
   ════════════════════════════════════════════════════════════ */

export type ActionGroup =
  | "agenda"
  | "finance"
  | "habit"
  | "task"
  | "home"
  | "destination";

export type ActionStatus =
  | "planned"
  | "confirmed"
  | "in_progress"
  | "done"
  | "cancelled"
  | "archived";

export type Priority = "low" | "medium" | "high" | "critical";

export type TicketStatus =
  | "pending"
  | "reserved"
  | "paid"
  | "used"
  | "cancelled"
  | "refunded";

export type RateSource = "api" | "manual" | "fallback";

export type RateKind = "official" | "tarjeta" | "mep" | "blue" | "manual";

export type Currency = "ARS" | "USD" | "EUR" | "GBP";

/** Campos comunes de auditoría / soft-delete */
export interface Base {
  id: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  deletedAt: string | null;
}

export interface Trip extends Base {
  title: string;
  startsOn: string; // yyyy-MM-dd
  endsOn: string;
  baseCurrency: Currency;
  notes?: string;
}

export interface Destination extends Base {
  tripId: string;
  name: string;
  country?: string;
  city?: string;
  timezone: string;
  currency: Currency;
  startsOn: string;
  endsOn: string;
  accommodation?: string;
  notes?: string;
  province?: string;
  /** referencia del alojamiento (dirección, link, etc.) */
  reference?: string;
  /** persona de contacto en el destino */
  contactName?: string;
  /** teléfono / número de referencia del contacto */
  contactPhone?: string;
  sortOrder: number;
  /** destino suspendido (cambio de planes, cancelación, etc.) */
  suspended?: boolean;
  /** motivo de la suspensión */
  suspendReason?: string;
}

/** Tipos de elemento asociables a un destino (y a la agenda) */
export const TIPO_DESTINO = [
  "vuelo", "estadia", "tour", "visita", "curso", "charla", "evento",
] as const;
export type TipoDestino = (typeof TIPO_DESTINO)[number];

export interface TripAction extends Base {
  tripId: string;
  destinationId: string | null;
  group: ActionGroup;
  /** subtipo fino para agenda: turismo | academico | logistica | comida | ocio … */
  kind?: string;
  title: string;
  description?: string;
  actionDate: string; // yyyy-MM-dd
  startsAt?: string | null; // HH:mm
  endsAt?: string | null;
  status: ActionStatus;
  priority: Priority;
  /** monto opcional (gasto inline) */
  amount?: number | null;
  currency?: Currency | null;
  /** datos flexibles por grupo (responsable, recurrencia, etc.) */
  metadata: Record<string, unknown>;
}

export interface ActionHistory {
  id: string;
  actionId: string;
  operation: "create" | "update" | "soft_delete" | "restore" | "status";
  summary: string;
  at: string; // ISO
}

export interface BudgetCategory extends Base {
  tripId: string;
  name: string;
  colorToken: string;
  plannedAmount: number;
  currency: Currency;
  sortOrder: number;
}

export interface Expense extends Base {
  tripId: string;
  actionId: string | null;
  categoryId: string | null;
  destinationId: string | null;
  spentOn: string; // yyyy-MM-dd
  title: string;
  amount: number;
  currency: Currency;
  amountBase: number | null; // convertido a base (ARS)
  baseCurrency: Currency;
  notes?: string;
  /** id de categoría del catálogo (ej. "transporte", "alojamiento") */
  categoria?: string;
  /** subcategoría dentro de la categoría (ej. "Pasaje aéreo") */
  subcategoria?: string;
}

export interface ExchangeRate {
  id: string;
  baseCurrency: Currency;
  quoteCurrency: Currency;
  rate: number;
  rateKind: RateKind;
  sourceType: RateSource;
  sourceName?: string;
  validAt: string; // ISO
}

export interface Habit extends Base {
  tripId: string | null;
  name: string;
  description?: string;
  targetPerWeek: number;
  colorToken: string;
  icon?: string;
}

export interface HabitLog {
  id: string;
  habitId: string;
  loggedOn: string; // yyyy-MM-dd
  value: boolean;
  notes?: string;
}

export interface Reminder extends Base {
  actionId: string | null;
  remindAt: string; // ISO
  title: string;
  message?: string;
  isSeen: boolean;
}

/** Configuración del usuario (incluye reloj dual) */
export interface Settings {
  /** zona horaria secundaria elegida (la local sale del dispositivo) */
  secondaryTimezone: string;
  /** etiqueta corta de la zona secundaria, ej "ENG" */
  secondaryLabel: string;
  /** etiqueta corta de la hora local, ej "AR" */
  localLabel: string;
  /** signo del zodíaco para orientar las frases */
  zodiac: string;
  /** cumpleaños en formato MM-dd */
  birthday: string;
}

export type Zodiac =
  | "aries" | "tauro" | "geminis" | "cancer" | "leo" | "virgo"
  | "libra" | "escorpio" | "sagitario" | "capricornio" | "acuario" | "piscis";

/** Nota de bitácora — editable 24h, luego queda como registro */
export interface Note {
  id: string;
  dayKey: string;      // yyyy-MM-dd al que pertenece
  text: string;
  createdAt: string;   // ISO
  updatedAt: string;   // ISO
  tz: string;          // zona del dispositivo donde se escribió
}

export type BudgetScope = "day" | "week" | "month";

/** Asignación de presupuesto por período */
export interface BudgetAlloc {
  id: string;
  scope: BudgetScope;
  periodKey: string;   // day: yyyy-MM-dd · week: yyyy-Www · month: yyyy-MM
  name: string;
  amount: number;
  currency: Currency;
  categoryId: string | null;
}

/** Persona o mascota en el registro de casa */
export interface Persona {
  id: string;
  nombre: string;
  tipo: "persona" | "pata";
  createdAt: string;
}

/** Ítem asociado a una persona: regalo o tarea */
export interface PersonaItem {
  id: string;
  personaId: string;
  texto: string;
  tipo: "regalo" | "tarea";
  hecho: boolean;
  createdAt: string;
}

/** Estado completo persistido en local */
export interface AppData {
  settings: Settings;
  trip: Trip;
  destinations: Destination[];
  actions: TripAction[];
  history: ActionHistory[];
  categories: BudgetCategory[];
  expenses: Expense[];
  rates: ExchangeRate[];
  habits: Habit[];
  habitLogs: HabitLog[];
  reminders: Reminder[];
  /** notas de bitácora (una por día, con tz y timestamps) */
  notes: Note[];
  /** asignaciones de presupuesto por período */
  budgets: BudgetAlloc[];
  /** personas y mascotas del registro de casa */
  personas: Persona[];
  /** ítems (regalos/tareas) por persona */
  personaItems: PersonaItem[];
}

/* Metadatos visuales por grupo */
export const GRUPO_META: Record<
  ActionGroup,
  { label: string; token: string; color: string }
> = {
  agenda: { label: "Agenda", token: "destinos", color: "var(--destinos)" },
  finance: { label: "Finanzas", token: "finanzas", color: "var(--finanzas)" },
  habit: { label: "Hábitos", token: "habitos", color: "var(--habitos)" },
  task: { label: "Pendientes", token: "pendientes", color: "var(--pendientes)" },
  home: { label: "En casa", token: "casa", color: "var(--casa)" },
  destination: { label: "Destinos", token: "destinos", color: "var(--destinos)" },
};

export const ESTADO_LABEL: Record<ActionStatus, string> = {
  planned: "Planificado",
  confirmed: "Confirmado",
  in_progress: "En curso",
  done: "Hecho",
  cancelled: "Cancelado",
  archived: "Archivado",
};

export const PRIORIDAD_LABEL: Record<Priority, string> = {
  low: "Baja",
  medium: "Media",
  high: "Alta",
  critical: "Crítica",
};
