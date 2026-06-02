"use client";
import { useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { zonaDispositivo, horaEnZona, etiquetaZona, offsetHoras } from "@/lib/dates";
import { PageHeader, Campo, inputClase, SeccionTitulo } from "@/components/ui";

/** Zonas por país/región frecuentes del viaje */
const ZONAS: { tz: string; pais: string }[] = [
  { tz: "America/Argentina/Buenos_Aires", pais: "Argentina" },
  { tz: "Europe/London", pais: "Inglaterra" },
  { tz: "Europe/London", pais: "Escocia" },
  { tz: "Europe/Amsterdam", pais: "Países Bajos" },
  { tz: "Europe/Madrid", pais: "España" },
  { tz: "Europe/Lisbon", pais: "Portugal" },
];

export default function TiempoPage() {
  const { data, ready, updateSettings } = useStore();
  const [montado, setMontado] = useState(false);
  const [, tick] = useState(0);

  useEffect(() => {
    setMontado(true);
    const id = setInterval(() => tick((n) => n + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  if (!ready) return null;

  const { secondaryTimezone, secondaryLabel, localLabel } = data.settings;
  const dispositivo = montado ? zonaDispositivo() : "—";
  // zonas por país + destinos del viaje (sin duplicar tz)
  const tzDestinos = data.destinations
    .filter((d) => !d.deletedAt && !ZONAS.some((z) => z.tz === d.timezone))
    .map((d) => ({ tz: d.timezone, pais: d.name }));
  const zonas = [...ZONAS, ...tzDestinos];
  const ETIQUETA_PAIS: Record<string, string> = {
    Argentina: "AR", Inglaterra: "ENG", Escocia: "ESC",
    "Países Bajos": "NL", España: "ESP", Portugal: "POR",
  };

  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-5">
      <PageHeader titulo="Tiempo" sub="Tu reloj de dos zonas" />

      {/* Vista previa del reloj */}
      <div className="carta borde-metal rounded-2xl p-5 text-center">
        <SeccionTitulo>Ahora mismo</SeccionTitulo>
        {montado ? (
          <div className="mt-3 flex items-center justify-center gap-6">
            <div>
              <p className="font-display text-3xl font-bold tabular-nums text-laton-claro">
                {horaEnZona(zonaDispositivo())}
              </p>
              <p className="mt-1 text-xs text-gris-azul">{localLabel} · tu ubicación</p>
            </div>
            <span className="text-2xl text-[var(--hairline)]">·</span>
            <div>
              <p className="font-display text-3xl font-bold tabular-nums text-marfil">
                {horaEnZona(secondaryTimezone)}
              </p>
              <p className="mt-1 text-xs text-gris-azul">
                {secondaryLabel} · {etiquetaZona(secondaryTimezone)}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-4 font-serif italic text-gris-azul">Cargando reloj…</p>
        )}
        {montado && (
          <p className="mt-3 text-xs text-gris-azul-dim">
            Diferencia: {fmtOffset(offsetHoras(secondaryTimezone))} respecto a vos
          </p>
        )}
      </div>

      {/* Configuración */}
      <div className="carta rounded-2xl p-5">
        <SeccionTitulo>Configuración</SeccionTitulo>

        <div className="mt-3 rounded-xl border border-[var(--hairline-soft)] bg-[var(--tinta)] px-3 py-2.5 text-sm">
          <p className="text-gris-azul">
            Hora local detectada del dispositivo:{" "}
            <strong className="text-marfil">{dispositivo}</strong>
          </p>
          <p className="mt-0.5 text-xs text-gris-azul-dim">
            Se toma automáticamente de tu navegador (refleja dónde estás). Cuando viajes y cambie
            la zona del celular, el reloj se actualiza solo.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Campo label="Etiqueta local" htmlFor="t-local">
            <input id="t-local" className={inputClase} value={localLabel} maxLength={5}
              onChange={(e) => updateSettings({ localLabel: e.target.value })} />
          </Campo>
          <Campo label="Etiqueta 2ª" htmlFor="t-sec-label">
            <input id="t-sec-label" className={inputClase} value={secondaryLabel} maxLength={5}
              onChange={(e) => updateSettings({ secondaryLabel: e.target.value })} />
          </Campo>
          <div className="col-span-1" />
        </div>

        <Campo label="Zona horaria secundaria (por país)" htmlFor="t-sec-tz">
          <select id="t-sec-tz" className={inputClase}
            value={Math.max(0, zonas.findIndex((z) => z.tz === secondaryTimezone))}
            onChange={(e) => {
              const z = zonas[+e.target.value];
              updateSettings({
                secondaryTimezone: z.tz,
                secondaryLabel: ETIQUETA_PAIS[z.pais] ?? z.pais.slice(0, 3).toUpperCase(),
              });
            }}>
            {zonas.map((z, i) => (
              <option key={`${z.pais}-${z.tz}`} value={i}>
                {z.pais} — {etiquetaZona(z.tz)}
              </option>
            ))}
          </select>
        </Campo>
        <p className="text-xs text-gris-azul-dim">
          El reloj de dos zonas aparece en la barra superior, junto a «Vale Juri».
        </p>
      </div>
    </div>
  );
}

function fmtOffset(h: number): string {
  if (h === 0) return "misma hora";
  const signo = h > 0 ? "+" : "−";
  return `${signo}${Math.abs(h)} h`;
}
