/* ════════════════════════════════════════════════════════════
   Utilidades de fecha — es-AR, sin corrimiento por UTC.
   Trabajamos con strings "yyyy-MM-dd" como clave de día para
   evitar el bug clásico de parsear fechas como UTC.
   ════════════════════════════════════════════════════════════ */
import {
  addDays,
  differenceInCalendarDays,
  format,
  parse,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  isWithinInterval,
  getISOWeek,
  getISOWeekYear,
} from "date-fns";
import { es } from "date-fns/locale";

/** Convierte "yyyy-MM-dd" a Date local (mediodía para evitar DST/UTC shift) */
export function fromKey(key: string): Date {
  return parse(key + " 12:00", "yyyy-MM-dd HH:mm", new Date());
}

/** Date local → "yyyy-MM-dd" */
export function toKey(d: Date): string {
  return format(d, "yyyy-MM-dd");
}

/** Hoy como key local */
export function todayKey(): string {
  return toKey(new Date());
}

export function fmtLargo(key: string): string {
  return format(fromKey(key), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es });
}

export function fmtCorto(key: string): string {
  return format(fromKey(key), "d MMM", { locale: es });
}

export function fmtMes(d: Date): string {
  return format(d, "MMMM yyyy", { locale: es });
}

export function fmtDiaSemana(key: string): string {
  return format(fromKey(key), "EEE", { locale: es });
}

export function diaDelMes(key: string): number {
  return fromKey(key).getDate();
}

export function sumarDias(key: string, n: number): string {
  return toKey(addDays(fromKey(key), n));
}

export function diasEntre(aKey: string, bKey: string): number {
  return differenceInCalendarDays(fromKey(bKey), fromKey(aKey));
}

/** ¿Está la fecha dentro del intervalo [desde, hasta] inclusive? */
export function dentroDe(key: string, desdeKey: string, hastaKey: string): boolean {
  return isWithinInterval(fromKey(key), {
    start: fromKey(desdeKey),
    end: fromKey(hastaKey),
  });
}

/** Matriz de semanas (lunes-domingo) que cubren el mes de `cursor` */
export function gridMes(cursor: Date): string[][] {
  const ini = startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 });
  const fin = endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 });
  const dias: string[] = [];
  let d = ini;
  while (d <= fin) {
    dias.push(toKey(d));
    d = addDays(d, 1);
  }
  const semanas: string[][] = [];
  for (let i = 0; i < dias.length; i += 7) semanas.push(dias.slice(i, i + 7));
  return semanas;
}

/** Tira de 7 días centrada en la semana de `key` (lun-dom) */
export function semanaDe(key: string): string[] {
  const ini = startOfWeek(fromKey(key), { weekStartsOn: 1 });
  return Array.from({ length: 7 }, (_, i) => toKey(addDays(ini, i)));
}

export const NOMBRES_DIA = ["lun", "mar", "mié", "jue", "vie", "sáb", "dom"];

/* ── Claves de período (presupuesto, agrupaciones) ── */

/** Clave de día desde un Date o key (passthrough) */
export function diaKey(key: string): string {
  return key;
}

/** Clave de semana ISO: "yyyy-Www" (ej 2026-W24) */
export function semanaKey(key: string): string {
  const d = fromKey(key);
  const w = String(getISOWeek(d)).padStart(2, "0");
  return `${getISOWeekYear(d)}-W${w}`;
}

/** Clave de mes: "yyyy-MM" */
export function mesKey(key: string): string {
  return key.slice(0, 7);
}

/** Etiqueta legible de la semana que contiene `key`: "9 – 15 jun" */
export function etiquetaSemana(key: string): string {
  const ini = startOfWeek(fromKey(key), { weekStartsOn: 1 });
  const fin = addDays(ini, 6);
  return `${format(ini, "d", { locale: es })} – ${format(fin, "d MMM", { locale: es })}`;
}

/** Etiqueta legible de mes desde monthKey "yyyy-MM": "Junio 2026" */
export function etiquetaMes(monthKey: string): string {
  return format(fromKey(`${monthKey}-01`), "MMMM yyyy", { locale: es });
}

/** periodKey según scope para una fecha dada */
export function periodKeyDe(scope: "day" | "week" | "month", key: string): string {
  return scope === "day" ? key : scope === "week" ? semanaKey(key) : mesKey(key);
}

/* ── Reloj por zona horaria ── */

/** Zona horaria del dispositivo (refleja la ubicación del usuario) */
export function zonaDispositivo(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  } catch {
    return "UTC";
  }
}

/** Hora "HH:mm" actual en una zona dada */
export function horaEnZona(tz: string, fecha = new Date()): string {
  try {
    return new Intl.DateTimeFormat("es-AR", {
      timeZone: tz,
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }).format(fecha);
  } catch {
    return "--:--";
  }
}

/** Diferencia horaria (en horas, con signo) de `tz` respecto a la zona local */
export function offsetHoras(tz: string, fecha = new Date()): number {
  try {
    const local = new Date(fecha.toLocaleString("en-US", { timeZone: zonaDispositivo() }));
    const otra = new Date(fecha.toLocaleString("en-US", { timeZone: tz }));
    return Math.round((otra.getTime() - local.getTime()) / 36e5);
  } catch {
    return 0;
  }
}

/** Etiqueta corta a partir de una zona, ej "Europe/London" → "London" */
export function etiquetaZona(tz: string): string {
  return tz.split("/").pop()?.replace(/_/g, " ") ?? tz;
}
