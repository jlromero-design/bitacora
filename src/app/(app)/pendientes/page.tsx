"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { accionesVivas } from "@/lib/selectors";
import { fmtCorto } from "@/lib/dates";
import type { TripAction } from "@/lib/types";
import { PageHeader, Boton, PrioridadBadge, EstadoBadge } from "@/components/ui";
import { ActionEditor } from "@/components/actions/action-editor";
import { WeeklyGroups } from "@/components/actions/weekly-groups";
import { Mas, Lapiz, Papelera, Tilde } from "@/components/icons";

export default function PendientesPage() {
  const { data, ready, softDeleteAction, setStatus } = useStore();
  const [editor, setEditor] = useState<{ open: boolean; editar: TripAction | null }>({ open: false, editar: null });

  if (!ready) return null;

  const items = accionesVivas(data).filter((a) => a.group === "task");

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <PageHeader
        titulo="Pendientes"
        sub="Trámites y encargos, semana por semana"
        accion={<Boton variante="oro" onClick={() => setEditor({ open: true, editar: null })}><Mas width={16} height={16} /> Agregar</Boton>}
      />

      <WeeklyGroups
        items={items}
        renderItem={(a) => {
          const hecho = a.status === "done";
          return (
            <div className="group flex items-start gap-3 rounded-xl border border-[var(--hairline-soft)] bg-[var(--tinta)] p-3">
              <button type="button" onClick={() => setStatus(a.id, hecho ? "planned" : "done")}
                aria-pressed={hecho} aria-label={hecho ? "Marcar pendiente" : "Marcar hecho"}
                className={`mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-md border-2 ${
                  hecho ? "check-metal border-transparent text-noche" : "border-[var(--hairline)] text-transparent hover:border-laton"
                }`}>
                <Tilde width={14} height={14} />
              </button>
              <div className="min-w-0 flex-1">
                <p className={`font-serif text-base text-marfil ${hecho ? "line-through opacity-60" : ""}`}>{a.title}</p>
                {a.description && <p className="mt-0.5 text-sm text-gris-azul">{a.description}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <PrioridadBadge priority={a.priority} />
                  <EstadoBadge status={a.status} />
                  <span className="text-xs text-gris-azul-dim">Vence {fmtCorto(a.actionDate)}</span>
                </div>
              </div>
              <div className="flex flex-shrink-0 gap-1 opacity-60 group-hover:opacity-100">
                <button type="button" onClick={() => setEditor({ open: true, editar: a })} aria-label={`Editar ${a.title}`}
                  className="grid h-9 w-9 place-items-center rounded-lg text-gris-azul hover:bg-[var(--tinta-3)] hover:text-marfil"><Lapiz width={16} height={16} /></button>
                <button type="button" onClick={() => softDeleteAction(a.id)} aria-label={`Borrar ${a.title}`}
                  className="grid h-9 w-9 place-items-center rounded-lg text-gris-azul hover:bg-[var(--tinta-3)] hover:text-peligro"><Papelera width={16} height={16} /></button>
              </div>
            </div>
          );
        }}
      />

      <ActionEditor open={editor.open} onClose={() => setEditor({ open: false, editar: null })}
        fecha={new Date().toISOString().slice(0, 10)} editar={editor.editar} grupoInicial="task" />
    </div>
  );
}
