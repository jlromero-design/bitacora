/* Catálogo de categorías y subcategorías para registro de gastos.
   Sirve para viajes de estudio, trabajo y vacaciones. */

export interface CatalogoCategoria {
  id: string;
  nombre: string;
  emoji: string;
  colorToken: string; // clase CSS de color del sistema
  subcategorias: string[];
}

export const CATALOGO: CatalogoCategoria[] = [
  {
    id: "transporte",
    nombre: "Transporte",
    emoji: "✈️",
    colorToken: "destinos",
    subcategorias: [
      "Pasaje aéreo",
      "Pasaje de ómnibus",
      "Pasaje de tren",
      "Taxi",
      "Remis",
      "Uber / Cabify / DiDi",
      "Alquiler de vehículo",
      "Transporte público local",
      "Peaje",
      "Estacionamiento",
    ],
  },
  {
    id: "combustible",
    nombre: "Combustible",
    emoji: "⛽",
    colorToken: "pendientes",
    subcategorias: [
      "Nafta",
      "Gasoil",
      "Gas",
      "Mantenimiento del vehículo",
    ],
  },
  {
    id: "alojamiento",
    nombre: "Alojamiento",
    emoji: "🏨",
    colorToken: "casa",
    subcategorias: [
      "Hotel",
      "Hostel",
      "Airbnb",
      "Cabaña",
      "Camping",
      "Depósito o garantía",
      "Lavandería del alojamiento",
    ],
  },
  {
    id: "alimentacion",
    nombre: "Alimentación",
    emoji: "🍽️",
    colorToken: "habitos",
    subcategorias: [
      "Desayuno",
      "Almuerzo",
      "Cena",
      "Merienda",
      "Snacks",
      "Bebidas",
      "Delivery",
      "Propina",
    ],
  },
  {
    id: "supermercado",
    nombre: "Supermercado",
    emoji: "🛒",
    colorToken: "habitos",
    subcategorias: [
      "Alimentos",
      "Higiene personal",
      "Limpieza",
      "Varios",
    ],
  },
  {
    id: "estudio",
    nombre: "Estudio / Capacitación",
    emoji: "🎓",
    colorToken: "laton",
    subcategorias: [
      "Inscripción a evento",
      "Matrícula",
      "Curso",
      "Congreso",
      "Seminario",
      "Taller",
      "Certificación",
      "Material bibliográfico",
      "Fotocopias / Impresiones",
      "Papelería",
    ],
  },
  {
    id: "trabajo",
    nombre: "Trabajo",
    emoji: "💼",
    colorToken: "gris-azul",
    subcategorias: [
      "Reunión",
      "Gastos de representación",
      "Coworking",
      "Internet",
      "Equipamiento",
      "Herramienta digital",
      "Licencia de software",
    ],
  },
  {
    id: "turismo",
    nombre: "Turismo / Recreación",
    emoji: "🗺️",
    colorToken: "destinos",
    subcategorias: [
      "Excursión",
      "Entrada a museo",
      "Entrada a espectáculo",
      "Actividad deportiva",
      "Guía turístico",
      "Parque nacional",
      "Tour",
    ],
  },
  {
    id: "salud",
    nombre: "Salud",
    emoji: "🏥",
    colorToken: "peligro",
    subcategorias: [
      "Medicamento",
      "Consulta médica",
      "Seguro médico",
      "Seguro de viaje",
      "Emergencia médica",
    ],
  },
  {
    id: "comunicacion",
    nombre: "Comunicación",
    emoji: "📱",
    colorToken: "finanzas",
    subcategorias: [
      "Internet móvil",
      "Chip SIM",
      "Roaming",
      "Recarga telefónica",
    ],
  },
  {
    id: "compras",
    nombre: "Compras Personales",
    emoji: "🛍️",
    colorToken: "pendientes",
    subcategorias: [
      "Souvenir",
      "Ropa",
      "Regalo",
      "Tecnología",
      "Compra personal",
    ],
  },
  {
    id: "documentacion",
    nombre: "Documentación y Trámites",
    emoji: "📄",
    colorToken: "casa",
    subcategorias: [
      "Visa",
      "Pasaporte",
      "Certificado",
      "Tasa",
      "Legalización",
      "Impresión de documentos",
    ],
  },
  {
    id: "finanzas",
    nombre: "Finanzas",
    emoji: "💱",
    colorToken: "laton",
    subcategorias: [
      "Cambio de moneda",
      "Comisión bancaria",
      "Extracción",
      "Impuesto",
      "Gasto financiero",
    ],
  },
  {
    id: "imprevistos",
    nombre: "Imprevistos",
    emoji: "⚡",
    colorToken: "alerta",
    subcategorias: [
      "Multa",
      "Reparación",
      "Pérdida",
      "Emergencia",
      "Gasto no planificado",
    ],
  },
  {
    id: "otros",
    nombre: "Otros",
    emoji: "📦",
    colorToken: "gris-azul",
    subcategorias: [
      "Otros (con descripción)",
    ],
  },
];

/** Devuelve la categoría del catálogo por su id. */
export function categoriaById(id: string): CatalogoCategoria | undefined {
  return CATALOGO.find((c) => c.id === id);
}
