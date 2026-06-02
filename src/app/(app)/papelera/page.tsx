"use client";
import { useStore } from "@/lib/store";
import { fmtCorto } from "@/lib/dates";
import { PageHeader, Boton, GrupoBadge } from "@/components/ui";

export default function PapeleraPage() {
  const { data, ready, restoreAction } = useStore();
  if (!ready) return null;

  const borradas = data.actions
    .filter((a) => a.deletedAt)
    .sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? ""));

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <PageHeader titulo="Papelera" sub="Lo que borraste se puede recuperar" />

      {borradas.length === 0 ? (
        <div className="carta rounded-2xl px-6 py-12 text-center">
          <p className="font-serif text-base italic text-gris-azul">La papelera está vacía. ✦</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {borradas.map((a) => (
            <li key={a.id} className="carta flex items-center gap-3 rounded-2xl p-4 opacity-80">
              <div className="min-w-0 flex-1">
                <p className="font-serif text-marfil line-through opacity-70">{a.title}</p>
                <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                  <GrupoBadge group={a.group} kind={a.kind} />
                  <span className="text-xs text-gris-azul-dim">Era del {fmtCorto(a.actionDate)}</span>
                </div>
              </div>
              <Boton variante="primario" onClick={() => restoreAction(a.id)} aria-label={`Recuperar ${a.title}`}>
                ↺ Recuperar
              </Boton>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
