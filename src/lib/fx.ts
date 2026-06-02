/* ════════════════════════════════════════════════════════════
   Moneda y conversión — formato es-AR, conversor multimoneda y
   estimador de costo real en ARS (impuestos configurables).
   ════════════════════════════════════════════════════════════ */
import type { Currency, ExchangeRate } from "./types";

export const SIMBOLO: Record<Currency, string> = {
  ARS: "$",
  USD: "US$",
  EUR: "€",
  GBP: "£",
};

export const BANDERA: Record<Currency, string> = {
  ARS: "🇦🇷",
  USD: "🇺🇸",
  EUR: "🇪🇺",
  GBP: "🇬🇧",
};

export const MONEDA_LABEL: Record<Currency, string> = {
  ARS: "Peso argentino",
  USD: "Dólar estadounidense",
  EUR: "Euro",
  GBP: "Libra esterlina",
};

const LOCALE_MONEDA: Record<Currency, string> = {
  ARS: "es-AR",
  USD: "en-US",
  EUR: "de-DE",
  GBP: "en-GB",
};

export function fmtMoneda(valor: number, moneda: Currency, decimales = 2): string {
  return new Intl.NumberFormat(LOCALE_MONEDA[moneda], {
    style: "currency",
    currency: moneda,
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valor || 0);
}

export function fmtNumero(valor: number, decimales = 0): string {
  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  }).format(valor || 0);
}

/**
 * Mapa de tasas: cuántos ARS vale 1 unidad de cada moneda.
 * Construido desde la lista de exchange_rates (base ARS por moneda).
 */
export type TasasARS = Record<Currency, number>;

export function construirTasas(rates: ExchangeRate[], kind = "tarjeta"): TasasARS {
  const base: TasasARS = { ARS: 1, USD: 0, EUR: 0, GBP: 0 };
  // tomamos la tasa más reciente por moneda/kind preferido
  for (const m of ["USD", "EUR", "GBP"] as Currency[]) {
    const candidatas = rates
      .filter((r) => r.quoteCurrency === m)
      .sort((a, b) => +new Date(b.validAt) - +new Date(a.validAt));
    const preferida =
      candidatas.find((r) => r.rateKind === kind) ?? candidatas[0];
    if (preferida) base[m] = preferida.rate;
  }
  return base;
}

/** Convierte `valor` de `de` a `a` usando tasas en ARS. */
export function convertir(valor: number, de: Currency, a: Currency, tasas: TasasARS): number {
  const enArs = valor * (tasas[de] || 1);
  return enArs / (tasas[a] || 1);
}

/* ── Estimador impositivo argentino (configurable, orientativo) ── */
export interface ConfigImpuestos {
  /** % percepción a cuenta de Ganancias/Bienes (consumos en el exterior) */
  percepcionGanancias: number; // ej 30
  /** % impuesto adicional / PAIS si aplica (configurable, puede ser 0) */
  impuestoPais: number; // ej 0
  /** IVA del destino, solo referencia/Tax-Free */
  ivaDestino: number; // ej 20 (UK) / 21 (UE)
}

export const IMPUESTOS_DEFAULT: ConfigImpuestos = {
  percepcionGanancias: 30,
  impuestoPais: 0,
  ivaDestino: 20,
};

export interface DesgloseCosto {
  base: number; // ARS sin impuestos
  percepcion: number;
  pais: number;
  total: number; // ARS final estimado
  taxFreeEstimado: number; // recupero potencial en moneda local
}

export function estimarCostoReal(
  montoLocal: number,
  monedaLocal: Currency,
  tasas: TasasARS,
  cfg: ConfigImpuestos,
): DesgloseCosto {
  const base = convertir(montoLocal, monedaLocal, "ARS", tasas);
  const percepcion = base * (cfg.percepcionGanancias / 100);
  const pais = base * (cfg.impuestoPais / 100);
  const total = base + percepcion + pais;
  // Tax-Free: aproximación del IVA contenido recuperable (orientativo)
  const taxFreeEstimado =
    montoLocal - montoLocal / (1 + cfg.ivaDestino / 100);
  return { base, percepcion, pais, total, taxFreeEstimado };
}
