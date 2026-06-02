/* ════════════════════════════════════════════════════════════
   Datos de ejemplo — el viaje real de Vale. Todo editable.
   IDs y timestamps fijos para una semilla reproducible.
   ════════════════════════════════════════════════════════════ */
import type { AppData } from "./types";

const T = "2026-06-01T12:00:00.000Z"; // timestamp base de la semilla

const base = { createdAt: T, updatedAt: T, deletedAt: null };

export function seedData(): AppData {
  return {
    settings: {
      secondaryTimezone: "Europe/London",
      secondaryLabel: "ENG",
      localLabel: "AR",
      zodiac: "leo",
      birthday: "08-03",
    },
    trip: {
      id: "trip-1",
      ...base,
      title: "Europa 2026 — tesis y aventura",
      startsOn: "2026-06-05",
      endsOn: "2026-08-08",
      baseCurrency: "ARS",
      notes: "65 días. Buenos Aires → Londres → Escocia → Países Bajos → Barcelona.",
    },
    destinations: [
      {
        id: "dest-bsas", ...base, tripId: "trip-1", name: "Buenos Aires",
        country: "Argentina", province: "CABA", city: "Buenos Aires",
        timezone: "America/Argentina/Buenos_Aires", currency: "ARS",
        startsOn: "2026-06-05", endsOn: "2026-06-08",
        accommodation: "Casa", sortOrder: 0,
      },
      {
        id: "dest-londres", ...base, tripId: "trip-1", name: "Londres",
        country: "Reino Unido", province: "Inglaterra", city: "Londres",
        timezone: "Europe/London", currency: "GBP",
        startsOn: "2026-06-09", endsOn: "2026-07-01",
        accommodation: "Airbnb en Camden", sortOrder: 1,
      },
      {
        id: "dest-escocia", ...base, tripId: "trip-1", name: "Escocia",
        country: "Reino Unido", province: "Escocia", city: "Edimburgo",
        timezone: "Europe/London", currency: "GBP",
        startsOn: "2026-07-02", endsOn: "2026-07-18",
        accommodation: "B&B en Old Town", sortOrder: 2,
      },
      {
        id: "dest-paisesbajos", ...base, tripId: "trip-1", name: "Países Bajos",
        country: "Países Bajos", province: "Holanda Septentrional", city: "Ámsterdam",
        timezone: "Europe/Amsterdam", currency: "EUR",
        startsOn: "2026-07-19", endsOn: "2026-07-28",
        accommodation: "Hotel canal-side", sortOrder: 3,
      },
      {
        id: "dest-barcelona", ...base, tripId: "trip-1", name: "Barcelona",
        country: "España", province: "Cataluña", city: "Barcelona",
        timezone: "Europe/Madrid", currency: "EUR",
        startsOn: "2026-07-29", endsOn: "2026-08-08",
        accommodation: "Apto en el Born", sortOrder: 4,
      },
    ],
    actions: [
      {
        id: "act-1", ...base, tripId: "trip-1", destinationId: "dest-bsas",
        group: "agenda", kind: "logistica", title: "Empaque final y lista de control",
        description: "Documentos, medicamentos, cargadores, adaptadores UK. Revisar seguro.",
        actionDate: "2026-06-05", startsAt: "10:00", endsAt: "12:00",
        status: "planned", priority: "high", amount: null, currency: null,
        metadata: {},
      },
      {
        id: "act-2", ...base, tripId: "trip-1", destinationId: "dest-bsas",
        group: "home", title: "Almuerzo despedida con la familia",
        description: "Casa de mamá y papá. Llevar los regalitos.",
        actionDate: "2026-06-05", startsAt: "13:00", endsAt: "16:00",
        status: "confirmed", priority: "medium", amount: null, currency: null,
        metadata: {},
      },
      {
        id: "act-3", ...base, tripId: "trip-1", destinationId: "dest-bsas",
        group: "finance", title: "Cambio de divisas (libras en efectivo)",
        description: "Algo de efectivo para los primeros días en Londres.",
        actionDate: "2026-06-05", startsAt: "16:30", endsAt: null,
        status: "planned", priority: "medium", amount: 200, currency: "GBP",
        metadata: {},
      },
      {
        id: "act-4", ...base, tripId: "trip-1", destinationId: "dest-bsas",
        group: "agenda", kind: "vuelo", title: "Vuelo a Londres",
        description: "Vuelo directo. Llevar el bolso de mano liviano.",
        actionDate: "2026-06-05", startsAt: "23:50", endsAt: "16:10",
        status: "confirmed", priority: "critical", amount: null, currency: null,
        metadata: {
          flightNumber: "AR1100",
          checkInTime: "20:50",
          airportFrom: "EZE — Ezeiza",
          airportTo: "LHR — Heathrow",
          arrivalDate: "2026-06-06",
        },
      },
      {
        id: "act-5", ...base, tripId: "trip-1", destinationId: "dest-londres",
        group: "agenda", kind: "academico", title: "Reunión con directora de tesis",
        description: "Avance del capítulo 3. Llevar borrador impreso.",
        actionDate: "2026-06-12", startsAt: "11:00", endsAt: "12:30",
        status: "planned", priority: "high", amount: null, currency: null,
        metadata: {},
      },
      {
        id: "act-6", ...base, tripId: "trip-1", destinationId: "dest-londres",
        group: "agenda", title: "Museo Británico",
        description: "Entrada gratuita. Reservar franja horaria online.",
        actionDate: "2026-06-13", startsAt: "10:00", endsAt: "14:00",
        status: "planned", priority: "low", amount: null, currency: null,
        metadata: {},
      },
      {
        id: "act-7", ...base, tripId: "trip-1", destinationId: "dest-londres",
        group: "finance", title: "Cena en Borough Market",
        description: "",
        actionDate: "2026-06-13", startsAt: "20:00", endsAt: null,
        status: "planned", priority: "low", amount: 28, currency: "GBP",
        metadata: {},
      },
      // Pendientes (task) — sin hora, con vencimiento en metadata
      {
        id: "act-t1", ...base, tripId: "trip-1", destinationId: null,
        group: "task", title: "Enviar formulario de revisión de tesis al director",
        description: "Subir el PDF firmado al campus.",
        actionDate: "2026-06-15", startsAt: null, endsAt: null,
        status: "planned", priority: "critical", amount: null, currency: null,
        metadata: {},
      },
      {
        id: "act-t2", ...base, tripId: "trip-1", destinationId: null,
        group: "task", title: "Comparar y reservar tren Londres → Edimburgo",
        description: "LNER vs trenes baratos. Reservar con anticipación.",
        actionDate: "2026-06-25", startsAt: null, endsAt: null,
        status: "in_progress", priority: "high", amount: null, currency: null,
        metadata: {},
      },
      // En casa (home)
      {
        id: "act-h1", ...base, tripId: "trip-1", destinationId: null,
        group: "home", title: "Pago de expensas del departamento",
        description: "Débito automático — verificar que salga.",
        actionDate: "2026-07-01", startsAt: null, endsAt: null,
        status: "planned", priority: "high", amount: null, currency: null,
        metadata: { responsable: "Pablito", recurrencia: "mensual" },
      },
      {
        id: "act-h2", ...base, tripId: "trip-1", destinationId: null,
        group: "home", title: "Indi 🐶 — control veterinario",
        description: "Rosa la lleva. Pedir foto.",
        actionDate: "2026-06-20", startsAt: "17:00", endsAt: null,
        status: "planned", priority: "medium", amount: null, currency: null,
        metadata: { responsable: "Rosa" },
      },
    ],
    history: [],
    categories: [
      { id: "cat-aloj", ...base, tripId: "trip-1", name: "Alojamiento", colorToken: "finanzas", plannedAmount: 3000000, currency: "ARS", sortOrder: 0 },
      { id: "cat-transp-int", ...base, tripId: "trip-1", name: "Transporte internacional", colorToken: "destinos", plannedAmount: 1200000, currency: "ARS", sortOrder: 1 },
      { id: "cat-transp-loc", ...base, tripId: "trip-1", name: "Transporte local", colorToken: "casa", plannedAmount: 600000, currency: "ARS", sortOrder: 2 },
      { id: "cat-comida", ...base, tripId: "trip-1", name: "Comida", colorToken: "habitos", plannedAmount: 2000000, currency: "ARS", sortOrder: 3 },
      { id: "cat-museos", ...base, tripId: "trip-1", name: "Museos y entradas", colorToken: "pendientes", plannedAmount: 500000, currency: "ARS", sortOrder: 4 },
      { id: "cat-excursiones", ...base, tripId: "trip-1", name: "Excursiones", colorToken: "habitos", plannedAmount: 800000, currency: "ARS", sortOrder: 5 },
      { id: "cat-regalos", ...base, tripId: "trip-1", name: "Regalos", colorToken: "finanzas", plannedAmount: 400000, currency: "ARS", sortOrder: 6 },
      { id: "cat-tesis", ...base, tripId: "trip-1", name: "Estudios / investigación", colorToken: "destinos", plannedAmount: 300000, currency: "ARS", sortOrder: 7 },
    ],
    expenses: [
      { id: "exp-1", ...base, tripId: "trip-1", actionId: null, categoryId: "cat-aloj", destinationId: "dest-londres", spentOn: "2026-06-09", title: "Airbnb Camden (seña)", amount: 320, currency: "GBP", amountBase: 652800, baseCurrency: "ARS" },
      { id: "exp-2", ...base, tripId: "trip-1", actionId: "act-7", categoryId: "cat-comida", destinationId: "dest-londres", spentOn: "2026-06-13", title: "Cena Borough Market", amount: 28, currency: "GBP", amountBase: 57120, baseCurrency: "ARS" },
      { id: "exp-3", ...base, tripId: "trip-1", actionId: null, categoryId: "cat-transp-loc", destinationId: "dest-londres", spentOn: "2026-06-10", title: "Oyster card recarga", amount: 40, currency: "GBP", amountBase: 81600, baseCurrency: "ARS" },
    ],
    rates: [
      { id: "r-usd-of", baseCurrency: "ARS", quoteCurrency: "USD", rate: 1350, rateKind: "official", sourceType: "manual", sourceName: "Carga inicial", validAt: T },
      { id: "r-usd-tj", baseCurrency: "ARS", quoteCurrency: "USD", rate: 1755, rateKind: "tarjeta", sourceType: "manual", sourceName: "Carga inicial", validAt: T },
      { id: "r-usd-mep", baseCurrency: "ARS", quoteCurrency: "USD", rate: 1480, rateKind: "mep", sourceType: "manual", sourceName: "Carga inicial", validAt: T },
      { id: "r-eur-tj", baseCurrency: "ARS", quoteCurrency: "EUR", rate: 1910, rateKind: "tarjeta", sourceType: "manual", sourceName: "Carga inicial", validAt: T },
      { id: "r-eur-of", baseCurrency: "ARS", quoteCurrency: "EUR", rate: 1470, rateKind: "official", sourceType: "manual", sourceName: "Carga inicial", validAt: T },
      { id: "r-gbp-tj", baseCurrency: "ARS", quoteCurrency: "GBP", rate: 2040, rateKind: "tarjeta", sourceType: "manual", sourceName: "Carga inicial", validAt: T },
      { id: "r-gbp-of", baseCurrency: "ARS", quoteCurrency: "GBP", rate: 1700, rateKind: "official", sourceType: "manual", sourceName: "Carga inicial", validAt: T },
    ],
    habits: [
      { id: "hab-1", ...base, tripId: "trip-1", name: "Meditación matutina", description: "10 min al despertar", targetPerWeek: 7, colorToken: "habitos", icon: "sol" },
      { id: "hab-2", ...base, tripId: "trip-1", name: "Avance de tesis", description: "Al menos un párrafo", targetPerWeek: 5, colorToken: "habitos", icon: "pluma" },
      { id: "hab-3", ...base, tripId: "trip-1", name: "Caminata diaria", description: "Explorar la ciudad a pie", targetPerWeek: 6, colorToken: "habitos", icon: "caminar" },
      { id: "hab-4", ...base, tripId: "trip-1", name: "Práctica de inglés", description: "20 min", targetPerWeek: 5, colorToken: "habitos", icon: "idioma" },
      { id: "hab-5", ...base, tripId: "trip-1", name: "Registro de gastos", description: "Cargar lo del día", targetPerWeek: 7, colorToken: "habitos", icon: "moneda" },
    ],
    habitLogs: seedHabitLogs(),
    reminders: [
      { id: "rem-1", ...base, actionId: "act-t1", remindAt: "2026-06-14T09:00:00.000Z", title: "Formulario de tesis vence mañana", message: "Subir PDF firmado", isSeen: false },
      { id: "rem-2", ...base, actionId: "act-4", remindAt: "2026-06-05T20:00:00.000Z", title: "Check-in vuelo a Londres", message: "Abrir app de la aerolínea", isSeen: false },
      { id: "rem-3", ...base, actionId: "act-h1", remindAt: "2026-06-30T10:00:00.000Z", title: "Verificar pago de expensas", message: "", isSeen: false },
    ],
    notes: [
      {
        id: "note-1", dayKey: "2026-06-05",
        text: "¡Arranca la aventura! Respirar hondo antes del caos del aeropuerto.",
        createdAt: T, updatedAt: T, tz: "America/Argentina/Buenos_Aires",
      },
    ],
    budgets: [
      { id: "bud-m1", scope: "month", periodKey: "2026-06", name: "Junio — total", amount: 1200000, currency: "ARS", categoryId: null },
      { id: "bud-w1", scope: "week", periodKey: "2026-W24", name: "Semana en Londres", amount: 300000, currency: "ARS", categoryId: null },
      { id: "bud-d1", scope: "day", periodKey: "2026-06-13", name: "Día de museos", amount: 45000, currency: "ARS", categoryId: "cat-comida" },
    ],
  };
}

/** Genera logs de hábitos para los últimos ~14 días desde la semilla. */
function seedHabitLogs() {
  const logs: AppData["habitLogs"] = [];
  const patrones: Record<string, number[]> = {
    "hab-1": [1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
    "hab-2": [0, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1],
    "hab-3": [1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 0],
    "hab-4": [0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1],
    "hab-5": [1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 1],
  };
  const desde = new Date("2026-06-05T12:00:00");
  for (const [habitId, dias] of Object.entries(patrones)) {
    dias.forEach((v, i) => {
      const d = new Date(desde);
      d.setDate(d.getDate() - (dias.length - 1 - i));
      const key = d.toISOString().slice(0, 10);
      if (v)
        logs.push({ id: `hl-${habitId}-${i}`, habitId, loggedOn: key, value: true });
    });
  }
  return logs;
}
