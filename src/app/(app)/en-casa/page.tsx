"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { accionesVivas } from "@/lib/selectors";
import type { TripAction, Persona, PersonaItem } from "@/lib/types";
import { PageHeader, Boton, SeccionTitulo, inputClase } from "@/components/ui";
import { ActionEditor } from "@/components/actions/action-editor";
import { WeeklyGroups } from "@/components/actions/weekly-groups";
import { fmtCorto } from "@/lib/dates";
import { PrioridadBadge, EstadoBadge } from "@/components/ui";
import {
  Mas, Lapiz, Papelera, Tilde, Persona as PersonaIcon, Pata, Cerrar,
} from "@/components/icons";

// ── Tarjeta de persona ─────────────────────────────────────────────────────

function TarjetaPersona({
  persona,
  items,
}: {
  persona: Persona;
  items: PersonaItem[];
}) {
  const { removePersona, addPersonaItem, togglePersonaItem, removePersonaItem } = useStore();
  const [nuevoTexto, setNuevoTexto] = useState("");
  const [nuevoTipo, setNuevoTipo] = useState<PersonaItem["tipo"]>("tarea");
  const [agregando, setAgregando] = useState(false);

  const Icon = persona.tipo === "pata" ? Pata : PersonaIcon;

  function guardar() {
    if (!nuevoTexto.trim()) return;
    addPersonaItem(persona.id, nuevoTexto, nuevoTipo);
    setNuevoTexto("");
    setAgregando(false);
  }

  return (
    <div className="carta rounded-2xl p-4 flex flex-col gap-3">
      {/* Cabecera */}
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-[var(--casa-bg)] text-casa">
          <Icon width={18} height={18} />
        </span>
        <p className="flex-1 font-serif text-base text-marfil">{persona.nombre}</p>
        <button
          type="button"
          onClick={() => setAgregando((v) => !v)}
          title="Agregar ítem"
          className="grid h-8 w-8 place-items-center rounded-lg text-gris-azul hover:bg-[var(--tinta-3)] hover:text-laton"
        >
          <Mas width={15} height={15} />
        </button>
        <button
          type="button"
          onClick={() => { if (confirm(`¿Eliminar a ${persona.nombre} y todos sus ítems?`)) removePersona(persona.id); }}
          title="Eliminar persona"
          className="grid h-8 w-8 place-items-center rounded-lg text-gris-azul hover:bg-[var(--tinta-3)] hover:text-peligro"
        >
          <Papelera width={15} height={15} />
        </button>
      </div>

      {/* Lista de ítems */}
      {items.length > 0 && (
        <ul className="flex flex-col gap-1.5 pl-1">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-2 group">
              <button
                type="button"
                onClick={() => togglePersonaItem(item.id)}
                aria-pressed={item.hecho}
                className={`grid h-5 w-5 flex-shrink-0 place-items-center rounded border-2 transition-colors ${
                  item.hecho
                    ? "check-metal border-transparent text-noche"
                    : "border-[var(--hairline)] text-transparent hover:border-laton"
                }`}
              >
                <Tilde width={12} height={12} />
              </button>
              <span className={`flex-1 text-sm ${item.hecho ? "line-through text-gris-azul-dim" : "text-marfil-dim"}`}>
                {item.texto}
              </span>
              <span className={`shrink-0 rounded-full px-1.5 py-0.5 text-[0.6rem] uppercase tracking-wide ${
                item.tipo === "regalo"
                  ? "bg-[var(--pendientes-bg)] text-pendientes"
                  : "bg-[var(--casa-bg)] text-casa"
              }`}>
                {item.tipo}
              </span>
              <button
                type="button"
                onClick={() => removePersonaItem(item.id)}
                className="opacity-0 group-hover:opacity-100 grid h-6 w-6 place-items-center rounded text-gris-azul hover:text-peligro transition-opacity"
              >
                <Cerrar width={12} height={12} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Formulario inline para nuevo ítem */}
      {agregando && (
        <div className="flex flex-col gap-2 border-t border-[var(--hairline-soft)] pt-3">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setNuevoTipo("tarea")}
              className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                nuevoTipo === "tarea"
                  ? "bg-[var(--casa-bg)] text-casa"
                  : "text-gris-azul hover:text-marfil"
              }`}
            >
              Tarea
            </button>
            <button
              type="button"
              onClick={() => setNuevoTipo("regalo")}
              className={`rounded-lg px-2.5 py-1 text-xs transition-colors ${
                nuevoTipo === "regalo"
                  ? "bg-[var(--pendientes-bg)] text-pendientes"
                  : "text-gris-azul hover:text-marfil"
              }`}
            >
              Regalo
            </button>
          </div>
          <div className="flex gap-2">
            <input
              autoFocus
              type="text"
              value={nuevoTexto}
              onChange={(e) => setNuevoTexto(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") guardar(); if (e.key === "Escape") setAgregando(false); }}
              placeholder={nuevoTipo === "regalo" ? "ej. bufanda hermosa…" : "ej. saludar por el día del médico…"}
              className={inputClase}
            />
            <button
              type="button"
              onClick={guardar}
              disabled={!nuevoTexto.trim()}
              className="btn-oro shrink-0 rounded-xl px-3 py-2 text-sm font-semibold disabled:opacity-40"
            >
              Agregar
            </button>
          </div>
        </div>
      )}

      {/* Estado vacío */}
      {items.length === 0 && !agregando && (
        <p className="pl-1 text-xs text-gris-azul-dim italic">
          Sin ítems — tocá + para agregar un regalo o tarea.
        </p>
      )}
    </div>
  );
}

// ── Formulario para nueva persona ──────────────────────────────────────────

function FormNuevaPersona({ onCerrar }: { onCerrar: () => void }) {
  const { addPersona } = useStore();
  const [nombre, setNombre] = useState("");
  const [tipo, setTipo] = useState<Persona["tipo"]>("persona");

  function guardar() {
    if (!nombre.trim()) return;
    addPersona(nombre, tipo);
    onCerrar();
  }

  return (
    <div className="carta rounded-2xl p-4 flex flex-col gap-3 border border-[var(--laton-tenue)]">
      <p className="font-display text-[0.65rem] uppercase tracking-[0.15em] text-laton">
        Nueva persona
      </p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setTipo("persona")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
            tipo === "persona" ? "bg-[var(--casa-bg)] text-casa" : "text-gris-azul hover:text-marfil"
          }`}
        >
          <PersonaIcon width={14} height={14} /> Persona
        </button>
        <button
          type="button"
          onClick={() => setTipo("pata")}
          className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors ${
            tipo === "pata" ? "bg-[var(--habitos-bg)] text-habitos" : "text-gris-azul hover:text-marfil"
          }`}
        >
          <Pata width={14} height={14} /> Mascota
        </button>
      </div>
      <div className="flex gap-2">
        <input
          autoFocus
          type="text"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") guardar(); if (e.key === "Escape") onCerrar(); }}
          placeholder="ej. Papá, Mamá, Indi…"
          className={inputClase}
        />
        <button
          type="button"
          onClick={guardar}
          disabled={!nombre.trim()}
          className="btn-oro shrink-0 rounded-xl px-3 py-2 text-sm font-semibold disabled:opacity-40"
        >
          Guardar
        </button>
        <button
          type="button"
          onClick={onCerrar}
          className="btn-ghost-metal shrink-0 rounded-xl px-3 py-2 text-sm"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────

export default function EnCasaPage() {
  const { data, ready, softDeleteAction, setStatus } = useStore();
  const [editor, setEditor] = useState<{ open: boolean; editar: TripAction | null }>({ open: false, editar: null });
  const [agregandoPersona, setAgregandoPersona] = useState(false);

  if (!ready) return null;

  const tramites = accionesVivas(data).filter((a) => a.group === "home");
  const personas = data.personas ?? [];
  const personaItems = data.personaItems ?? [];

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <PageHeader
        titulo="En casa"
        sub="Lo que queda activo mientras viajás"
        accion={
          <div className="flex gap-2">
            <Boton onClick={() => setAgregandoPersona(true)}>
              <PersonaIcon width={16} height={16} /> Persona
            </Boton>
            <Boton variante="oro" onClick={() => setEditor({ open: true, editar: null })}>
              <Mas width={16} height={16} /> Trámite
            </Boton>
          </div>
        }
      />

      {/* Tu gente */}
      <SeccionTitulo>Tu gente y tus peludos</SeccionTitulo>

      {agregandoPersona && (
        <FormNuevaPersona onCerrar={() => setAgregandoPersona(false)} />
      )}

      {personas.length === 0 && !agregandoPersona ? (
        <p className="rounded-xl border border-[var(--hairline-soft)] bg-[var(--tinta-2)] px-4 py-3 text-sm text-gris-azul">
          Todavía no agregaste a nadie — usá el botón <strong className="text-marfil">Persona</strong> para empezar.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {personas.map((p) => (
            <TarjetaPersona
              key={p.id}
              persona={p}
              items={personaItems.filter((i) => i.personaId === p.id)}
            />
          ))}
        </div>
      )}

      {/* Trámites y pagos remotos */}
      <SeccionTitulo>Trámites y pagos remotos</SeccionTitulo>
      <WeeklyGroups
        items={tramites}
        renderItem={(a) => {
          const hecho = a.status === "done";
          const resp = a.metadata?.responsable as string | undefined;
          const recur = a.metadata?.recurrencia as string | undefined;
          return (
            <div className="group flex items-start gap-3 rounded-xl border border-[var(--hairline-soft)] bg-[var(--tinta)] p-3">
              <button type="button" onClick={() => setStatus(a.id, hecho ? "planned" : "done")}
                aria-pressed={hecho} aria-label={hecho ? "Marcar pendiente" : "Marcar hecho"}
                className={`mt-0.5 grid h-6 w-6 flex-shrink-0 place-items-center rounded-md border-2 ${
                  hecho ? "check-metal border-transparent text-noche" : "border-[var(--hairline)] text-transparent hover:border-laton"
                }`}>
                <Tilde width={14} height={14} />
              </button>
              <div className="min-w-0 flex-1">
                <p className={`font-serif text-base text-marfil ${hecho ? "line-through opacity-60" : ""}`}>{a.title}</p>
                {a.description && <p className="mt-0.5 text-sm text-gris-azul">{a.description}</p>}
                <div className="mt-2 flex flex-wrap items-center gap-1.5">
                  <PrioridadBadge priority={a.priority} />
                  <EstadoBadge status={a.status} />
                  {resp && <span className="rounded-full bg-[var(--casa-bg)] px-2 py-0.5 text-[0.7rem] text-casa">{resp}</span>}
                  {recur && <span className="text-xs text-gris-azul-dim">{recur}</span>}
                  <span className="text-xs text-gris-azul-dim">{fmtCorto(a.actionDate)}</span>
                </div>
              </div>
              <div className="flex flex-shrink-0 gap-1 opacity-60 group-hover:opacity-100">
                <button type="button" onClick={() => setEditor({ open: true, editar: a })} aria-label={`Editar ${a.title}`}
                  className="grid h-9 w-9 place-items-center rounded-lg text-gris-azul hover:bg-[var(--tinta-3)] hover:text-marfil">
                  <Lapiz width={16} height={16} />
                </button>
                <button type="button" onClick={() => softDeleteAction(a.id)} aria-label={`Borrar ${a.title}`}
                  className="grid h-9 w-9 place-items-center rounded-lg text-gris-azul hover:bg-[var(--tinta-3)] hover:text-peligro">
                  <Papelera width={16} height={16} />
                </button>
              </div>
            </div>
          );
        }}
      />

      <ActionEditor
        open={editor.open}
        onClose={() => setEditor({ open: false, editar: null })}
        fecha={new Date().toISOString().slice(0, 10)}
        editar={editor.editar}
        grupoInicial="home"
      />
    </div>
  );
}
