"use client";
import { useState, useEffect, useMemo } from "react";
import { useStore } from "@/lib/store";
import { accionesVivas, colorDestino } from "@/lib/selectors";
import { fmtCorto, diasEntre } from "@/lib/dates";
import type { Destination, Currency, TipoDestino } from "@/lib/types";
import { TIPO_DESTINO } from "@/lib/types";
import { PAISES, buscarPais, ciudadesDeProvincia } from "@/lib/places";
import { PageHeader, Boton, Sheet, Campo, inputClase } from "@/components/ui";
import { ActionEditor } from "@/components/actions/action-editor";
import { Mas, Lapiz, Pin, Telefono, Whatsapp, ICONO_TIPO } from "@/components/icons";

function esUrl(s: string): boolean {
  return /^https?:\/\//i.test(s.trim());
}

const MONEDAS: Currency[] = ["ARS", "USD", "EUR", "GBP"];

const TIPO_LABEL: Record<TipoDestino, string> = {
  vuelo: "Vuelos", estadia: "Estadía", tour: "Tours", visita: "Visitas",
  curso: "Cursos", charla: "Charlas", evento: "Eventos",
};

export default function DestinosPage() {
  const { data, ready, upsertDestination } = useStore();
  const [editar, setEditar] = useState<Destination | null>(null);
  const [abierto, setAbierto] = useState(false);
  const [asociar, setAsociar] = useState<{ destId: string; kind: TipoDestino } | null>(null);

  if (!ready) return null;
  const destinos = [...data.destinations].filter((d) => !d.deletedAt).sort((a, b) => a.sortOrder - b.sortOrder);
  const totalDias = diasEntre(data.trip.startsOn, data.trip.endsOn) + 1;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <PageHeader
        titulo="Destinos"
        sub="Tu planificación visual — la agenda toma estas fechas"
        accion={<Boton variante="oro" onClick={() => { setEditar(null); setAbierto(true); }}><Mas width={16} height={16} /> Agregar</Boton>}
      />

      {/* Barra-resumen del viaje (proporción de días por destino) */}
      <div className="carta rounded-2xl p-4">
        <div className="flex h-4 w-full overflow-hidden rounded-full" role="img" aria-label="Proporción de días por destino">
          {destinos.map((d) => {
            const dias = diasEntre(d.startsOn, d.endsOn) + 1;
            const color = colorDestino(data, d.id);
            return (
              <div key={d.id} style={{ width: `${(dias / totalDias) * 100}%`, background: color }}
                title={`${d.name}: ${dias} días`} />
            );
          })}
        </div>
        {/* Leyenda con los nombres afuera */}
        <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5">
          {destinos.map((d) => {
            const dias = diasEntre(d.startsOn, d.endsOn) + 1;
            const pct = Math.round((dias / totalDias) * 100);
            const color = colorDestino(data, d.id);
            return (
              <li key={d.id} className="flex items-center gap-1.5 text-xs text-gris-azul">
                <span className="h-2.5 w-2.5 flex-shrink-0 rounded-full" style={{ background: color }} aria-hidden="true" />
                <span className="text-marfil">{d.name}</span>
                <span className="text-gris-azul-dim">{dias}d · {pct}%</span>
              </li>
            );
          })}
        </ul>
        <p className="mt-2 text-xs text-gris-azul-dim">{totalDias} días · {destinos.length} destinos</p>
      </div>

      {/* Tarjetas de destino */}
      <ol className="flex flex-col gap-4">
        {destinos.map((d) => {
          const dias = diasEntre(d.startsOn, d.endsOn) + 1;
          const color = colorDestino(data, d.id);
          const items = accionesVivas(data).filter((a) => a.destinationId === d.id);
          return (
            <li key={d.id} className="carta overflow-hidden rounded-2xl" style={{ borderLeft: `3px solid ${color}` }}>
              <div className="flex items-start gap-4 p-4">
                <span className="grid h-12 w-12 flex-shrink-0 place-items-center rounded-xl" style={{ background: `color-mix(in srgb, ${color} 18%, transparent)`, color }}>
                  <Pin width={22} height={22} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-display text-lg font-semibold text-marfil">{d.name}</p>
                    <span className="rounded-full px-2 py-0.5 text-[0.65rem] font-semibold" style={{ background: `color-mix(in srgb, ${color} 16%, transparent)`, color }}>
                      {d.currency}
                    </span>
                  </div>
                  <p className="text-sm text-gris-azul">
                    {[d.city, d.province, d.country].filter(Boolean).join(" · ")}
                  </p>
                  <p className="mt-0.5 text-xs text-gris-azul-dim">
                    {fmtCorto(d.startsOn)} – {fmtCorto(d.endsOn)} · <strong className="text-marfil-dim">{dias} días</strong>
                    {d.accommodation && <> · {d.accommodation}</>}
                  </p>
                  {(d.contactName || d.contactPhone || d.reference) && (
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
                      {d.reference && (esUrl(d.reference) ? (
                        <a href={d.reference} target="_blank" rel="noopener noreferrer"
                          className="text-laton-claro underline-offset-2 hover:underline">Reserva ↗</a>
                      ) : (
                        <span className="text-gris-azul-dim">{d.reference}</span>
                      ))}
                      {d.contactName && <span className="text-gris-azul">{d.contactName}</span>}
                      {d.contactPhone && (
                        <span className="flex items-center gap-1.5">
                          <a href={`tel:${d.contactPhone.replace(/[^\d+]/g, "")}`}
                            className="flex items-center gap-1 rounded-full border border-[var(--hairline-soft)] px-2 py-0.5 text-gris-azul hover:border-laton hover:text-marfil"
                            aria-label={`Llamar a ${d.contactName ?? d.name}`}>
                            <Telefono width={12} height={12} /> Llamar
                          </a>
                          <a href={`https://wa.me/${d.contactPhone.replace(/[^\d]/g, "")}`} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 rounded-full border border-[var(--hairline-soft)] px-2 py-0.5 text-habitos hover:border-habitos"
                            aria-label={`WhatsApp a ${d.contactName ?? d.name}`}>
                            <Whatsapp width={12} height={12} /> WhatsApp
                          </a>
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <button type="button" onClick={() => { setEditar(d); setAbierto(true); }} aria-label={`Editar ${d.name}`}
                  className="grid h-9 w-9 place-items-center rounded-lg text-gris-azul hover:bg-[var(--tinta-3)] hover:text-marfil"><Lapiz width={16} height={16} /></button>
              </div>

              {/* Elementos asociados por tipo */}
              <div className="border-t border-[var(--hairline-soft)] px-4 py-3">
                <div className="flex flex-wrap gap-1.5">
                  {TIPO_DESTINO.map((k) => {
                    const Icon = ICONO_TIPO[k];
                    const n = items.filter((a) => a.kind === k).length;
                    return (
                      <button
                        key={k}
                        type="button"
                        onClick={() => setAsociar({ destId: d.id, kind: k })}
                        className="flex items-center gap-1.5 rounded-full border border-[var(--hairline-soft)] px-2.5 py-1 text-xs text-gris-azul transition-colors hover:border-laton hover:text-marfil"
                        aria-label={`Agregar ${TIPO_LABEL[k]} a ${d.name}`}
                      >
                        <Icon width={14} height={14} />
                        {TIPO_LABEL[k]}
                        {n > 0 && <span className="text-laton-claro">· {n}</span>}
                      </button>
                    );
                  })}
                </div>

                {items.length > 0 && (
                  <ul className="mt-3 flex flex-col gap-1.5">
                    {items.slice(0, 6).map((a) => {
                      const Icon = (a.kind && ICONO_TIPO[a.kind as TipoDestino]) || Pin;
                      return (
                        <li key={a.id} className="flex items-center gap-2 text-sm text-marfil-dim">
                          <Icon width={14} height={14} />
                          <span className="truncate">{a.title}</span>
                          <span className="ml-auto flex-shrink-0 text-xs text-gris-azul-dim">{fmtCorto(a.actionDate)}</span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      <DestinoEditor open={abierto} onClose={() => setAbierto(false)} editar={editar} onGuardar={upsertDestination} />

      {asociar && (
        <ActionEditor
          open={!!asociar}
          onClose={() => setAsociar(null)}
          fecha={destinos.find((d) => d.id === asociar.destId)?.startsOn ?? data.trip.startsOn}
          grupoInicial="agenda"
          destinoInicial={asociar.destId}
          kindInicial={asociar.kind}
        />
      )}
    </div>
  );
}

const TIPOS_ALOJAMIENTO = [
  "Hotel", "Hostel", "Airbnb", "Cabaña", "Camping",
  "Departamento", "Casa / Chalet", "Bed & Breakfast", "Resort",
] as const;

function DestinoEditor({
  open, onClose, editar, onGuardar,
}: {
  open: boolean;
  onClose: () => void;
  editar: Destination | null;
  onGuardar: ReturnType<typeof useStore>["upsertDestination"];
}) {
  const [f, setF] = useState(() => init(editar));
  useEffect(() => { if (open) setF(init(editar)); }, [open, editar]);

  const paisSel = buscarPais(f.country);
  const provincias = paisSel?.provincias ?? [];
  const ciudades = ciudadesDeProvincia(paisSel, f.province);

  function elegirPais(nombre: string) {
    const p = buscarPais(nombre);
    setF((prev) => ({
      ...prev,
      country: nombre,
      currency: p?.currency ?? prev.currency,
      timezone: p?.timezone ?? prev.timezone,
      province: "",
      city: "",
      name: "",
    }));
  }

  function elegirProvincia(provincia: string) {
    setF((prev) => ({ ...prev, province: provincia, city: "", name: "" }));
  }

  function elegirCiudad(ciudad: string) {
    setF((prev) => ({ ...prev, city: ciudad, name: ciudad }));
  }

  const puedeGuardar = f.country && f.province && f.city;

  return (
    <Sheet open={open} onClose={onClose} titulo={editar ? "Editar destino" : "Nuevo destino"}>
      {/* Cascada: país → provincia → ciudad */}
      <Campo label="País" htmlFor="d-pais">
        <select id="d-pais" className={inputClase} value={f.country} onChange={(e) => elegirPais(e.target.value)}>
          <option value="">— Elegí un país —</option>
          {PAISES.map((p) => <option key={p.nombre} value={p.nombre}>{p.nombre}</option>)}
        </select>
      </Campo>

      <div className="grid grid-cols-2 gap-2">
        <Campo label="Provincia / Región" htmlFor="d-prov">
          <select id="d-prov" className={inputClase} value={f.province} disabled={!paisSel}
            onChange={(e) => elegirProvincia(e.target.value)}>
            <option value="">{paisSel ? "— Elegí —" : "Elegí país primero"}</option>
            {provincias.map((pr) => <option key={pr} value={pr}>{pr}</option>)}
          </select>
        </Campo>
        <Campo label="Ciudad" htmlFor="d-ciudad">
          <select id="d-ciudad" className={inputClase} value={f.city} disabled={!f.province}
            onChange={(e) => elegirCiudad(e.target.value)}>
            <option value="">{f.province ? "— Elegí —" : "Elegí provincia primero"}</option>
            {ciudades.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </Campo>
      </div>

      {/* Info automática: moneda y timezone */}
      <div className="grid grid-cols-2 gap-2">
        <Campo label="Moneda" htmlFor="d-mon">
          <select id="d-mon" className={inputClase} value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value as Currency })}>
            {MONEDAS.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Campo>
        <Campo label="Zona horaria" htmlFor="d-tz">
          <div id="d-tz" className={`${inputClase} flex items-center text-gris-azul`}>
            {f.timezone || "—"}
          </div>
        </Campo>
      </div>

      <Campo label="Alojamiento" htmlFor="d-aloj">
        <select id="d-aloj" className={inputClase} value={f.accommodation}
          onChange={(e) => setF({ ...f, accommodation: e.target.value })}>
          <option value="">— Sin especificar —</option>
          {TIPOS_ALOJAMIENTO.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
      </Campo>

      <div className="grid grid-cols-2 gap-2">
        <Campo label="Desde" htmlFor="d-desde">
          <input id="d-desde" type="date" className={inputClase} value={f.startsOn}
            onChange={(e) => setF({ ...f, startsOn: e.target.value })} />
        </Campo>
        <Campo label="Hasta" htmlFor="d-hasta">
          <input id="d-hasta" type="date" className={inputClase} value={f.endsOn}
            onChange={(e) => setF({ ...f, endsOn: e.target.value })} />
        </Campo>
      </div>

      <div className="flex justify-end gap-2">
        <Boton variante="fantasma" onClick={onClose}>Cancelar</Boton>
        <Boton variante="oro" disabled={!puedeGuardar}
          onClick={() => { if (puedeGuardar) { onGuardar({ id: editar?.id, ...f }); onClose(); } }}>
          {editar ? "Guardar" : "Crear"}
        </Boton>
      </div>
    </Sheet>
  );
}

function init(d: Destination | null) {
  return {
    name: d?.name ?? "",
    country: d?.country ?? "",
    city: d?.city ?? "",
    province: d?.province ?? "",
    currency: (d?.currency ?? "EUR") as Currency,
    timezone: d?.timezone ?? "Europe/London",
    startsOn: d?.startsOn ?? "2026-06-05",
    endsOn: d?.endsOn ?? "2026-06-08",
    accommodation: d?.accommodation ?? "",
    reference: d?.reference ?? "",
    contactName: d?.contactName ?? "",
    contactPhone: d?.contactPhone ?? "",
  };
}
