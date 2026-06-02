"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { useUI } from "@/lib/ui";
import { fraseDelDia, ZODIAC_LABEL } from "@/lib/phrases";
import { zonaDispositivo } from "@/lib/dates";
import { Brillo, Torta, Cerrar } from "@/components/icons";

/** Frase de crecimiento del día, orientada al signo. */
export function DailyQuote() {
  const { data } = useStore();
  const { selectedDay } = useUI();
  const zodiac = data.settings?.zodiac ?? "leo";
  const frase = fraseDelDia(selectedDay, zodiac);

  return (
    <div className="carta relative overflow-hidden rounded-2xl px-5 py-5 text-center">
      <span className="pointer-events-none absolute -right-3 -top-3 text-laton opacity-10">
        <Brillo width={84} height={84} />
      </span>
      <span className="mx-auto mb-2 flex w-fit items-center gap-1.5 text-laton">
        <Brillo width={15} height={15} />
        <span className="font-display text-[0.6rem] uppercase tracking-[0.22em]">
          {ZODIAC_LABEL[zodiac] ?? "Frase"} · del día
        </span>
      </span>
      <p className="mx-auto max-w-xl font-serif text-lg italic leading-relaxed text-marfil-dim">
        “{frase}”
      </p>
    </div>
  );
}

/** Cartel de cumpleaños — aparece cuando el día (en la zona del
    dispositivo) coincide con la fecha de cumpleaños configurada. */
export function BirthdayBanner() {
  const { data } = useStore();
  const [hoyMMdd, setHoyMMdd] = useState<string | null>(null);
  const [cerrado, setCerrado] = useState(false);

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: zonaDispositivo(),
      month: "2-digit",
      day: "2-digit",
    });
    // en-CA da "MM-DD" como parte; construimos MM-dd
    const parts = fmt.formatToParts(new Date());
    const mm = parts.find((p) => p.type === "month")?.value ?? "";
    const dd = parts.find((p) => p.type === "day")?.value ?? "";
    setHoyMMdd(`${mm}-${dd}`);
  }, []);

  if (cerrado || !hoyMMdd || hoyMMdd !== data.settings.birthday) return null;

  return (
    <div
      className="borde-metal relative overflow-hidden rounded-2xl p-6 text-center animar-subir"
      role="alert"
      style={{ background: "linear-gradient(160deg, rgba(201,162,75,0.18), rgba(20,28,51,0.6))" }}
    >
      <button
        type="button"
        onClick={() => setCerrado(true)}
        className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-lg text-laton-claro hover:bg-[var(--tinta-3)]"
        aria-label="Cerrar"
      >
        <Cerrar width={16} height={16} />
      </button>
      <span className="mx-auto mb-2 flex w-fit text-laton-claro">
        <Torta width={34} height={34} />
      </span>
      <h2 className="metal-text font-display text-2xl font-bold tracking-wide">
        ¡Feliz Cumpleaños, Amor!
      </h2>
      <p className="mx-auto mt-3 max-w-lg font-serif text-base italic leading-relaxed text-marfil">
        “Mi tiempo tiene un precio que ya no negocio, pero con vos regalé hasta el
        reloj. Te merecés todo lo bueno que te pasa. Te amo.”
      </p>
    </div>
  );
}
