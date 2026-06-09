/* ════════════════════════════════════════════════════════════
   Países → provincias → ciudades con zona horaria y moneda.
   Sirve para los selects en cascada de Destinos.
   ════════════════════════════════════════════════════════════ */
import type { Currency } from "./types";

export interface Pais {
  nombre: string;
  currency: Currency;
  timezone: string;
  provincias: string[];
  ciudades: Record<string, string[]>; // provincia → ciudades
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
    ciudades: {
      "CABA": ["Buenos Aires"],
      "Buenos Aires": ["La Plata", "Mar del Plata", "Bahía Blanca", "Quilmes", "Tandil", "Necochea", "Pinamar", "Villa Gesell"],
      "Córdoba": ["Córdoba", "Villa Carlos Paz", "Alta Gracia", "Río Cuarto", "Villa General Belgrano", "La Falda"],
      "Santa Fe": ["Rosario", "Santa Fe", "Rafaela", "Venado Tuerto"],
      "Mendoza": ["Mendoza", "San Rafael", "Malargüe", "Luján de Cuyo"],
      "Tucumán": ["San Miguel de Tucumán", "Tafí del Valle", "Yerba Buena"],
      "Salta": ["Salta", "Cafayate", "San Lorenzo", "Purmamarca"],
      "Entre Ríos": ["Paraná", "Concordia", "Gualeguaychú", "Colón"],
      "Misiones": ["Posadas", "Iguazú", "Oberá"],
      "Neuquén": ["Neuquén", "San Martín de los Andes", "Bariloche", "Villa La Angostura"],
      "Río Negro": ["Viedma", "Bariloche", "El Bolsón", "Cipolletti"],
      "Chubut": ["Rawson", "Puerto Madryn", "Comodoro Rivadavia", "Esquel"],
      "Santa Cruz": ["Río Gallegos", "El Calafate", "El Chaltén"],
      "Tierra del Fuego": ["Ushuaia", "Río Grande"],
    },
  },
  {
    nombre: "Reino Unido",
    currency: "GBP",
    timezone: "Europe/London",
    provincias: ["Inglaterra", "Escocia", "Gales", "Irlanda del Norte"],
    ciudades: {
      "Inglaterra": ["Londres", "Manchester", "Liverpool", "Birmingham", "Bristol", "Oxford", "Cambridge", "Bath", "York", "Brighton"],
      "Escocia": ["Edimburgo", "Glasgow", "Aberdeen", "Inverness", "Dundee"],
      "Gales": ["Cardiff", "Swansea", "Newport"],
      "Irlanda del Norte": ["Belfast", "Londonderry"],
    },
  },
  {
    nombre: "Países Bajos",
    currency: "EUR",
    timezone: "Europe/Amsterdam",
    provincias: [
      "Holanda Septentrional", "Holanda Meridional", "Utrecht", "Frisia",
      "Güeldres", "Brabante Septentrional", "Limburgo", "Overijssel",
    ],
    ciudades: {
      "Holanda Septentrional": ["Ámsterdam", "Haarlem", "Alkmaar", "Zaandam"],
      "Holanda Meridional": ["Rotterdam", "La Haya", "Delft", "Leiden"],
      "Utrecht": ["Utrecht", "Amersfoort"],
      "Frisia": ["Leeuwarden", "Sneek"],
      "Güeldres": ["Arnhem", "Nimega"],
      "Brabante Septentrional": ["Eindhoven", "Tilburg", "s-Hertogenbosch", "Breda"],
      "Limburgo": ["Maastricht", "Venlo"],
      "Overijssel": ["Enschede", "Zwolle", "Deventer"],
    },
  },
  {
    nombre: "España",
    currency: "EUR",
    timezone: "Europe/Madrid",
    provincias: [
      "Cataluña", "Madrid", "Andalucía", "Comunidad Valenciana", "País Vasco",
      "Galicia", "Castilla y León", "Aragón", "Islas Baleares", "Islas Canarias",
    ],
    ciudades: {
      "Cataluña": ["Barcelona", "Girona", "Tarragona", "Lleida", "Sitges", "Figueres"],
      "Madrid": ["Madrid", "Alcalá de Henares", "Aranjuez", "Toledo"],
      "Andalucía": ["Sevilla", "Granada", "Málaga", "Córdoba", "Cádiz", "Almería"],
      "Comunidad Valenciana": ["Valencia", "Alicante", "Castellón", "Benidorm"],
      "País Vasco": ["Bilbao", "San Sebastián", "Vitoria"],
      "Galicia": ["Santiago de Compostela", "Vigo", "A Coruña", "Pontevedra"],
      "Castilla y León": ["Salamanca", "Burgos", "Valladolid", "Segovia", "Ávila", "León"],
      "Aragón": ["Zaragoza", "Teruel", "Huesca"],
      "Islas Baleares": ["Palma de Mallorca", "Ibiza", "Mahón", "Formentera"],
      "Islas Canarias": ["Las Palmas de Gran Canaria", "Santa Cruz de Tenerife", "Lanzarote", "Fuerteventura"],
    },
  },
  {
    nombre: "Portugal",
    currency: "EUR",
    timezone: "Europe/Lisbon",
    provincias: ["Lisboa", "Oporto", "Algarve", "Madeira", "Azores", "Coímbra"],
    ciudades: {
      "Lisboa": ["Lisboa", "Cascais", "Sintra", "Setúbal"],
      "Oporto": ["Oporto", "Braga", "Guimarães", "Viana do Castelo"],
      "Algarve": ["Faro", "Albufeira", "Lagos", "Portimão", "Tavira"],
      "Madeira": ["Funchal", "Câmara de Lobos"],
      "Azores": ["Ponta Delgada", "Angra do Heroísmo"],
      "Coímbra": ["Coímbra", "Aveiro", "Viseu"],
    },
  },
  {
    nombre: "Francia",
    currency: "EUR",
    timezone: "Europe/Paris",
    provincias: ["Isla de Francia", "Provenza", "Occitania", "Normandía", "Bretaña"],
    ciudades: {
      "Isla de Francia": ["París", "Versalles", "Fontainebleau"],
      "Provenza": ["Marsella", "Niza", "Cannes", "Aix-en-Provence", "Aviñón"],
      "Occitania": ["Toulouse", "Montpellier", "Nîmes", "Carcasona"],
      "Normandía": ["Rouen", "Caen", "Le Havre", "Mont-Saint-Michel"],
      "Bretaña": ["Rennes", "Brest", "Nantes", "Saint-Malo"],
    },
  },
  {
    nombre: "Italia",
    currency: "EUR",
    timezone: "Europe/Rome",
    provincias: ["Lacio", "Lombardía", "Toscana", "Véneto", "Campania", "Sicilia"],
    ciudades: {
      "Lacio": ["Roma", "Tívoli", "Civitavecchia"],
      "Lombardía": ["Milán", "Bérgamo", "Brescia", "Como", "Mantua", "Cremona"],
      "Toscana": ["Florencia", "Siena", "Pisa", "Lucca", "Arezzo", "San Gimignano"],
      "Véneto": ["Venecia", "Verona", "Padua", "Vicenza", "Treviso"],
      "Campania": ["Nápoles", "Pompeya", "Amalfi", "Positano", "Capri"],
      "Sicilia": ["Palermo", "Catania", "Siracusa", "Agrigento", "Taormina"],
    },
  },
  {
    nombre: "Estados Unidos",
    currency: "USD",
    timezone: "America/New_York",
    provincias: ["Nueva York", "California", "Florida", "Illinois", "Texas"],
    ciudades: {
      "Nueva York": ["Nueva York", "Buffalo", "Albany"],
      "California": ["Los Ángeles", "San Francisco", "San Diego", "Sacramento", "San José"],
      "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville"],
      "Illinois": ["Chicago", "Springfield"],
      "Texas": ["Houston", "Austin", "Dallas", "San Antonio"],
    },
  },
];

export function buscarPais(nombre: string): Pais | undefined {
  return PAISES.find((p) => p.nombre === nombre);
}

export function ciudadesDeProvincia(pais: Pais | undefined, provincia: string): string[] {
  if (!pais || !provincia) return [];
  return pais.ciudades[provincia] ?? [];
}
