"use client";
import { useState } from "react";
import { useStore } from "@/lib/store";
import { rachaActual, mejorRacha, progresoSemana, logueado } from "@/lib/selectors";
import {
  semanaDe, todayKey, fmtDiaSemana, diaDelMes, gridMes, fromKey, toKey,
} from "@/lib/dates";
import type { Habit } from "@/lib/types";
import { PageHeader, Boton, Sheet, Campo, inputClase, SeccionTitulo } from "@/components/ui";
import { Mas, Papelera, Brillo, Tilde, HABIT_ICONS } from "@/components/icons";

type Vista = "semana" | "mes";

export default function HabitosPage() {
  const { data, ready, toggleHabit, addHabit, softDeleteHabit } = useStore();
  const [vista, setVista] = useState<Vista>("semana");
  const [nuevo, setNuevo] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "sol", targetPerWeek: 7 });

  if (!ready) return null;
  const habitos = data.habits.filter((h) => !h.deletedAt);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <PageHeader
        titulo="Hábitos"
        sub="Sostené el ritmo, sin presión"
        accion={<Boton variante="oro" onClick={() => setNuevo(true)}><Mas width={16} height={16} /> Nuevo</Boton>}
      />

      {/* Selector de vista */}
      <div className="flex gap-1.5" role="group" aria-label="Vista">
        {(["semana", "mes"] as Vista[]).map((v) => (
          <button key={v} type="button" onClick={() => setVista(v)} aria-pressed={vista === v}
            className={`rounded-full border px-4 py-1.5 text-sm capitalize transition-colors ${
              vista === v ? "border-laton bg-[var(--laton-tenue)] text-laton-claro" : "border-[var(--hairline-soft)] text-gris-azul hover:text-marfil"
            }`}>
            {v === "semana" ? "Semana" : "Mes"}
          </button>
        ))}
      </div>

      <SeccionTitulo>{vista === "semana" ? "Esta semana" : "Este mes"}</SeccionTitulo>

      <div className="flex flex-col gap-3">
        {habitos.map((h) =>
          vista === "semana" ? (
            <HabitSemana key={h.id} habit={h} data={data} onToggle={toggleHabit} onDelete={softDeleteHabit} />
          ) : (
            <HabitMes key={h.id} habit={h} data={data} onToggle={toggleHabit} onDelete={softDeleteHabit} />
          ),
        )}
      </div>

      <Sheet open={nuevo} onClose={() => setNuevo(false)} titulo="Nuevo hábito">
        <Campo label="Ícono" htmlFor="h-icon-grp">
          <div id="h-icon-grp" className="flex flex-wrap gap-2" role="group" aria-label="Elegir ícono">
            {Object.entries(HABIT_ICONS).map(([key, Icon]) => (
              <button key={key} type="button" onClick={() => setForm({ ...form, icon: key })}
                aria-pressed={form.icon === key} aria-label={key}
                className={`grid h-10 w-10 place-items-center rounded-xl border ${
                  form.icon === key ? "border-laton text-laton-claro bg-[var(--laton-tenue)]" : "border-[var(--hairline-soft)] text-gris-azul hover:text-marfil"
                }`}>
                <Icon width={18} height={18} />
              </button>
            ))}
          </div>
        </Campo>
        <Campo label="Nombre" htmlFor="h-name">
          <input id="h-name" className={inputClase} value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ej: Meditar" />
        </Campo>
        <Campo label="Veces por semana" htmlFor="h-target">
          <input id="h-target" type="number" min={1} max={7} className={inputClase} value={form.targetPerWeek}
            onChange={(e) => setForm({ ...form, targetPerWeek: +e.target.value })} />
        </Campo>
        <div className="flex justify-end gap-2">
          <Boton variante="fantasma" onClick={() => setNuevo(false)}>Cancelar</Boton>
          <Boton variante="oro" onClick={() => {
            if (form.name.trim()) { addHabit(form); setForm({ name: "", icon: "sol", targetPerWeek: 7 }); setNuevo(false); }
          }}>Crear</Boton>
        </div>
      </Sheet>
    </div>
  );
}

function HabitHeader({ habit, data, onDelete }: { habit: Habit; data: ReturnType<typeof useStore>["data"]; onDelete: (id: string) => void }) {
  const Icon = HABIT_ICONS[habit.icon ?? "sol"] ?? HABIT_ICONS.sol;
  const racha = rachaActual(data, habit.id);
  return (
    <div className="mb-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--habitos-bg)] text-habitos" aria-hidden="true">
          <Icon width={18} height={18} />
        </span>
        <div>
          <p className="font-serif text-base text-marfil">{habit.name}</p>
          {habit.description && <p className="text-xs text-gris-azul">{habit.description}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 rounded-full bg-[var(--habitos-bg)] px-2.5 py-1 text-xs font-semibold text-habitos" role="status">
          <Brillo width={12} height={12} /> {racha} {racha === 1 ? "día" : "días"}
        </span>
        <button type="button" onClick={() => { if (confirm(`¿Eliminar el hábito «${habit.name}»?`)) onDelete(habit.id); }}
          aria-label={`Eliminar hábito ${habit.name}`}
          className="grid h-8 w-8 place-items-center rounded-lg text-gris-azul-dim hover:bg-[var(--tinta-3)] hover:text-peligro">
          <Papelera width={15} height={15} />
        </button>
      </div>
    </div>
  );
}

function HabitSemana({ habit, data, onToggle, onDelete }: {
  habit: Habit; data: ReturnType<typeof useStore>["data"]; onToggle: (h: string, d: string) => void; onDelete: (id: string) => void;
}) {
  const semana = semanaDe(todayKey());
  const hoy = todayKey();
  const best = mejorRacha(data, habit.id);
  const { hechos, objetivo } = progresoSemana(data, habit);
  const pct = Math.round((hechos / objetivo) * 100);

  return (
    <div className="carta rounded-2xl p-4">
      <HabitHeader habit={habit} data={data} onDelete={onDelete} />
      <div className="flex items-center justify-between gap-2" role="group" aria-label={`Últimos 7 días de ${habit.name}`}>
        {semana.map((k) => {
          const done = logueado(data, habit.id, k);
          const esHoy = k === hoy;
          return (
            <button key={k} type="button" onClick={() => onToggle(habit.id, k)} aria-pressed={done}
              aria-label={`${fmtDiaSemana(k)} ${diaDelMes(k)}: ${done ? "hecho" : "pendiente"}`}
              className={`flex h-11 flex-1 flex-col items-center justify-center rounded-xl border-2 text-[0.6rem] uppercase transition-colors ${
                done ? "check-metal text-noche border-transparent" : esHoy ? "border-laton text-laton-claro" : "border-[var(--hairline-soft)] text-gris-azul-dim hover:border-laton"
              }`}>
              <span>{fmtDiaSemana(k).slice(0, 1)}</span>
              <span className="text-xs font-semibold">{diaDelMes(k)}</span>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-gris-azul">
        <span>Semana: <strong className="text-marfil">{hechos}/{objetivo}</strong> ({pct}%)</span>
        <span>Mejor racha: <strong className="text-marfil">{best} días</strong></span>
      </div>
    </div>
  );
}

function HabitMes({ habit, data, onToggle, onDelete }: {
  habit: Habit; data: ReturnType<typeof useStore>["data"]; onToggle: (h: string, d: string) => void; onDelete: (id: string) => void;
}) {
  const hoy = todayKey();
  const mesCursor = fromKey(hoy);
  const semanas = gridMes(mesCursor);
  const mesNum = mesCursor.getMonth();
  // % del mes: días logueados / días del mes
  const diasMes = semanas.flat().filter((k) => fromKey(k).getMonth() === mesNum);
  const hechos = diasMes.filter((k) => logueado(data, habit.id, k)).length;
  const pct = Math.round((hechos / diasMes.length) * 100);

  return (
    <div className="carta rounded-2xl p-4">
      <HabitHeader habit={habit} data={data} onDelete={onDelete} />
      <div className="grid grid-cols-7 gap-1" role="group" aria-label={`Mes de ${habit.name}`}>
        {semanas.flat().map((k) => {
          const fueraMes = fromKey(k).getMonth() !== mesNum;
          const done = logueado(data, habit.id, k);
          const esHoy = k === hoy;
          return (
            <button key={k} type="button" onClick={() => onToggle(habit.id, k)} aria-pressed={done}
              aria-label={`${diaDelMes(k)}: ${done ? "hecho" : "pendiente"}`}
              className={`grid aspect-square min-h-[30px] place-items-center rounded-lg text-[0.65rem] transition-colors ${
                done ? "check-metal text-noche" : esHoy ? "border border-laton text-laton-claro" : "text-gris-azul-dim hover:bg-[var(--tinta-3)]"
              } ${fueraMes ? "opacity-25" : ""}`}>
              {done ? <Tilde width={12} height={12} /> : diaDelMes(k)}
            </button>
          );
        })}
      </div>
      <div className="mt-3 text-xs text-gris-azul">
        Mes: <strong className="text-marfil">{hechos}/{diasMes.length}</strong> días ({pct}%)
      </div>
    </div>
  );
}
