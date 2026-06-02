"use client";
import { useMemo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { dotsDeDia, destinoDeFecha, colorDestino } from "@/lib/selectors";
import {
  gridMes, semanaDe, fromKey, toKey, fmtMes, diaDelMes, todayKey, NOMBRES_DIA,
} from "@/lib/dates";
import { GRUPO_META, type ActionGroup } from "@/lib/types";
import { Flecha } from "@/components/icons";
import { addMonths } from "date-fns";

const GRUPOS_FILTRO: ActionGroup[] = ["agenda", "finance", "habit", "task", "home"];

export function CollapsibleCalendar() {
  const { data } = useStore();
  const { selectedDay, setSelectedDay, calendarOpen, toggleCalendar } = useUI();
  const router = useRouter();
  const pathname = usePathname();

  const [cursor, setCursor] = useState<Date>(() => fromKey(selectedDay));
  const [filtros, setFiltros] = useState<Set<ActionGroup>>(new Set(GRUPOS_FILTRO));

  const semanas = useMemo(() => gridMes(cursor), [cursor]);
  const semana = useMemo(() => semanaDe(selectedDay), [selectedDay]);
  const hoy = todayKey();
  const mesActual = cursor.getMonth();

  function elegirDia(key: string) {
    setSelectedDay(key);
    if (pathname !== "/agenda") router.push("/agenda");
  }

  function toggleFiltro(g: ActionGroup) {
    setFiltros((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next;
    });
  }

  const destSel = destinoDeFecha(data, selectedDay);

  return (
    <section
      className="carta borde-metal mx-auto max-w-5xl overflow-hidden rounded-2xl"
      aria-label="Calendario del viaje"
    >
      {/* Encabezado */}
      <div className="flex items-center gap-2 px-4 py-3">
        {calendarOpen ? (
          <>
            <button
              type="button"
              onClick={() => setCursor((c) => addMonths(c, -1))}
              className="grid h-8 w-8 place-items-center rounded-lg text-laton hover:bg-[var(--tinta-3)]"
              aria-label="Mes anterior"
            >
              <Flecha className="rotate-180" width={16} height={16} />
            </button>
            <h2 className="min-w-[8.5rem] text-center font-display text-sm font-semibold capitalize tracking-wide text-marfil">
              {fmtMes(cursor)}
            </h2>
            <button
              type="button"
              onClick={() => setCursor((c) => addMonths(c, 1))}
              className="grid h-8 w-8 place-items-center rounded-lg text-laton hover:bg-[var(--tinta-3)]"
              aria-label="Mes siguiente"
            >
              <Flecha width={16} height={16} />
            </button>
          </>
        ) : (
          <h2 className="font-display text-sm font-semibold tracking-wide text-marfil">
            Semana actual
          </h2>
        )}

        <button
          type="button"
          onClick={toggleCalendar}
          aria-pressed={calendarOpen}
          className="ml-auto rounded-lg px-3 py-1.5 text-xs text-gris-azul hover:bg-[var(--tinta-3)] hover:text-marfil"
        >
          {calendarOpen ? "Colapsar ▴" : "Expandir ▾"}
        </button>
      </div>

      {/* Filtros por grupo */}
      <div className="flex flex-wrap gap-1.5 px-4 pb-3" role="group" aria-label="Filtrar por grupo">
        {GRUPOS_FILTRO.map((g) => {
          const on = filtros.has(g);
          const meta = GRUPO_META[g];
          return (
            <button
              key={g}
              type="button"
              onClick={() => toggleFiltro(g)}
              aria-pressed={on}
              className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[0.7rem] transition-colors"
              style={{
                borderColor: on ? meta.color : "var(--hairline-soft)",
                color: on ? meta.color : "var(--gris-azul-dim)",
                background: on ? `color-mix(in srgb, ${meta.color} 12%, transparent)` : "transparent",
              }}
            >
              <span className="h-2 w-2 rounded-full" style={{ background: meta.color, opacity: on ? 1 : 0.4 }} />
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Encabezados de día */}
      <div className="grid grid-cols-7 px-3 pb-1">
        {NOMBRES_DIA.map((n) => (
          <div key={n} className="text-center text-[0.65rem] font-medium uppercase tracking-wide text-gris-azul-dim">
            {n}
          </div>
        ))}
      </div>

      {/* Grilla */}
      <div className="px-3 pb-4" role="grid" aria-label="Días">
        {(calendarOpen ? semanas : [semana]).map((sem, i) => (
          <div key={i} className="grid grid-cols-7 gap-1" role="row">
            {sem.map((key) => {
              const dest = destinoDeFecha(data, key);
              return (
                <DiaCelda
                  key={key}
                  dayKey={key}
                  seleccionado={key === selectedDay}
                  esHoy={key === hoy}
                  fueraDeMes={calendarOpen && fromKey(key).getMonth() !== mesActual}
                  dots={dotsDeDia(data, key)}
                  filtros={filtros}
                  enViaje={!!dest}
                  destColor={dest ? colorDestino(data, dest.id) : undefined}
                  onClick={() => elegirDia(key)}
                />
              );
            })}
          </div>
        ))}
      </div>

      {/* Pie: destino del día seleccionado */}
      {destSel && (
        <div className="border-t border-[var(--hairline-soft)] bg-[var(--tinta)] px-4 py-2 text-xs text-gris-azul">
          {destSel.name} · {destSel.currency} ·{" "}
          {destSel.timezone.split("/").pop()?.replace("_", " ")}
        </div>
      )}
    </section>
  );
}

function DiaCelda({
  dayKey, seleccionado, esHoy, fueraDeMes, dots, filtros, enViaje, destColor, onClick,
}: {
  dayKey: string;
  seleccionado: boolean;
  esHoy: boolean;
  fueraDeMes: boolean;
  dots: Record<ActionGroup, number>;
  filtros: Set<ActionGroup>;
  enViaje: boolean;
  destColor?: string;
  onClick: () => void;
}) {
  const gruposConDots = (Object.keys(dots) as ActionGroup[]).filter(
    (g) => g !== "destination" && dots[g] > 0 && filtros.has(g),
  );

  return (
    <button
      type="button"
      role="gridcell"
      onClick={onClick}
      aria-current={esHoy ? "date" : undefined}
      aria-label={`${diaDelMes(dayKey)}${esHoy ? ", hoy" : ""}${
        gruposConDots.length ? `, ${gruposConDots.length} grupos con actividad` : ""
      }`}
      className={`relative flex aspect-square min-h-[44px] flex-col items-center justify-center rounded-xl text-sm transition-colors ${
        seleccionado
          ? "bg-[var(--laton)] font-bold text-noche"
          : esHoy
            ? "border border-[var(--laton)] text-laton-claro"
            : enViaje
              ? "text-marfil hover:bg-[var(--tinta-3)]"
              : "text-gris-azul-dim hover:bg-[var(--tinta-3)]"
      } ${fueraDeMes ? "opacity-35" : ""}`}
      style={!seleccionado && destColor ? { boxShadow: `inset 0 -2px 0 ${destColor}` } : undefined}
    >
      <span>{diaDelMes(dayKey)}</span>
      {gruposConDots.length > 0 && (
        <span className="absolute bottom-1.5 flex gap-0.5">
          {gruposConDots.slice(0, 5).map((g) => (
            <span
              key={g}
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: seleccionado ? "var(--noche)" : GRUPO_META[g].color }}
            />
          ))}
        </span>
      )}
    </button>
  );
}
