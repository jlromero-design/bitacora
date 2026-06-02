"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { accionesDeDia, destinoDeFecha } from "@/lib/selectors";
import { fmtLargo, fmtCorto, sumarDias, diasEntre } from "@/lib/dates";
import { fmtMoneda } from "@/lib/fx";
import type { TripAction, Currency } from "@/lib/types";
import { PageHeader, Boton, GrupoBadge, EstadoBadge, SeccionTitulo } from "@/components/ui";
import { ActionEditor } from "@/components/actions/action-editor";
import { DailyQuote, BirthdayBanner } from "@/components/agenda/daily-extras";
import { Flecha, Mas, Lapiz, Papelera, Reloj, Pin } from "@/components/icons";
import Link from "next/link";
import { etiquetaZona } from "@/lib/dates";

export default function AgendaPage() {
  const { data, ready, softDeleteAction, setStatus, upsertNote } = useStore();
  const { selectedDay, setSelectedDay } = useUI();
  const [editor, setEditor] = useState<{ open: boolean; editar: TripAction | null }>({
    open: false,
    editar: null,
  });

  if (!ready) return <Cargando />;

  const items = accionesDeDia(data, selectedDay);
  const dest = destinoDeFecha(data, selectedDay);
  const diaNum = diasEntre(data.trip.startsOn, selectedDay) + 1;
  const totalDias = diasEntre(data.trip.startsOn, data.trip.endsOn) + 1;
  const nota = data.notes.find((n) => n.dayKey === selectedDay) ?? null;
  // Editable solo dentro de las 24h de creada (o si todavía no existe)
  const editableNota =
    !nota || Date.now() - new Date(nota.createdAt).getTime() < 24 * 3600 * 1000;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <BirthdayBanner />
      <PageHeader
        titulo="Agenda"
        sub="Tu día, hora por hora"
        accion={
          <Boton variante="oro" onClick={() => setEditor({ open: true, editar: null })}>
            <Mas width={16} height={16} /> Agregar
          </Boton>
        }
      />

      {/* Barra del día */}
      <div className="carta borde-metal flex items-center gap-3 rounded-2xl px-4 py-3">
        <button
          type="button"
          onClick={() => setSelectedDay(sumarDias(selectedDay, -1))}
          className="grid h-10 w-10 place-items-center rounded-full border border-[var(--hairline)] text-laton hover:bg-[var(--tinta-3)]"
          aria-label="Día anterior"
        >
          <Flecha className="rotate-180" width={16} height={16} />
        </button>
        <div className="min-w-0 flex-1 text-center">
          <p className="truncate font-display text-base font-semibold capitalize tracking-wide text-marfil">
            {fmtLargo(selectedDay)}
          </p>
          <p className="mt-0.5 flex flex-wrap items-center justify-center gap-x-2 text-xs text-gris-azul">
            {dest && (
              <span className="inline-flex items-center gap-1 text-laton-claro">
                <Pin width={12} height={12} /> {dest.name} · {dest.currency}
              </span>
            )}
            {diaNum >= 1 && diaNum <= totalDias && <span>· Día {diaNum} de {totalDias}</span>}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setSelectedDay(sumarDias(selectedDay, 1))}
          className="grid h-10 w-10 place-items-center rounded-full border border-[var(--hairline)] text-laton hover:bg-[var(--tinta-3)]"
          aria-label="Día siguiente"
        >
          <Flecha width={16} height={16} />
        </button>
      </div>

      {/* Timeline */}
      {items.length === 0 ? (
        <div className="carta rounded-2xl px-6 py-12 text-center">
          <p className="font-serif text-base italic text-gris-azul">
            Todavía no hay nada anotado para este día.
          </p>
          <Boton variante="oro" className="mt-4" onClick={() => setEditor({ open: true, editar: null })}>
            <Mas width={16} height={16} /> Agregar la primera actividad
          </Boton>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5" aria-label={`Actividades del ${fmtLargo(selectedDay)}`}>
          {items.map((a) => (
            <ItemTimeline
              key={a.id}
              accion={a}
              onEditar={() => setEditor({ open: true, editar: a })}
              onBorrar={() => softDeleteAction(a.id)}
              onToggleHecho={() =>
                setStatus(a.id, a.status === "done" ? "planned" : "done")
              }
            />
          ))}
        </ul>
      )}

      {/* Nota del día */}
      <div className="mt-2">
        <SeccionTitulo>Nota del día</SeccionTitulo>
        <div className="carta rounded-2xl p-4">
          {editableNota ? (
            <>
              <label htmlFor="day-note" className="sr-only">Nota libre del día</label>
              <textarea
                id="day-note"
                className="min-h-[80px] w-full resize-y bg-transparent font-serif text-marfil outline-none placeholder:italic placeholder:text-gris-azul-dim"
                value={nota?.text ?? ""}
                onChange={(e) => upsertNote(selectedDay, e.target.value)}
                placeholder="¿Qué querés recordar de este día? Sensaciones, ideas, lo que sea…"
              />
              <p className="mt-1 text-[0.7rem] text-gris-azul-dim">
                Editable por 24 h. Después queda guardada en{" "}
                <Link href="/notas" className="text-laton-claro underline-offset-2 hover:underline">Notas</Link>.
              </p>
            </>
          ) : (
            <>
              <p className="whitespace-pre-wrap font-serif text-marfil-dim">{nota?.text}</p>
              <p className="mt-2 text-[0.7rem] text-gris-azul-dim">
                Escrita en {etiquetaZona(nota!.tz)} · archivada en{" "}
                <Link href="/notas" className="text-laton-claro underline-offset-2 hover:underline">Notas</Link>.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Frase del día */}
      <DailyQuote />

      <ActionEditor
        open={editor.open}
        onClose={() => setEditor({ open: false, editar: null })}
        fecha={selectedDay}
        editar={editor.editar}
      />
    </div>
  );
}

function ItemTimeline({
  accion,
  onEditar,
  onBorrar,
  onToggleHecho,
}: {
  accion: TripAction;
  onEditar: () => void;
  onBorrar: () => void;
  onToggleHecho: () => void;
}) {
  const hecho = accion.status === "done";
  return (
    <li className="carta group flex items-start gap-3 rounded-2xl p-4 transition-shadow hover:shadow-[var(--sombra-md)]">
      {/* Check */}
      <button
        type="button"
        onClick={onToggleHecho}
        aria-pressed={hecho}
        aria-label={hecho ? "Marcar como pendiente" : "Marcar como hecho"}
        className={`mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-md border-2 transition-colors ${
          hecho ? "border-habitos bg-habitos text-noche" : "border-[var(--hairline)] text-transparent hover:border-laton"
        }`}
      >
        ✓
      </button>

      {/* Hora */}
      <div className="w-12 flex-shrink-0 pt-0.5 text-center">
        {accion.startsAt ? (
          <span className="font-sans text-sm font-semibold text-laton-claro">{accion.startsAt}</span>
        ) : (
          <Reloj width={16} height={16} className="mx-auto text-gris-azul-dim" />
        )}
      </div>

      {/* Contenido */}
      <div className="min-w-0 flex-1">
        <p className={`font-serif text-base text-marfil ${hecho ? "line-through opacity-60" : ""}`}>
          {accion.title}
        </p>
        {accion.description && (
          <p className="mt-0.5 text-sm leading-snug text-gris-azul">{accion.description}</p>
        )}
        {accion.kind === "vuelo" && <VueloInfo accion={accion} />}
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <GrupoBadge group={accion.group} kind={accion.kind} />
          <EstadoBadge status={accion.status} />
          {accion.amount != null && (
            <span className="rounded-full bg-[var(--finanzas-bg)] px-2 py-0.5 text-[0.7rem] font-semibold text-finanzas">
              {fmtMoneda(accion.amount, (accion.currency ?? "ARS") as Currency)}
            </span>
          )}
        </div>
      </div>

      {/* Acciones */}
      <div className="flex flex-shrink-0 gap-1 opacity-60 transition-opacity group-hover:opacity-100">
        <button type="button" onClick={onEditar} aria-label={`Editar: ${accion.title}`}
          className="grid h-9 w-9 place-items-center rounded-lg text-gris-azul hover:bg-[var(--tinta-3)] hover:text-marfil">
          <Lapiz width={16} height={16} />
        </button>
        <button type="button" onClick={onBorrar} aria-label={`Borrar: ${accion.title}`}
          className="grid h-9 w-9 place-items-center rounded-lg text-gris-azul hover:bg-[var(--tinta-3)] hover:text-peligro">
          <Papelera width={16} height={16} />
        </button>
      </div>
    </li>
  );
}

function VueloInfo({ accion }: { accion: TripAction }) {
  const m = accion.metadata ?? {};
  const checkIn = m.checkInTime as string | undefined;
  const num = m.flightNumber as string | undefined;
  const from = m.airportFrom as string | undefined;
  const to = m.airportTo as string | undefined;
  const arr = m.arrivalDate as string | undefined;

  return (
    <div className="mt-2 rounded-xl border border-[var(--hairline)] bg-[var(--tinta)] px-3 py-2 text-sm">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {checkIn && (
          <span className="font-semibold text-laton-claro">
            🛄 Check-in {checkIn}
          </span>
        )}
        {num && <span className="text-marfil">✈ {num}</span>}
        {(from || to) && (
          <span className="text-gris-azul">
            {from ?? "—"} <span className="text-laton">→</span> {to ?? "—"}
          </span>
        )}
      </div>
      {(accion.startsAt || accion.endsAt || arr) && (
        <p className="mt-1 text-xs text-gris-azul-dim">
          {accion.startsAt && <>Despegue {accion.startsAt}</>}
          {accion.endsAt && <> · Aterrizaje {accion.endsAt}</>}
          {arr && <> · Llega {fmtCorto(arr)}</>}
        </p>
      )}
    </div>
  );
}

function Cargando() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16 text-center text-gris-azul">
      <p className="font-serif italic">Abriendo la bitácora…</p>
    </div>
  );
}
