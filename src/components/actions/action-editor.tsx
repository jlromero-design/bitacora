"use client";
import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Sheet, Campo, Boton, inputClase } from "@/components/ui";
import type { TripAction, ActionGroup, ActionStatus, Priority, Currency } from "@/lib/types";

const GRUPOS: { value: ActionGroup; label: string }[] = [
  { value: "agenda", label: "Agenda" },
  { value: "finance", label: "Finanzas / Gasto" },
  { value: "task", label: "Pendiente" },
  { value: "home", label: "En casa" },
];

const KINDS_AGENDA = [
  "turismo", "academico", "logistica", "vuelo", "estadia", "tour",
  "visita", "curso", "charla", "evento", "comida", "ocio", "salud",
];
const ESTADOS: ActionStatus[] = ["planned", "confirmed", "in_progress", "done", "cancelled"];
const PRIORIDADES: Priority[] = ["low", "medium", "high", "critical"];
const MONEDAS: Currency[] = ["ARS", "USD", "EUR", "GBP"];

export function ActionEditor({
  open,
  onClose,
  fecha,
  editar,
  grupoInicial = "agenda",
  destinoInicial,
  kindInicial,
}: {
  open: boolean;
  onClose: () => void;
  fecha: string;
  editar?: TripAction | null;
  grupoInicial?: ActionGroup;
  destinoInicial?: string;
  kindInicial?: string;
}) {
  const { addAction, updateAction, softDeleteAction, data } = useStore();
  const [confirmarEliminar, setConfirmarEliminar] = useState(false);
  const [form, setForm] = useState(() => inicial(fecha, grupoInicial, editar, destinoInicial, kindInicial));

  useEffect(() => {
    if (open) { setForm(inicial(fecha, grupoInicial, editar, destinoInicial, kindInicial)); setConfirmarEliminar(false); }
  }, [open, fecha, grupoInicial, editar, destinoInicial, kindInicial]);

  const esVuelo = form.group === "agenda" && form.kind === "vuelo";

  function guardar() {
    if (!form.title.trim()) return;
    const metadata: Record<string, unknown> = {};
    if (esVuelo) {
      if (form.flightNumber.trim()) metadata.flightNumber = form.flightNumber.trim();
      if (form.checkInTime) metadata.checkInTime = form.checkInTime;
      if (form.airportFrom.trim()) metadata.airportFrom = form.airportFrom.trim();
      if (form.airportTo.trim()) metadata.airportTo = form.airportTo.trim();
      if (form.arrivalDate) metadata.arrivalDate = form.arrivalDate;
    }
    const payload = {
      group: form.group,
      kind: form.group === "agenda" ? form.kind : undefined,
      destinationId: form.destinationId || null,
      title: form.title.trim(),
      description: form.description,
      actionDate: form.actionDate,
      startsAt: form.startsAt || null,
      endsAt: form.endsAt || null,
      status: form.status,
      priority: form.priority,
      amount: form.amount ? Number(form.amount) : null,
      currency: form.amount ? form.currency : null,
      metadata,
    };
    if (editar) updateAction(editar.id, payload);
    else addAction(payload);
    onClose();
  }

  return (
    <Sheet open={open} onClose={onClose} titulo={editar ? "Editar actividad" : "Nueva actividad"}>
      <Campo label="Grupo" htmlFor="ed-grupo">
        <select
          id="ed-grupo"
          className={inputClase}
          value={form.group}
          onChange={(e) => setForm({ ...form, group: e.target.value as ActionGroup })}
        >
          {GRUPOS.map((g) => (
            <option key={g.value} value={g.value}>{g.label}</option>
          ))}
        </select>
      </Campo>

      {form.group === "agenda" && (
        <Campo label="Tipo" htmlFor="ed-kind">
          <select
            id="ed-kind"
            className={inputClase}
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value })}
          >
            {KINDS_AGENDA.map((k) => (
              <option key={k} value={k}>{k[0].toUpperCase() + k.slice(1)}</option>
            ))}
          </select>
        </Campo>
      )}

      {esVuelo && (
        <div className="mb-1 rounded-xl border border-[var(--hairline)] bg-[var(--tinta)] p-3">
          <p className="mb-2 flex items-center gap-2 font-display text-[0.65rem] uppercase tracking-[0.12em] text-laton-claro">
            ✈ Datos del vuelo
          </p>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="N° de vuelo" htmlFor="ed-flight">
              <input id="ed-flight" className={inputClase} value={form.flightNumber}
                onChange={(e) => setForm({ ...form, flightNumber: e.target.value })} placeholder="Ej: AR1100" />
            </Campo>
            <Campo label="Hora de check-in" htmlFor="ed-checkin">
              <input id="ed-checkin" type="time" className={inputClase} value={form.checkInTime}
                onChange={(e) => setForm({ ...form, checkInTime: e.target.value })} />
            </Campo>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Aeropuerto salida (opcional)" htmlFor="ed-from">
              <input id="ed-from" className={inputClase} value={form.airportFrom}
                onChange={(e) => setForm({ ...form, airportFrom: e.target.value })} placeholder="Ej: EZE — Ezeiza" />
            </Campo>
            <Campo label="Aeropuerto llegada (opcional)" htmlFor="ed-to">
              <input id="ed-to" className={inputClase} value={form.airportTo}
                onChange={(e) => setForm({ ...form, airportTo: e.target.value })} placeholder="Ej: LHR — Heathrow" />
            </Campo>
          </div>
          <Campo label="Fecha de llegada (si es otro día)" htmlFor="ed-arr">
            <input id="ed-arr" type="date" className={inputClase} value={form.arrivalDate}
              onChange={(e) => setForm({ ...form, arrivalDate: e.target.value })} />
          </Campo>
          <p className="text-[0.7rem] text-gris-azul-dim">
            «Desde / Hasta» (abajo) son las horas de despegue y aterrizaje.
          </p>
        </div>
      )}

      <Campo label="Título" htmlFor="ed-title">
        <input
          id="ed-title"
          className={inputClase}
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder={esVuelo ? "Ej: Vuelo BUE → LHR" : "¿Qué vas a hacer?"}
        />
      </Campo>

      <Campo label="Destino (opcional)" htmlFor="ed-dest">
        <select
          id="ed-dest"
          className={inputClase}
          value={form.destinationId}
          onChange={(e) => setForm({ ...form, destinationId: e.target.value })}
        >
          <option value="">— Sin destino —</option>
          {data.destinations.filter((d) => !d.deletedAt).map((d) => (
            <option key={d.id} value={d.id}>{d.name}</option>
          ))}
        </select>
      </Campo>

      {!esVuelo && (
        <Campo label="Descripción" htmlFor="ed-desc">
          <textarea
            id="ed-desc"
            className={`${inputClase} min-h-[72px] resize-y`}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Detalles, dirección, notas…"
          />
        </Campo>
      )}

      <div className="grid grid-cols-3 gap-3">
        <Campo label={esVuelo ? "Fecha de salida" : "Fecha"} htmlFor="ed-fecha">
          <input id="ed-fecha" type="date" className={inputClase} value={form.actionDate}
            onChange={(e) => setForm({ ...form, actionDate: e.target.value })} />
        </Campo>
        <Campo label={esVuelo ? "Despegue" : "Desde"} htmlFor="ed-desde">
          <input id="ed-desde" type="time" className={inputClase} value={form.startsAt}
            onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
        </Campo>
        <Campo label={esVuelo ? "Aterrizaje" : "Hasta"} htmlFor="ed-hasta">
          <input id="ed-hasta" type="time" className={inputClase} value={form.endsAt}
            onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
        </Campo>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Estado" htmlFor="ed-estado">
          <select id="ed-estado" className={inputClase} value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value as ActionStatus })}>
            {ESTADOS.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Campo>
        <Campo label="Prioridad" htmlFor="ed-prio">
          <select id="ed-prio" className={inputClase} value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as Priority })}>
            {PRIORIDADES.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
        </Campo>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Campo label={esVuelo ? "Precio del vuelo" : "Monto (opcional)"} htmlFor="ed-monto">
          <input id="ed-monto" type="number" inputMode="decimal" className={inputClase} value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })} placeholder="0" />
        </Campo>
        <Campo label="Moneda" htmlFor="ed-moneda">
          <select id="ed-moneda" className={inputClase} value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value as Currency })}>
            {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Campo>
      </div>

      {/* Confirmar eliminación */}
      {confirmarEliminar && editar && (
        <div className="rounded-xl border border-[var(--peligro,#e05252)] bg-[color-mix(in_srgb,var(--peligro,#e05252)_10%,transparent)] p-3">
          <p className="mb-3 text-sm text-marfil">¿Eliminar esta actividad? Esta acción no se puede deshacer.</p>
          <div className="flex gap-2">
            <Boton variante="fantasma" onClick={() => setConfirmarEliminar(false)}>Cancelar</Boton>
            <Boton variante="peligro" onClick={() => { softDeleteAction(editar.id); onClose(); }}>
              Sí, eliminar
            </Boton>
          </div>
        </div>
      )}

      <div className="mt-2 flex items-center gap-2">
        {editar && !confirmarEliminar && (
          <Boton variante="peligro-fantasma" onClick={() => setConfirmarEliminar(true)}>
            Eliminar
          </Boton>
        )}
        <div className="ml-auto flex gap-2">
          <Boton variante="fantasma" onClick={onClose}>Cancelar</Boton>
          <Boton variante="oro" onClick={guardar}>{editar ? "Guardar" : "Crear"}</Boton>
        </div>
      </div>
    </Sheet>
  );
}

function inicial(fecha: string, grupo: ActionGroup, editar?: TripAction | null, destinoInicial?: string, kindInicial?: string) {
  return {
    group: editar?.group ?? grupo,
    kind: editar?.kind ?? kindInicial ?? "turismo",
    title: editar?.title ?? "",
    description: editar?.description ?? "",
    actionDate: editar?.actionDate ?? fecha,
    startsAt: editar?.startsAt ?? "",
    endsAt: editar?.endsAt ?? "",
    status: editar?.status ?? ("planned" as ActionStatus),
    priority: editar?.priority ?? ("medium" as Priority),
    amount: editar?.amount != null ? String(editar.amount) : "",
    currency: (editar?.currency ?? "GBP") as Currency,
    destinationId: editar?.destinationId ?? destinoInicial ?? "",
    // Datos de vuelo (metadata)
    flightNumber: (editar?.metadata?.flightNumber as string) ?? "",
    checkInTime: (editar?.metadata?.checkInTime as string) ?? "",
    airportFrom: (editar?.metadata?.airportFrom as string) ?? "",
    airportTo: (editar?.metadata?.airportTo as string) ?? "",
    arrivalDate: (editar?.metadata?.arrivalDate as string) ?? "",
  };
}
