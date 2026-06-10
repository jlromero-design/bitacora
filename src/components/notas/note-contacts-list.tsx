"use client";
import type { NoteContact } from "@/lib/types";
import { Papelera } from "@/components/icons";

type Props = {
  contacts: NoteContact[];
  editable: boolean;
  onRemove: (id: string) => void;
};

export function NoteContactsList({ contacts, editable, onRemove }: Props) {
  if (contacts.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="font-display text-xs uppercase tracking-widest text-gris-azul">Personas · {contacts.length}</p>
      <ul className="flex flex-col gap-1.5">
        {contacts.map((c) => (
          <li key={c.id} className="flex items-center gap-3 rounded-xl border border-[var(--hairline-soft)] bg-[var(--tinta)] px-3 py-2">
            <span className="text-base" aria-hidden="true">
              {c.source === "picker" ? "📱" : "✏"}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-marfil">{c.name}</p>
              {(c.phone || c.email) && (
                <p className="text-xs text-gris-azul">
                  {[c.phone, c.email].filter(Boolean).join(" · ")}
                </p>
              )}
            </div>
            {editable && (
              <button
                type="button"
                onClick={() => onRemove(c.id)}
                aria-label={`Quitar ${c.name}`}
                className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-gris-azul-dim hover:text-peligro"
              >
                <Papelera width={14} height={14} />
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
