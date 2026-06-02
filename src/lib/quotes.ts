/* ════════════════════════════════════════════════════════════
   Cotizaciones del momento desde fuentes públicas trazables.
   USD: dolarapi.com (oficial, tarjeta, blue, bolsa→MEP).
   EUR/GBP: cruce con open.er-api.com (tasas USD).
   Si falla, el llamador conserva el último valor y avisa.
   ════════════════════════════════════════════════════════════ */
import type { Currency, RateKind } from "./types";

export interface LiveRate {
  quoteCurrency: Currency;
  rate: number;
  rateKind: RateKind;
  sourceName: string;
}

const CASA_KIND: Record<string, RateKind> = {
  oficial: "official",
  tarjeta: "tarjeta",
  blue: "blue",
  bolsa: "mep",
};

export async function fetchLiveRates(): Promise<{ rates: LiveRate[]; at: string }> {
  const out: LiveRate[] = [];
  let usdOficial = 0;
  let usdTarjeta = 0;

  // USD desde dolarapi
  const dolares: Array<{ casa: string; venta: number; compra: number }> = await fetch(
    "https://dolarapi.com/v1/dolares",
  ).then((r) => r.json());

  for (const d of dolares) {
    const kind = CASA_KIND[d.casa];
    if (!kind) continue;
    const rate = d.venta || d.compra;
    out.push({ quoteCurrency: "USD", rate, rateKind: kind, sourceName: `dolarapi · ${d.casa}` });
    if (d.casa === "oficial") usdOficial = rate;
    if (d.casa === "tarjeta") usdTarjeta = rate;
  }

  // EUR/GBP por cruce con tasas USD
  try {
    const fx: { rates: Record<string, number> } = await fetch(
      "https://open.er-api.com/v6/latest/USD",
    ).then((r) => r.json());
    const usdPorEur = fx.rates?.EUR ? 1 / fx.rates.EUR : 0;
    const usdPorGbp = fx.rates?.GBP ? 1 / fx.rates.GBP : 0;
    const cruces: Array<[Currency, number]> = [["EUR", usdPorEur], ["GBP", usdPorGbp]];
    for (const [cur, usdPor] of cruces) {
      if (usdPor && usdOficial) out.push({ quoteCurrency: cur, rate: usdOficial * usdPor, rateKind: "official", sourceName: "dolarapi × er-api" });
      if (usdPor && usdTarjeta) out.push({ quoteCurrency: cur, rate: usdTarjeta * usdPor, rateKind: "tarjeta", sourceName: "dolarapi × er-api" });
    }
  } catch {
    /* sin cruce EUR/GBP: igual devolvemos USD */
  }

  return { rates: out, at: new Date().toISOString() };
}
