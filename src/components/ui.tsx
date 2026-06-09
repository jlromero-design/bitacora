"use client";
/* Primitivas de UI reutilizables — sobrias, accesibles. */
import { useEffect } from "react";
import { GRUPO_META, ESTADO_LABEL, PRIORIDAD_LABEL } from "@/lib/types";
import type { ActionGroup, ActionStatus, Priority } from "@/lib/types";
import { Cerrar } from "./icons";

/* Título de sección con regla ornamental */
export function SeccionTitulo({ children }: { children: React.ReactNode }) {
  return (
    <div className="regla-ornamento my-1">
      <span className="font-display text-[0.7rem] uppercase tracking-[0.2em] text-laton">
        ✦ {children} ✦
      </span>
    </div>
  );
}

/* Encabezado de página */
export function PageHeader({
  titulo,
  sub,
  accion,
}: {
  titulo: string;
  sub?: string;
  accion?: React.ReactNode;
}) {
  return (
    <div className="mx-auto flex max-w-5xl items-end justify-between gap-4 px-1">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-wide text-marfil">
          {titulo}
        </h1>
        {sub && <p className="mt-0.5 font-serif text-sm italic text-gris-azul">{sub}</p>}
      </div>
      {accion}
    </div>
  );
}

export function Boton({
  variante = "fantasma",
  className = "",
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variante?: "primario" | "oro" | "fantasma" | "peligro" | "peligro-fantasma";
}) {
  const estilos = {
    primario: "btn-acero",
    oro: "btn-oro font-semibold",
    fantasma: "btn-ghost-metal",
    peligro: "bg-[var(--peligro,#e05252)] text-white hover:opacity-90",
    "peligro-fantasma": "border border-[var(--peligro,#e05252)] text-[var(--peligro,#e05252)] hover:bg-[color-mix(in_srgb,var(--peligro,#e05252)_12%,transparent)]",
  }[variante];
  return (
    <button
      className={`inline-flex min-h-[44px] items-center gap-2 rounded-xl px-4 py-2 text-sm transition-colors ${estilos} ${className}`}
      {...props}
    />
  );
}

export function GrupoBadge({ group, kind }: { group: ActionGroup; kind?: string }) {
  const meta = GRUPO_META[group];
  const label = kind ? capitalizar(kind) : meta.label;
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[0.65rem] font-semibold uppercase tracking-wide"
      style={{
        color: meta.color,
        background: `color-mix(in srgb, ${meta.color} 14%, transparent)`,
      }}
    >
      {label}
    </span>
  );
}

const ESTADO_COLOR: Record<ActionStatus, string> = {
  planned: "var(--gris-azul)",
  confirmed: "var(--casa)",
  in_progress: "var(--pendientes)",
  done: "var(--habitos)",
  cancelled: "var(--peligro)",
  archived: "var(--gris-azul-dim)",
};

export function EstadoBadge({ status }: { status: ActionStatus }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[0.65rem] font-medium"
      style={{
        color: ESTADO_COLOR[status],
        background: `color-mix(in srgb, ${ESTADO_COLOR[status]} 14%, transparent)`,
      }}
    >
      {ESTADO_LABEL[status]}
    </span>
  );
}

const PRIORIDAD_COLOR: Record<Priority, string> = {
  low: "var(--habitos)",
  medium: "var(--casa)",
  high: "var(--pendientes)",
  critical: "var(--peligro)",
};

export function PrioridadBadge({ priority }: { priority: Priority }) {
  return (
    <span
      className="rounded-full px-2 py-0.5 text-[0.65rem] font-semibold"
      style={{
        color: PRIORIDAD_COLOR[priority],
        background: `color-mix(in srgb, ${PRIORIDAD_COLOR[priority]} 14%, transparent)`,
      }}
    >
      {PRIORIDAD_LABEL[priority]}
    </span>
  );
}

/* Panel lateral (sheet) accesible para formularios */
export function Sheet({
  open,
  onClose,
  titulo,
  children,
}: {
  open: boolean;
  onClose: () => void;
  titulo: string;
  children: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={`glass-strong fixed bottom-0 left-1/2 z-[71] flex max-h-[90vh] w-[min(94vw,520px)] -translate-x-1/2 flex-col rounded-t-2xl border border-[var(--hairline)] transition-transform duration-300 sm:bottom-auto sm:top-1/2 sm:-translate-y-1/2 ${
          open ? "translate-y-0 sm:-translate-y-1/2" : "translate-y-full sm:translate-y-[120%]"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
        aria-hidden={!open}
      >
        <div className="flex items-center justify-between border-b border-[var(--hairline-soft)] px-5 py-4">
          <h2 className="font-display text-base font-semibold tracking-wide text-marfil">
            {titulo}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-xl text-gris-azul hover:bg-[var(--tinta-3)] hover:text-marfil"
            aria-label="Cerrar"
          >
            <Cerrar />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
      </div>
    </>
  );
}

/* Campo de formulario con label real (accesibilidad) */
export function Campo({
  label,
  children,
  htmlFor,
}: {
  label: string;
  children: React.ReactNode;
  htmlFor?: string;
}) {
  return (
    <label className="mb-3 block" htmlFor={htmlFor}>
      <span className="mb-1 block font-display text-[0.65rem] uppercase tracking-[0.12em] text-gris-azul">
        {label}
      </span>
      {children}
    </label>
  );
}

export const inputClase =
  "w-full rounded-xl border-2 border-[var(--hairline-soft)] bg-[var(--tinta)] px-3 py-2.5 text-marfil outline-none transition-colors focus:border-[var(--laton)] placeholder:text-gris-azul-dim";

function capitalizar(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
