/* ════════════════════════════════════════════════════════════
   Países y provincias/regiones con zona horaria y moneda por
   defecto. Sirve para los selects en cascada de Destinos.
   ════════════════════════════════════════════════════════════ */
import type { Currency } from "./types";

export interface Pais {
  nombre: string;
  currency: Currency;
  timezone: string;
  provincias: string[];
}

export const PAISES: Pais[] = [
  {
    nombre: "Argentina",
    currency: "ARS",
    timezone: "America/Argentina/Buenos_Aires",
    provincias: [
      "CABA", "Buenos Aires", "Córdoba", "Santa Fe", "Mendoza", "Tucumán",
      "Salta", "Entre Ríos", "Misiones", "Neuquén", "Río Negro", "Chubut",
      "Santa Cruz", "Tierra del Fuego",
    ],
  },
  {
    nombre: "Reino Unido",
    currency: "GBP",
    timezone: "Europe/London",
    provincias: ["Inglaterra", "Escocia", "Gales", "Irlanda del Norte"],
  },
  {
    nombre: "Países Bajos",
    currency: "EUR",
    timezone: "Europe/Amsterdam",
    provincias: [
      "Holanda Septentrional", "Holanda Meridional", "Utrecht", "Frisia",
      "Güeldres", "Brabante Septentrional", "Limburgo", "Overijssel",
    ],
  },
  {
    nombre: "España",
    currency: "EUR",
    timezone: "Europe/Madrid",
    provincias: [
      "Cataluña", "Madrid", "Andalucía", "Comunidad Valenciana", "País Vasco",
      "Galicia", "Castilla y León", "Aragón", "Islas Baleares", "Islas Canarias",
    ],
  },
  {
    nombre: "Portugal",
    currency: "EUR",
    timezone: "Europe/Lisbon",
    provincias: ["Lisboa", "Oporto", "Algarve", "Madeira", "Azores", "Coímbra"],
  },
  {
    nombre: "Francia",
    currency: "EUR",
    timezone: "Europe/Paris",
    provincias: ["Isla de Francia", "Provenza", "Occitania", "Normandía", "Bretaña"],
  },
  {
    nombre: "Italia",
    currency: "EUR",
    timezone: "Europe/Rome",
    provincias: ["Lacio", "Lombardía", "Toscana", "Véneto", "Campania", "Sicilia"],
  },
  {
    nombre: "Estados Unidos",
    currency: "USD",
    timezone: "America/New_York",
    provincias: ["Nueva York", "California", "Florida", "Illinois", "Texas"],
  },
];

export function buscarPais(nombre: string): Pais | undefined {
  return PAISES.find((p) => p.nombre === nombre);
}
