"use client";
import { useMemo, useState } from "react";
import type { Note } from "@/lib/types";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { useRouter } from "next/navigation";
import { fmtLargo, etiquetaZona, toKey } from "@/lib/dates";
import { isNoteEditable, attachmentIcon } from "@/lib/note-utils";
import { PageHeader, Boton } from "@/components/ui";
import { Libro, Mas } from "@/components/icons";
import { SharePanel } from "@/components/notas/share-panel";

function genNoteId() {
  return `note-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export default function NotasPage() {
  const { data, ready, addNote } = useStore();
  const { setSelectedDay } = useUI();
  const router = useRouter();
  const [compartiendo, setCompartiendo] = useState<Note | null>(null);

  const notas = useMemo(
    () => [...(data.notes ?? [])].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [data.notes],
  );

  if (!ready) return null;

  function abrirDia(dayKey: string) {
    setSelectedDay(dayKey);
    router.push("/agenda");
  }

  function nuevaNota() {
    const hoy = toKey(new Date());
    const id = genNoteId();
    addNote(hoy, id);
    setSelectedDay(hoy);
    router.push("/agenda");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <PageHeader
        titulo="Notas"
        sub="Tu bitácora, día por día"
        accion={
          <Boton variante="oro" onClick={nuevaNota}>
            <Mas width={16} height={16} /> Nueva nota
          </Boton>
        }
      />

      {notas.length === 0 ? (
        <div className="carta rounded-2xl px-6 py-12 text-center">
          <p className="font-serif text-base italic text-gris-azul">
            Todavía no escribiste ninguna nota. Empezá desde la Agenda. ✦
          </p>
        </div>
      ) : (
        <ol className="relative ml-3 flex flex-col gap-4 border-l border-[var(--hairline-soft)] pl-5">
          {notas.map((n) => {
            const editable = isNoteEditable(n);
            const contacts = n.contacts ?? [];
            const attachments = n.attachments ?? [];

            const tieneContenido = !!(n.text.trim() || contacts.length > 0 || attachments.length > 0);
            return (
              <li key={n.id} className="relative">
                <span className="absolute -left-[27px] top-1.5 grid h-5 w-5 place-items-center rounded-full border border-[var(--hairline)] bg-[var(--tinta)] text-laton">
                  <Libro width={11} height={11} />
                </span>
                <div className="carta rounded-2xl">
                  {/* Área principal — abre la agenda */}
                  <button
                    type="button"
                    onClick={() => abrirDia(n.dayKey)}
                    className="block w-full p-4 text-left"
                  >
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <span className="font-display text-sm capitalize text-laton-claro">
                        {fmtLargo(n.dayKey)}
                      </span>
                      {editable && (
                        <span className="rounded-full bg-[var(--habitos-bg)] px-2 py-0.5 text-[0.6rem] font-semibold text-habitos">
                          editable 24 h
                        </span>
                      )}
                    </div>

                    {n.text && (
                      <p className="whitespace-pre-wrap font-serif text-marfil-dim line-clamp-3">{n.text}</p>
                    )}

                    {contacts.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {contacts.map((c) => (
                          <span key={c.id} className="flex items-center gap-1 rounded-full border border-[var(--hairline-soft)] bg-[var(--tinta)] px-2 py-0.5 text-xs text-gris-azul">
                            {c.source === "picker" ? "📱" : "✏"} {c.name}
                          </span>
                        ))}
                      </div>
                    )}

                    {attachments.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {attachments.map((att) => (
                          <span key={att.id} className="flex items-center gap-1 rounded-full border border-[var(--hairline-soft)] bg-[var(--tinta)] px-2 py-0.5 text-xs text-gris-azul">
                            {attachmentIcon(att.kind)} {att.name.length > 24 ? att.name.slice(0, 24) + "…" : att.name}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="mt-2 text-[0.7rem] text-gris-azul-dim">
                      Escrita en {etiquetaZona(n.tz)}
                    </p>
                  </button>

                  {/* Barra de acciones de la tarjeta */}
                  {tieneContenido && (
                    <div className="flex justify-end border-t border-[var(--hairline-soft)] px-4 py-2">
                      <button
                        type="button"
                        onClick={() => setCompartiendo(n)}
                        className="rounded-full border border-[var(--hairline)] px-3 py-1 text-xs text-gris-azul transition-colors hover:border-laton hover:text-laton-claro"
                      >
                        📤 Compartir
                      </button>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {compartiendo && (
        <SharePanel nota={compartiendo} onClose={() => setCompartiendo(null)} />
      )}
    </div>
  );
}
