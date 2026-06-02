"use client";
import { useEffect, useRef, useState } from "react";
import { useStore } from "@/lib/store";
import { alertasAlAbrir, type Alerta } from "@/lib/selectors";
import { GRUPO_META } from "@/lib/types";
import { Campana, Cerrar } from "@/components/icons";

const TIPO_LABEL: Record<Alerta["tipo"], string> = {
  recordatorio: "Recordatorio de hoy",
  vencido: "Vencido",
  critico: "Crítico",
  pago: "Pago / casa",
  cotizacion: "Cotización",
};

export function AlertsBell() {
  const { data, ready, markReminderSeen } = useStore();
  const [abierto, setAbierto] = useState(false);
  const [ocultas, setOcultas] = useState<Set<string>>(new Set());
  const cont = useRef<HTMLDivElement>(null);

  // Cerrar al hacer click afuera o con Escape
  useEffect(() => {
    if (!abierto) return;
    const onClick = (e: MouseEvent) => {
      if (cont.current && !cont.current.contains(e.target as Node)) setAbierto(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setAbierto(false);
    document.addEventListener("mousedown", onClick);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      window.removeEventListener("keydown", onKey);
    };
  }, [abierto]);

  const alertas = ready ? alertasAlAbrir(data).filter((a) => !ocultas.has(a.id)) : [];
  const n = alertas.length;

  function descartar(a: Alerta) {
    setOcultas((s) => new Set(s).add(a.id));
    if (a.tipo === "recordatorio" || a.tipo === "vencido") markReminderSeen(a.id);
  }

  return (
    <div ref={cont} className="relative">
      <button
        type="button"
        onClick={() => setAbierto((v) => !v)}
        aria-label={`Para tener en cuenta${n ? `, ${n} alertas` : ", sin alertas"}`}
        aria-expanded={abierto}
        aria-haspopup="dialog"
        className="relative grid h-10 w-10 place-items-center rounded-xl text-gris-azul transition-colors hover:bg-[var(--tinta-3)] hover:text-laton-claro"
      >
        <Campana width={19} height={19} />
        {n > 0 && (
          <span
            className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-[var(--laton)] px-1 text-[0.6rem] font-bold text-noche"
            aria-hidden="true"
          >
            {n}
          </span>
        )}
      </button>

      {/* Pop-up */}
      {abierto && (
        <div
          role="dialog"
          aria-label="Para tener en cuenta"
          className="glass-strong absolute right-0 top-12 z-[80] w-[min(92vw,360px)] rounded-2xl border border-[var(--hairline)] p-3 shadow-[var(--sombra-lg)] animar-subir"
        >
          <div className="mb-2 flex items-center gap-2 px-1 text-laton-claro">
            <Campana width={16} height={16} />
            <h2 className="font-display text-sm font-semibold tracking-wide">Para tener en cuenta</h2>
          </div>

          {n === 0 ? (
            <p className="px-1 py-4 text-center font-serif text-sm italic text-gris-azul">
              Todo en orden por ahora. ✦
            </p>
          ) : (
            <ul className="flex max-h-[60vh] flex-col gap-2 overflow-y-auto" aria-live="polite">
              {alertas.map((a) => {
                const color = GRUPO_META[a.grupo].color;
                return (
                  <li
                    key={a.id}
                    className="flex items-start gap-2.5 rounded-xl border border-[var(--hairline-soft)] bg-[var(--tinta)] p-2.5"
                  >
                    <span className="mt-0.5 h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
                    <div className="min-w-0 flex-1">
                      <p className="text-[0.6rem] uppercase tracking-wide" style={{ color }}>{TIPO_LABEL[a.tipo]}</p>
                      <p className="truncate text-sm text-marfil">{a.titulo}</p>
                      {a.detalle && <p className="truncate text-xs text-gris-azul">{a.detalle}</p>}
                    </div>
                    <button
                      type="button"
                      onClick={() => descartar(a)}
                      className="grid h-6 w-6 flex-shrink-0 place-items-center rounded-lg text-gris-azul-dim hover:bg-[var(--tinta-3)] hover:text-marfil"
                      aria-label={`Descartar: ${a.titulo}`}
                    >
                      <Cerrar width={13} height={13} />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
