"use client";
import { useMemo } from "react";
import type { TripAction } from "@/lib/types";
import { semanaKey, etiquetaSemana, mesKey, etiquetaMes, todayKey } from "@/lib/dates";

/**
 * Agrupa acciones por semana (y por mes). La semana actual va abierta;
 * las semanas pasadas quedan colapsadas como "Semana del X al Y".
 */
export function WeeklyGroups({
  items,
  renderItem,
}: {
  items: TripAction[];
  renderItem: (a: TripAction) => React.ReactNode;
}) {
  const hoySemana = semanaKey(todayKey());

  const grupos = useMemo(() => {
    const map = new Map<string, TripAction[]>();
    for (const a of items) {
      const k = semanaKey(a.actionDate);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(a);
    }
    // orden: semana actual y futuras primero (asc futuro), luego pasadas (desc)
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [items]);

  if (items.length === 0) {
    return (
      <div className="carta rounded-2xl px-6 py-12 text-center">
        <p className="font-serif text-base italic text-gris-azul">Nada por aquí todavía. ✦</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {grupos.map(([wk, lista]) => {
        const esActual = wk === hoySemana;
        const ref = lista[0].actionDate;
        const titulo = `Semana del ${etiquetaSemana(ref)}`;
        const mes = etiquetaMes(mesKey(ref));
        return (
          <details key={wk} open={esActual} className="carta overflow-hidden rounded-2xl">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 [&::-webkit-details-marker]:hidden">
              <span className="font-display text-sm font-semibold tracking-wide text-marfil capitalize">
                {titulo}
              </span>
              {esActual && (
                <span className="rounded-full bg-[var(--laton-tenue)] px-2 py-0.5 text-[0.6rem] font-semibold text-laton-claro">
                  actual
                </span>
              )}
              <span className="ml-auto text-xs text-gris-azul-dim capitalize">{mes} · {lista.length}</span>
            </summary>
            <ul className="flex flex-col gap-2.5 border-t border-[var(--hairline-soft)] p-3">
              {lista
                .sort((a, b) => a.actionDate.localeCompare(b.actionDate))
                .map((a) => (
                  <li key={a.id}>{renderItem(a)}</li>
                ))}
            </ul>
          </details>
        );
      })}
    </div>
  );
}
