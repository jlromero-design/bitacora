"use client";
import { useMemo, useState } from "react";
import { addMonths } from "date-fns";
import { useStore } from "@/lib/store";
import {
  tasasActuales, presupuestoDePeriodo, gastosDePeriodo, gastosListaPeriodo,
} from "@/lib/selectors";
import {
  fmtMoneda, BANDERA, SIMBOLO, convertir,
  estimarCostoReal, IMPUESTOS_DEFAULT, type ConfigImpuestos,
} from "@/lib/fx";
import {
  fmtLargo, etiquetaSemana, etiquetaMes, periodKeyDe, sumarDias, mesKey, toKey, fromKey,
} from "@/lib/dates";
import { fetchLiveRates } from "@/lib/quotes";
import type { Currency, RateKind, BudgetScope } from "@/lib/types";
import { CATALOGO, categoriaById } from "@/lib/categorias";
import { PageHeader, SeccionTitulo, Boton, Campo, inputClase, Sheet } from "@/components/ui";
import { Cambio, Mas, Papelera } from "@/components/icons";

const KINDS: { value: RateKind; label: string }[] = [
  { value: "official", label: "Oficial" },
  { value: "tarjeta", label: "Tarjeta" },
  { value: "mep", label: "MEP" },
  { value: "blue", label: "Blue" },
  { value: "manual", label: "Manual" },
];

export default function FinanzasPage() {
  const { ready } = useStore();
  const [tab, setTab] = useState<"presupuesto" | "cotizaciones">("presupuesto");

  if (!ready) return null;

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-5">
      <PageHeader titulo="Finanzas" sub="Tu plata, clara y sin sorpresas" />

      {/* Solapas */}
      <div className="flex gap-1.5 border-b border-[var(--hairline-soft)]" role="tablist" aria-label="Secciones de finanzas">
        {([["presupuesto", "Presupuesto"], ["cotizaciones", "Cotizaciones · tarjetas"]] as const).map(([v, l]) => (
          <button key={v} role="tab" aria-selected={tab === v} onClick={() => setTab(v)}
            className={`-mb-px border-b-2 px-4 py-2.5 font-display text-xs uppercase tracking-wide transition-colors ${
              tab === v ? "border-laton text-laton-claro" : "border-transparent text-gris-azul hover:text-marfil"
            }`}>
            {l}
          </button>
        ))}
      </div>

      {tab === "presupuesto" ? <Presupuesto /> : <Cotizaciones />}
    </div>
  );
}

/* ════════ TAB PRESUPUESTO ════════ */
function Presupuesto() {
  const { data, addBudget, deleteBudget, addExpense } = useStore();
  const [scope, setScope] = useState<BudgetScope>("month");
  const [ref, setRef] = useState<string>(() => toKey(new Date()));
  const [popup, setPopup] = useState<null | "gasto" | "presupuesto">(null);

  const tasas = useMemo(() => tasasActuales(data, "tarjeta"), [data]);
  const periodKey = periodKeyDe(scope, ref);
  const asignado = presupuestoDePeriodo(data, scope, periodKey, tasas);
  const gastado = gastosDePeriodo(data, scope, periodKey, tasas);
  const lista = gastosListaPeriodo(data, scope, periodKey);
  const budgets = data.budgets.filter((b) => b.scope === scope && b.periodKey === periodKey);
  const pct = asignado > 0 ? Math.min((gastado / asignado) * 100, 100) : 0;
  const exceso = gastado > asignado && asignado > 0;

  function navegar(dir: number) {
    if (scope === "day") setRef(sumarDias(ref, dir));
    else if (scope === "week") setRef(sumarDias(ref, dir * 7));
    else setRef(toKey(addMonths(fromKey(ref), dir)));
  }

  const etiqueta =
    scope === "day" ? fmtLargo(ref) : scope === "week" ? `Semana del ${etiquetaSemana(ref)}` : etiquetaMes(mesKey(ref));

  return (
    <div className="flex flex-col gap-4">
      {/* Selector de período */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex gap-1.5" role="group" aria-label="Alcance del presupuesto">
          {(["day", "week", "month"] as BudgetScope[]).map((s) => (
            <button key={s} type="button" onClick={() => setScope(s)} aria-pressed={scope === s}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                scope === s ? "border-laton bg-[var(--laton-tenue)] text-laton-claro" : "border-[var(--hairline-soft)] text-gris-azul hover:text-marfil"
              }`}>
              {s === "day" ? "Día" : s === "week" ? "Semana" : "Mes"}
            </button>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => navegar(-1)} className="grid h-8 w-8 place-items-center rounded-lg text-laton hover:bg-[var(--tinta-3)]" aria-label="Período anterior">‹</button>
          <span className="min-w-[10rem] text-center text-sm capitalize text-marfil">{etiqueta}</span>
          <button type="button" onClick={() => navegar(1)} className="grid h-8 w-8 place-items-center rounded-lg text-laton hover:bg-[var(--tinta-3)]" aria-label="Período siguiente">›</button>
        </div>
      </div>

      {/* Resumen */}
      <div className="carta borde-metal rounded-2xl p-5">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gris-azul">Gastado</p>
            <p className={`font-display text-2xl font-bold ${exceso ? "text-peligro" : "text-laton-claro"}`}>{fmtMoneda(gastado, "ARS")}</p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-gris-azul">Asignado</p>
            <p className="font-display text-lg text-marfil">{fmtMoneda(asignado, "ARS")}</p>
          </div>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-[var(--tinta)]" role="progressbar"
          aria-valuenow={Math.round(pct)} aria-valuemin={0} aria-valuemax={100} aria-label={`${Math.round(pct)}% del presupuesto usado`}>
          <div className="h-full rounded-full transition-[width] duration-500"
            style={{ width: `${exceso ? 100 : pct}%`, background: exceso ? "var(--peligro)" : "linear-gradient(90deg, var(--tinta-3), var(--laton))" }} />
        </div>
        {asignado > 0 && (
          <p className="mt-2 text-xs text-gris-azul">
            {exceso ? "Te pasaste por " : "Te queda "}
            <strong className={exceso ? "text-peligro" : "text-marfil"}>{fmtMoneda(Math.abs(asignado - gastado), "ARS")}</strong>
          </p>
        )}
      </div>

      {/* Acciones */}
      <div className="flex flex-wrap gap-2">
        <Boton variante="oro" onClick={() => setPopup("gasto")}><Mas width={16} height={16} /> Cargar gasto</Boton>
        <Boton variante="primario" onClick={() => setPopup("presupuesto")}><Mas width={16} height={16} /> Asignar presupuesto</Boton>
      </div>

      {/* Asignaciones del período */}
      {budgets.length > 0 && (
        <div className="carta rounded-2xl p-4">
          <SeccionTitulo>Asignado este {scope === "day" ? "día" : scope === "week" ? "semana" : "mes"}</SeccionTitulo>
          <ul className="mt-2 flex flex-col gap-1.5">
            {budgets.map((b) => (
              <li key={b.id} className="flex items-center gap-2 rounded-lg border border-[var(--hairline-soft)] bg-[var(--tinta)] px-3 py-2 text-sm">
                <span className="flex-1 text-marfil">{b.name}</span>
                <span className="text-laton-claro">{fmtMoneda(b.amount, b.currency)}</span>
                <button type="button" onClick={() => deleteBudget(b.id)} aria-label={`Borrar ${b.name}`}
                  className="grid h-7 w-7 place-items-center rounded-lg text-gris-azul-dim hover:text-peligro"><Papelera width={14} height={14} /></button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gastos del período */}
      <div className="carta rounded-2xl p-4">
        <SeccionTitulo>Gastos del período</SeccionTitulo>
        {lista.length === 0 ? (
          <p className="mt-3 text-center font-serif text-sm italic text-gris-azul">Sin gastos cargados acá todavía.</p>
        ) : (
          <ul className="mt-2 flex flex-col gap-1.5">
            {lista.map((e) => {
              const cat = e.categoria ? categoriaById(e.categoria) : undefined;
              return (
                <li key={e.id} className="flex items-center gap-2 rounded-lg border border-[var(--hairline-soft)] bg-[var(--tinta)] px-3 py-2 text-sm">
                  {cat && (
                    <span className="text-base" aria-hidden="true">{cat.emoji}</span>
                  )}
                  <div className="min-w-0 flex-1">
                    <span className="text-marfil">{e.title}</span>
                    {(cat || e.subcategoria) && (
                      <p className="text-xs text-gris-azul">
                        {cat?.nombre}{e.subcategoria ? ` · ${e.subcategoria}` : ""}
                      </p>
                    )}
                    <span className="text-xs text-gris-azul-dim">{e.spentOn}</span>
                  </div>
                  <span className="text-finanzas shrink-0">{fmtMoneda(e.amount, e.currency)}</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {popup && (
        <CargaPopup
          modo={popup}
          scope={scope}
          periodKey={periodKey}
          refDate={ref}
          categorias={data.categories.filter((c) => !c.deletedAt)}
          tasas={tasas}
          onClose={() => setPopup(null)}
          onGasto={addExpense}
          onPresupuesto={addBudget}
        />
      )}
    </div>
  );
}

function CargaPopup({
  modo, scope, periodKey, refDate, categorias, tasas, onClose, onGasto, onPresupuesto,
}: {
  modo: "gasto" | "presupuesto";
  scope: BudgetScope;
  periodKey: string;
  refDate: string;
  categorias: ReturnType<typeof useStore>["data"]["categories"];
  tasas: ReturnType<typeof tasasActuales>;
  onClose: () => void;
  onGasto: ReturnType<typeof useStore>["addExpense"];
  onPresupuesto: ReturnType<typeof useStore>["addBudget"];
}) {
  const [f, setF] = useState({
    title: "", amount: "", currency: "ARS" as Currency,
    spentOn: refDate, categoryId: "",
    categoria: "", subcategoria: "",
  });

  const catActual = f.categoria ? categoriaById(f.categoria) : undefined;

  function setCat(id: string) {
    setF((prev) => ({ ...prev, categoria: id, subcategoria: "" }));
  }

  function guardar() {
    const amount = parseFloat(f.amount);
    if (!f.title.trim() || !amount) return;
    if (modo === "gasto") {
      onGasto({
        title: f.title.trim(), amount, currency: f.currency, spentOn: f.spentOn,
        amountBase: convertir(amount, f.currency, "ARS", tasas),
        baseCurrency: "ARS", categoryId: f.categoryId || null,
        categoria: f.categoria || undefined,
        subcategoria: f.subcategoria || undefined,
      });
    } else {
      onPresupuesto({
        scope, periodKey, name: f.title.trim(), amount, currency: f.currency,
        categoryId: f.categoryId || null,
      });
    }
    onClose();
  }

  const titulo = modo === "gasto" ? "Cargar gasto" : `Asignar presupuesto (${scope === "day" ? "día" : scope === "week" ? "semana" : "mes"})`;

  return (
    <Sheet open onClose={onClose} titulo={titulo}>
      <Campo label={modo === "gasto" ? "Descripción" : "Nombre"} htmlFor="cp-title">
        <input id="cp-title" className={inputClase} value={f.title}
          onChange={(e) => setF({ ...f, title: e.target.value })}
          placeholder={modo === "gasto" ? "Ej: Café en Soho" : "Ej: Comida de la semana"} />
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Monto" htmlFor="cp-amount">
          <input id="cp-amount" type="number" inputMode="decimal" className={inputClase} value={f.amount}
            onChange={(e) => setF({ ...f, amount: e.target.value })} />
        </Campo>
        <Campo label="Moneda" htmlFor="cp-cur">
          <select id="cp-cur" className={inputClase} value={f.currency} onChange={(e) => setF({ ...f, currency: e.target.value as Currency })}>
            {(["ARS", "USD", "EUR", "GBP"] as Currency[]).map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </Campo>
      </div>

      {modo === "gasto" && (
        <Campo label="Fecha" htmlFor="cp-date">
          <input id="cp-date" type="date" className={inputClase} value={f.spentOn} onChange={(e) => setF({ ...f, spentOn: e.target.value })} />
        </Campo>
      )}

      {/* Selector de categoría del catálogo — solo para gastos */}
      {modo === "gasto" && (
        <>
          <Campo label="Categoría" htmlFor="cp-cat-select">
            <select
              id="cp-cat-select"
              className={inputClase}
              value={f.categoria}
              onChange={(e) => setCat(e.target.value)}
            >
              <option value="">— Sin categoría —</option>
              {CATALOGO.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.emoji} {c.nombre}
                </option>
              ))}
            </select>
          </Campo>

          {catActual && catActual.subcategorias.length > 0 && (
            <Campo label="Subcategoría" htmlFor="cp-subcat">
              <select
                id="cp-subcat"
                className={inputClase}
                value={f.subcategoria}
                onChange={(e) => setF({ ...f, subcategoria: e.target.value })}
              >
                <option value="">— General —</option>
                {catActual.subcategorias.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </Campo>
          )}
        </>
      )}

      <div className="flex justify-end gap-2">
        <Boton variante="fantasma" onClick={onClose}>Cancelar</Boton>
        <Boton variante="oro" onClick={guardar}>Guardar</Boton>
      </div>
    </Sheet>
  );
}

/* ════════ TAB COTIZACIONES ════════ */
function Cotizaciones() {
  const { data, upsertRate } = useStore();
  const [kind, setKind] = useState<RateKind>("tarjeta");
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const tasas = useMemo(() => tasasActuales(data, kind), [data, kind]);

  async function actualizarMercado() {
    setCargando(true);
    setAviso(null);
    try {
      const { rates, at } = await fetchLiveRates();
      if (rates.length === 0) throw new Error("sin datos");
      rates.forEach((r) => upsertRate({ ...r, sourceType: "api" }));
      setAviso(`Actualizado del mercado · ${new Date(at).toLocaleString("es-AR")}`);
    } catch {
      setAviso("No se pudo actualizar (sin conexión). Se mantiene el último valor cargado.");
    } finally {
      setCargando(false);
    }
  }

  const delKind = data.rates.filter((r) => r.rateKind === kind);

  return (
    <div className="flex flex-col gap-5">
      {/* Mercado en vivo */}
      <div className="carta rounded-2xl p-4">
        <div className="flex flex-wrap items-center gap-3">
          <Boton variante="oro" onClick={actualizarMercado} disabled={cargando}>
            {cargando ? "Actualizando…" : "Actualizar del mercado"}
          </Boton>
          <p className="text-xs text-gris-azul">Fuente: dolarapi.com · open.er-api.com</p>
        </div>
        {aviso && <p className="mt-2 text-xs text-laton-claro">{aviso}</p>}
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <Conversor tasas={tasas} />
        <Estimador tasas={tasas} />
      </div>

      {/* Selector de tipo + lista editable */}
      <div className="carta rounded-2xl p-5">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-laton-claro">Cotizaciones</h2>
          <div className="ml-auto flex flex-wrap gap-1.5" role="group" aria-label="Tipo de cotización">
            {KINDS.map((k) => (
              <button key={k.value} type="button" onClick={() => setKind(k.value)} aria-pressed={kind === k.value}
                className={`rounded-full border px-3 py-1 text-xs transition-colors ${
                  kind === k.value ? "border-laton bg-[var(--laton-tenue)] text-laton-claro" : "border-[var(--hairline-soft)] text-gris-azul hover:text-marfil"
                }`}>
                {k.label}
              </button>
            ))}
          </div>
        </div>

        {delKind.length === 0 ? (
          <p className="font-serif text-sm italic text-gris-azul">No hay cotización «{kind}». Actualizá del mercado o cargá manual.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {delKind.map((r) => (
              <div key={r.id} className="flex items-center gap-3 rounded-xl border border-[var(--hairline-soft)] bg-[var(--tinta)] px-3 py-2">
                <span className="w-20 text-sm text-marfil">{BANDERA[r.quoteCurrency]} {r.quoteCurrency}</span>
                <label className="sr-only" htmlFor={`rate-${r.id}`}>Cotización {r.quoteCurrency} {kind}</label>
                <input id={`rate-${r.id}`} type="number" defaultValue={r.rate} className={`${inputClase} flex-1`}
                  onBlur={(e) => { const v = parseFloat(e.target.value); if (v && v !== r.rate) upsertRate({ id: r.id, rate: v, sourceType: "manual", sourceName: "Edición manual" }); }} />
                <span className="text-[0.65rem] text-gris-azul-dim">{r.sourceType === "api" ? r.sourceName : "manual"}</span>
              </div>
            ))}
          </div>
        )}

        <CargarCotizacion kind={kind} onGuardar={upsertRate} />
      </div>

      <InfoMonedas tasas={tasasActuales(data, "tarjeta")} />
    </div>
  );
}

const MONEDA_INFO: { cur: Currency; nombre: string; nota: string }[] = [
  { cur: "ARS", nombre: "Peso argentino", nota: "Moneda de referencia del viaje." },
  { cur: "USD", nombre: "Dólar estadounidense", nota: "Útil como puente entre monedas." },
  { cur: "EUR", nombre: "Euro", nota: "Países Bajos y España." },
  { cur: "GBP", nombre: "Libra esterlina", nota: "Inglaterra y Escocia." },
];

function InfoMonedas({ tasas }: { tasas: ReturnType<typeof tasasActuales> }) {
  return (
    <div className="carta rounded-2xl p-5">
      <SeccionTitulo>Monedas del viaje</SeccionTitulo>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {MONEDA_INFO.map((m) => (
          <div key={m.cur} className="rounded-xl border border-[var(--hairline-soft)] bg-[var(--tinta)] p-3">
            <p className="flex items-center gap-2 text-marfil">
              <span>{BANDERA[m.cur]}</span> <strong>{m.cur}</strong> · {m.nombre}
            </p>
            {m.cur !== "ARS" && (
              <p className="mt-1 text-sm text-laton-claro">1 {m.cur} ≈ {fmtMoneda(tasas[m.cur], "ARS")} <span className="text-gris-azul-dim">(tarjeta)</span></p>
            )}
            <p className="mt-0.5 text-xs text-gris-azul">{m.nota}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Conversor ── */
function Conversor({ tasas }: { tasas: ReturnType<typeof tasasActuales> }) {
  const [valor, setValor] = useState("100000");
  const [de, setDe] = useState<Currency>("ARS");
  const monedas: Currency[] = ["ARS", "USD", "EUR", "GBP"];
  const num = parseFloat(valor) || 0;

  return (
    <section className="carta rounded-2xl p-5" aria-label="Conversor multimoneda">
      <div className="mb-4 flex items-center gap-2 text-laton-claro">
        <Cambio width={18} height={18} />
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide">Conversor</h2>
      </div>
      <div className="flex gap-2">
        <label htmlFor="conv-monto" className="sr-only">Monto a convertir</label>
        <input id="conv-monto" type="number" inputMode="decimal" className={inputClase} value={valor} onChange={(e) => setValor(e.target.value)} />
        <label htmlFor="conv-moneda" className="sr-only">Moneda de origen</label>
        <select id="conv-moneda" className={`${inputClase} w-28`} value={de} onChange={(e) => setDe(e.target.value as Currency)}>
          {monedas.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="mt-4 rounded-xl border border-[var(--hairline-soft)] bg-[var(--tinta)] p-4" aria-live="polite">
        {monedas.map((m) => (
          <div key={m} className="flex items-center justify-between border-b border-[var(--hairline-soft)] py-2 last:border-0">
            <span className="text-sm text-gris-azul">{BANDERA[m]} {m}</span>
            <span className={`font-sans font-semibold ${m === de ? "text-laton-claro" : "text-marfil"}`}>{fmtMoneda(convertir(num, de, m, tasas), m)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Estimador ── */
function Estimador({ tasas }: { tasas: ReturnType<typeof tasasActuales> }) {
  const [monto, setMonto] = useState("100");
  const [moneda, setMoneda] = useState<Currency>("GBP");
  const [cfg, setCfg] = useState<ConfigImpuestos>(IMPUESTOS_DEFAULT);
  const num = parseFloat(monto) || 0;
  const d = estimarCostoReal(num, moneda, tasas, cfg);

  return (
    <section className="carta rounded-2xl p-5" aria-label="Estimador de costo real en pesos">
      <SeccionTitulo>Costo real en ARS</SeccionTitulo>
      <div className="mt-3 flex gap-2">
        <label htmlFor="est-monto" className="sr-only">Monto en moneda local</label>
        <input id="est-monto" type="number" inputMode="decimal" className={inputClase} value={monto} onChange={(e) => setMonto(e.target.value)} />
        <label htmlFor="est-moneda" className="sr-only">Moneda local</label>
        <select id="est-moneda" className={`${inputClase} w-28`} value={moneda} onChange={(e) => setMoneda(e.target.value as Currency)}>
          {(["GBP", "EUR", "USD"] as Currency[]).map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        <Campo label="Percep. Gan. %" htmlFor="cfg-gan"><input id="cfg-gan" type="number" className={inputClase} value={cfg.percepcionGanancias} onChange={(e) => setCfg({ ...cfg, percepcionGanancias: +e.target.value })} /></Campo>
        <Campo label="Imp. PAÍS %" htmlFor="cfg-pais"><input id="cfg-pais" type="number" className={inputClase} value={cfg.impuestoPais} onChange={(e) => setCfg({ ...cfg, impuestoPais: +e.target.value })} /></Campo>
        <Campo label="IVA dest. %" htmlFor="cfg-iva"><input id="cfg-iva" type="number" className={inputClase} value={cfg.ivaDestino} onChange={(e) => setCfg({ ...cfg, ivaDestino: +e.target.value })} /></Campo>
      </div>
      <div className="mt-1 rounded-xl border border-[var(--hairline-soft)] bg-[var(--tinta)] p-4 text-sm" aria-live="polite">
        <Fila label="Base (a ARS)" valor={fmtMoneda(d.base, "ARS")} />
        <Fila label={`Percepción Ganancias (${cfg.percepcionGanancias}%)`} valor={fmtMoneda(d.percepcion, "ARS")} />
        {cfg.impuestoPais > 0 && <Fila label={`Impuesto PAÍS (${cfg.impuestoPais}%)`} valor={fmtMoneda(d.pais, "ARS")} />}
        <div className="mt-2 flex justify-between border-t border-[var(--hairline)] pt-2 font-semibold text-marfil">
          <span>Total estimado</span><span className="text-laton-claro">{fmtMoneda(d.total, "ARS")}</span>
        </div>
        <div className="mt-1 flex justify-between text-habitos">
          <span>Tax-Free estimado (IVA {cfg.ivaDestino}%)</span><span>+ {fmtMoneda(d.taxFreeEstimado, moneda)}</span>
        </div>
      </div>
      <p className="mt-3 rounded-lg border-l-2 border-laton bg-[var(--laton-tenue)] px-3 py-2 font-serif text-xs italic text-marfil-dim">
        Las alícuotas sobre consumos en el exterior varían según el medio de pago y cambian seguido. Estimación orientativa, no asesoramiento fiscal.
      </p>
    </section>
  );
}

function CargarCotizacion({ kind, onGuardar }: { kind: RateKind; onGuardar: ReturnType<typeof useStore>["upsertRate"] }) {
  const { data } = useStore();
  const faltantes = (["USD", "EUR", "GBP"] as Currency[]).filter((m) => !data.rates.some((r) => r.rateKind === kind && r.quoteCurrency === m));
  const [mon, setMon] = useState<Currency>(faltantes[0] ?? "USD");
  const [val, setVal] = useState("");
  if (faltantes.length === 0) return null;

  return (
    <div className="mt-4 flex items-end gap-2 border-t border-[var(--hairline-soft)] pt-4">
      <Campo label="Moneda" htmlFor="nc-mon">
        <select id="nc-mon" className={`${inputClase} w-24`} value={mon} onChange={(e) => setMon(e.target.value as Currency)}>
          {faltantes.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </Campo>
      <Campo label={`ARS por 1 ${mon}`} htmlFor="nc-val">
        <input id="nc-val" type="number" className={inputClase} value={val} onChange={(e) => setVal(e.target.value)} placeholder={SIMBOLO.ARS} />
      </Campo>
      <Boton variante="oro" className="mb-3" onClick={() => { const v = parseFloat(val); if (v) { onGuardar({ quoteCurrency: mon, rate: v, rateKind: kind, sourceType: "manual", sourceName: "Carga manual" }); setVal(""); } }}>Cargar</Boton>
    </div>
  );
}

function Fila({ label, valor }: { label: string; valor: string }) {
  return (
    <div className="flex justify-between py-0.5 text-gris-azul">
      <span>{label}</span><span className="text-marfil-dim">{valor}</span>
    </div>
  );
}
