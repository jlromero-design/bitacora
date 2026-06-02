"use client";
import { useMemo } from "react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { useRouter } from "next/navigation";
import { fmtLargo, etiquetaZona } from "@/lib/dates";
import { PageHeader } from "@/components/ui";
import { Libro } from "@/components/icons";

export default function NotasPage() {
  const { data, ready } = useStore();
  const { setSelectedDay } = useUI();
  const router = useRouter();

  const notas = useMemo(
    () => [...(data.notes ?? [])].sort((a, b) => b.dayKey.localeCompare(a.dayKey)),
    [data.notes],
  );

  if (!ready) return null;

  function abrirDia(dayKey: string) {
    setSelectedDay(dayKey);
    router.push("/agenda");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4">
      <PageHeader titulo="Notas" sub="Tu bitácora, día por día" />

      {notas.length === 0 ? (
        <div className="carta rounded-2xl px-6 py-12 text-center">
          <p className="font-serif text-base italic text-gris-azul">
            Todavía no escribiste ninguna nota. Empezá desde la Agenda. ✦
          </p>
        </div>
      ) : (
        <ol className="relative ml-3 flex flex-col gap-4 border-l border-[var(--hairline-soft)] pl-5">
          {notas.map((n) => {
            const reciente = Date.now() - new Date(n.createdAt).getTime() < 24 * 3600 * 1000;
            return (
              <li key={n.id} className="relative">
                <span className="absolute -left-[27px] top-1.5 grid h-5 w-5 place-items-center rounded-full border border-[var(--hairline)] bg-[var(--tinta)] text-laton">
                  <Libro width={11} height={11} />
                </span>
                <button
                  type="button"
                  onClick={() => abrirDia(n.dayKey)}
                  className="carta block w-full rounded-2xl p-4 text-left transition-shadow hover:shadow-[var(--sombra-md)]"
                >
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-display text-sm capitalize text-laton-claro">
                      {fmtLargo(n.dayKey)}
                    </span>
                    {reciente && (
                      <span className="rounded-full bg-[var(--habitos-bg)] px-2 py-0.5 text-[0.6rem] font-semibold text-habitos">
                        editable 24 h
                      </span>
                    )}
                  </div>
                  <p className="whitespace-pre-wrap font-serif text-marfil-dim">{n.text}</p>
                  <p className="mt-2 text-[0.7rem] text-gris-azul-dim">
                    Escrita en {etiquetaZona(n.tz)}
                  </p>
                </button>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
