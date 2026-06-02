/* ════════════════════════════════════════════════════════════
   Selectores puros sobre AppData. Sin estado, fáciles de testear
   y de reusar cuando la fuente sea Supabase.
   ════════════════════════════════════════════════════════════ */
import type {
  AppData, TripAction, Destination, ActionGroup, Habit, Currency,
} from "./types";
import { dentroDe, todayKey, sumarDias, semanaDe, periodKeyDe } from "./dates";
import { construirTasas, convertir, type TasasARS } from "./fx";
import type { BudgetScope } from "./types";

/** Acciones no eliminadas */
export function accionesVivas(d: AppData): TripAction[] {
  return d.actions.filter((a) => !a.deletedAt);
}

/** Acciones de un día (ordenadas por hora; sin hora al final) */
export function accionesDeDia(d: AppData, dayKey: string): TripAction[] {
  return accionesVivas(d)
    .filter((a) => a.actionDate === dayKey)
    .sort((a, b) => {
      if (!a.startsAt && !b.startsAt) return 0;
      if (!a.startsAt) return 1;
      if (!b.startsAt) return -1;
      return a.startsAt.localeCompare(b.startsAt);
    });
}

/** Destino cuyo intervalo contiene la fecha */
export function destinoDeFecha(d: AppData, dayKey: string): Destination | null {
  return (
    d.destinations
      .filter((x) => !x.deletedAt)
      .find((x) => dentroDe(dayKey, x.startsOn, x.endsOn)) ?? null
  );
}

/** Paleta metalizada asignada por el sistema a cada destino (por orden). */
export const PALETA_DESTINOS = [
  "#c9a24b", // latón
  "#6699d8", // azul metal
  "#5bb491", // verde metal
  "#c77f5c", // cobre
  "#9b7fd0", // amatista
  "#c75c8a", // rosa metal
];

export function colorDestino(d: AppData, destId: string | null): string {
  if (!destId) return "var(--gris-azul-dim)";
  const orden = [...d.destinations]
    .filter((x) => !x.deletedAt)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const i = orden.findIndex((x) => x.id === destId);
  return i >= 0 ? PALETA_DESTINOS[i % PALETA_DESTINOS.length] : "var(--gris-azul-dim)";
}

/** Destino activo hoy (o el primero futuro si el viaje no empezó) */
export function destinoActivo(d: AppData): Destination | null {
  const hoy = todayKey();
  return (
    destinoDeFecha(d, hoy) ??
    d.destinations
      .filter((x) => !x.deletedAt)
      .sort((a, b) => a.startsOn.localeCompare(b.startsOn))[0] ??
    null
  );
}

/** Conteo de acciones por grupo para un día (para los puntos del calendario) */
export function dotsDeDia(d: AppData, dayKey: string): Record<ActionGroup, number> {
  const base: Record<ActionGroup, number> = {
    agenda: 0, finance: 0, habit: 0, task: 0, home: 0, destination: 0,
  };
  for (const a of accionesDeDia(d, dayKey)) base[a.group]++;
  // gastos del día → finanzas
  base.finance += d.expenses.filter((e) => !e.deletedAt && e.spentOn === dayKey).length;
  // hábitos logueados → habit
  base.habit += d.habitLogs.filter((l) => l.loggedOn === dayKey).length > 0 ? 1 : 0;
  return base;
}

/* ── Hábitos ── */
export function logueado(d: AppData, habitId: string, dayKey: string): boolean {
  return d.habitLogs.some((l) => l.habitId === habitId && l.loggedOn === dayKey);
}

/** Racha actual (días consecutivos hasta hoy) */
export function rachaActual(d: AppData, habitId: string): number {
  let n = 0;
  let cursor = todayKey();
  while (logueado(d, habitId, cursor)) {
    n++;
    cursor = sumarDias(cursor, -1);
  }
  return n;
}

/** Mejor racha histórica */
export function mejorRacha(d: AppData, habitId: string): number {
  const dias = d.habitLogs
    .filter((l) => l.habitId === habitId)
    .map((l) => l.loggedOn)
    .sort();
  let best = 0, run = 0, prev = "";
  for (const day of dias) {
    if (prev && sumarDias(prev, 1) === day) run++;
    else run = 1;
    best = Math.max(best, run);
    prev = day;
  }
  return best;
}

/** Progreso de la semana actual (logs / objetivo) */
export function progresoSemana(d: AppData, habit: Habit): { hechos: number; objetivo: number } {
  const semana = semanaDe(todayKey());
  const hechos = semana.filter((k) => logueado(d, habit.id, k)).length;
  return { hechos, objetivo: habit.targetPerWeek };
}

/* ── Finanzas ── */
export function tasasActuales(d: AppData, kind = "tarjeta"): TasasARS {
  return construirTasas(d.rates, kind);
}

/** Gasto total por categoría en ARS (convirtiendo con tasas) */
export function gastoPorCategoria(d: AppData, tasas: TasasARS): Map<string, number> {
  const m = new Map<string, number>();
  for (const e of d.expenses.filter((x) => !x.deletedAt)) {
    const ars = e.amountBase ?? convertir(e.amount, e.currency, "ARS", tasas);
    const key = e.categoryId ?? "sin-categoria";
    m.set(key, (m.get(key) ?? 0) + ars);
  }
  return m;
}

export function gastoTotal(d: AppData, tasas: TasasARS): number {
  let total = 0;
  for (const e of d.expenses.filter((x) => !x.deletedAt)) {
    total += e.amountBase ?? convertir(e.amount, e.currency, "ARS", tasas);
  }
  return total;
}

export function presupuestoTotal(d: AppData): number {
  return d.categories
    .filter((c) => !c.deletedAt)
    .reduce((s, c) => s + c.plannedAmount, 0);
}

/* ── Presupuesto por período (día/semana/mes) ── */

/** Suma de asignaciones de presupuesto (en ARS) para un período */
export function presupuestoDePeriodo(
  d: AppData, scope: BudgetScope, periodKey: string, tasas: TasasARS,
): number {
  return d.budgets
    .filter((b) => b.scope === scope && b.periodKey === periodKey)
    .reduce((s, b) => s + convertir(b.amount, b.currency, "ARS", tasas), 0);
}

/** Suma de gastos (en ARS) que caen en un período según scope */
export function gastosDePeriodo(
  d: AppData, scope: BudgetScope, periodKey: string, tasas: TasasARS,
): number {
  return d.expenses
    .filter((e) => !e.deletedAt && periodKeyDe(scope, e.spentOn) === periodKey)
    .reduce((s, e) => s + (e.amountBase ?? convertir(e.amount, e.currency, "ARS", tasas)), 0);
}

/** Gastos individuales de un período */
export function gastosListaPeriodo(d: AppData, scope: BudgetScope, periodKey: string) {
  return d.expenses
    .filter((e) => !e.deletedAt && periodKeyDe(scope, e.spentOn) === periodKey)
    .sort((a, b) => b.spentOn.localeCompare(a.spentOn));
}

/* ── Alertas al abrir ── */
export interface Alerta {
  id: string;
  tipo: "recordatorio" | "vencido" | "critico" | "pago" | "cotizacion";
  titulo: string;
  detalle?: string;
  grupo: ActionGroup;
}

export function alertasAlAbrir(d: AppData): Alerta[] {
  const alertas: Alerta[] = [];
  const ahora = new Date();
  const hoy = todayKey();

  // Recordatorios vencidos o de hoy, no vistos
  for (const r of d.reminders.filter((x) => !x.deletedAt && !x.isSeen)) {
    const cuando = new Date(r.remindAt);
    if (cuando <= ahora) {
      alertas.push({ id: r.id, tipo: "vencido", titulo: r.title, detalle: r.message, grupo: "task" });
    } else if (r.remindAt.slice(0, 10) === hoy) {
      alertas.push({ id: r.id, tipo: "recordatorio", titulo: r.title, detalle: r.message, grupo: "task" });
    }
  }

  // Pendientes críticos no hechos
  for (const a of accionesVivas(d)) {
    if (a.group === "task" && a.priority === "critical" && a.status !== "done" && a.status !== "cancelled") {
      alertas.push({ id: a.id, tipo: "critico", titulo: a.title, detalle: `Vence ${a.actionDate}`, grupo: "task" });
    }
    if (a.group === "home" && a.priority === "high" && a.status !== "done") {
      alertas.push({ id: a.id, tipo: "pago", titulo: a.title, detalle: String(a.metadata?.responsable ?? ""), grupo: "home" });
    }
  }

  // Cotizaciones vencidas (>48h)
  const masReciente = [...d.rates].sort((a, b) => +new Date(b.validAt) - +new Date(a.validAt))[0];
  if (masReciente) {
    const horas = (ahora.getTime() - new Date(masReciente.validAt).getTime()) / 36e5;
    if (horas > 48) {
      alertas.push({
        id: "cot-vieja",
        tipo: "cotizacion",
        titulo: "Cotizaciones desactualizadas",
        detalle: `Última actualización hace ${Math.round(horas / 24)} días`,
        grupo: "finance",
      });
    }
  }
  return alertas;
}

export type { Currency };
