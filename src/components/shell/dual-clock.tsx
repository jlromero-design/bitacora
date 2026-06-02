"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { horaEnZona, zonaDispositivo } from "@/lib/dates";

/** Reloj de dos zonas: local (dispositivo) + secundaria (config). */
export function DualClock({ compact = false }: { compact?: boolean }) {
  const { data } = useStore();
  const [montado, setMontado] = useState(false);
  const [, tick] = useState(0);

  useEffect(() => {
    setMontado(true);
    const id = setInterval(() => tick((n) => n + 1), 30_000);
    return () => clearInterval(id);
  }, []);

  // Placeholder en SSR / antes de montar → evita mismatch de hidratación
  if (!montado) {
    return (
      <span className="block font-sans text-[0.7rem] font-light tracking-[0.2em] text-gris-azul">
        ✦ ✦
      </span>
    );
  }

  const { secondaryTimezone, secondaryLabel, localLabel } = data.settings;
  const local = horaEnZona(zonaDispositivo());
  const otra = horaEnZona(secondaryTimezone);

  if (compact) {
    return (
      <span className="font-sans text-xs tabular-nums text-gris-azul">
        <span className="text-laton-claro">{local}</span> {localLabel}
      </span>
    );
  }

  return (
    <span
      className="flex items-center gap-1.5 font-sans text-[0.72rem] tabular-nums text-gris-azul"
      aria-label={`Hora local ${local} ${localLabel}, ${secondaryLabel} ${otra}`}
    >
      <span className="text-laton-claro">{local}</span>
      <span className="text-gris-azul-dim">{localLabel}</span>
      <span className="text-[var(--hairline)]">·</span>
      <span className="text-marfil-dim">{otra}</span>
      <span className="text-gris-azul-dim">{secondaryLabel}</span>
    </span>
  );
}
