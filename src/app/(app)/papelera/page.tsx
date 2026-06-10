"use client";
import { useStore } from "@/lib/store";
import { fmtCorto, fmtLargo } from "@/lib/dates";
import { fmtMoneda } from "@/lib/fx";
import { categoriaById } from "@/lib/categorias";
import { PageHeader, Boton, GrupoBadge } from "@/components/ui";

export default function PapeleraPage() {
  const { data, ready, restoreAction, restoreExpense, restoreHabit, restoreNote } = useStore();
  if (!ready) return null;

  const actividades = data.actions
    .filter((a) => a.deletedAt)
    .sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? ""));

  const gastos = data.expenses
    .filter((e) => e.deletedAt)
    .sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? ""));

  const habitos = data.habits
    .filter((h) => h.deletedAt)
    .sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? ""));

  const notas = (data.notes ?? [])
    .filter((n) => n.deletedAt)
    .sort((a, b) => (b.deletedAt ?? "").localeCompare(a.deletedAt ?? ""));

  const total = actividades.length + gastos.length + habitos.length + notas.length;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-6">
      <PageHeader titulo="Papelera" sub="Lo que borraste se puede recuperar" />

      {total === 0 ? (
        <div className="carta rounded-2xl px-6 py-12 text-center">
          <p className="font-serif text-base italic text-gris-azul">La papelera está vacía. ✦</p>
        </div>
      ) : (
        <>
          {actividades.length > 0 && (
            <section>
              <h2 className="mb-2 font-display text-xs uppercase tracking-widest text-gris-azul">
                Actividades · {actividades.length}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {actividades.map((a) => (
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
            </section>
          )}

          {gastos.length > 0 && (
            <section>
              <h2 className="mb-2 font-display text-xs uppercase tracking-widest text-gris-azul">
                Gastos · {gastos.length}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {gastos.map((e) => {
                  const cat = e.categoria ? categoriaById(e.categoria) : undefined;
                  return (
                    <li key={e.id} className="carta flex items-center gap-3 rounded-2xl p-4 opacity-80">
                      {cat && <span className="text-xl" aria-hidden="true">{cat.emoji}</span>}
                      <div className="min-w-0 flex-1">
                        <p className="font-serif text-marfil line-through opacity-70">{e.title}</p>
                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          <span className="text-sm text-finanzas">{fmtMoneda(e.amount, e.currency)}</span>
                          {cat && <span className="text-xs text-gris-azul">{cat.nombre}{e.subcategoria ? ` · ${e.subcategoria}` : ""}</span>}
                          <span className="text-xs text-gris-azul-dim">{fmtCorto(e.spentOn)}</span>
                        </div>
                      </div>
                      <Boton variante="primario" onClick={() => restoreExpense(e.id)} aria-label={`Recuperar ${e.title}`}>
                        ↺ Recuperar
                      </Boton>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {habitos.length > 0 && (
            <section>
              <h2 className="mb-2 font-display text-xs uppercase tracking-widest text-gris-azul">
                Hábitos · {habitos.length}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {habitos.map((h) => (
                  <li key={h.id} className="carta flex items-center gap-3 rounded-2xl p-4 opacity-80">
                    <span className="text-xl" aria-hidden="true">{h.icon ?? "✦"}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-marfil line-through opacity-70">{h.name}</p>
                      <p className="mt-0.5 text-xs text-gris-azul">
                        Meta: {h.targetPerWeek}× por semana
                        {h.description ? ` · ${h.description}` : ""}
                      </p>
                    </div>
                    <Boton variante="primario" onClick={() => restoreHabit(h.id)} aria-label={`Recuperar ${h.name}`}>
                      ↺ Recuperar
                    </Boton>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {notas.length > 0 && (
            <section>
              <h2 className="mb-2 font-display text-xs uppercase tracking-widest text-gris-azul">
                Notas · {notas.length}
              </h2>
              <ul className="flex flex-col gap-2.5">
                {notas.map((n) => (
                  <li key={n.id} className="carta flex items-center gap-3 rounded-2xl p-4 opacity-80">
                    <span className="text-xl" aria-hidden="true">📓</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-serif text-marfil line-through opacity-70 line-clamp-2">
                        {n.text || <em className="not-italic text-gris-azul">Sin texto</em>}
                      </p>
                      <p className="mt-0.5 text-xs text-gris-azul-dim">{fmtLargo(n.dayKey)}</p>
                    </div>
                    <Boton variante="primario" onClick={() => restoreNote(n.id)} aria-label="Recuperar nota">
                      ↺ Recuperar
                    </Boton>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  );
}
