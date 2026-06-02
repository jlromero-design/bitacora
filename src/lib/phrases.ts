/* ════════════════════════════════════════════════════════════
   Frases de crecimiento personal y profesional. Cambian día a día
   (determinístico por fecha) y se orientan según el signo.
   ════════════════════════════════════════════════════════════ */
import { fromKey } from "./dates";

const GENERALES = [
  "Crecer también es soltar lo que ya cumplió su función.",
  "Tu ritmo es válido aunque no se parezca al de nadie más.",
  "Lo que hacés con constancia hoy, mañana es tu base.",
  "Pedir ayuda es una forma de inteligencia, no de debilidad.",
  "El descanso no se gana: es parte del trabajo bien hecho.",
  "Cada número que ordenás es una historia que aclarás.",
  "Equivocarte con honestidad vale más que acertar de casualidad.",
  "No tenés que tenerlo todo resuelto para empezar.",
  "Tu criterio se afina cada vez que decidís y observás el resultado.",
  "Avanzar despacio sigue siendo avanzar.",
  "Guardá energía para lo que de verdad mueve la aguja.",
  "Lo simple sostenido le gana a lo perfecto abandonado.",
  "Confiá en el proceso que ya te trajo hasta acá.",
  "La claridad llega cuando te animás a escribir lo que pensás.",
  "Tu trabajo importa incluso cuando nadie lo aplaude.",
];

const POR_SIGNO: Record<string, string[]> = {
  aries: ["Tu impulso abre caminos; sumale paciencia y serán tuyos.", "Empezar es tu superpoder: hoy iniciá algo chico."],
  tauro: ["Tu constancia es raíz: lo que cuidás, florece.", "Date el gusto sin culpa, te lo trabajaste."],
  geminis: ["Tu curiosidad es capital: anotá esa idea suelta.", "Una conversación hoy puede ordenarte la cabeza."],
  cancer: ["Cuidás a todos; hoy cuidate a vos primero.", "Tu intuición también es un dato válido."],
  leo: ["Brillás cuando creás desde el corazón, no desde el aplauso.", "Tu generosidad vuelve; dejala fluir sin medir.", "Liderás mejor cuando te permitís descansar."],
  virgo: ["Tu detalle es valioso; no dejes que se vuelva exigencia.", "Hecho y prolijo le gana a perfecto e infinito."],
  libra: ["El equilibrio se elige cada día, no se encuentra.", "Decidir también es un acto de cuidado propio."],
  escorpio: ["Tu profundidad transforma; confiá en tu instinto.", "Soltar control a veces abre la mejor puerta."],
  sagitario: ["Cada viaje te enseña algo que ningún libro da.", "Tu optimismo es brújula: seguila con los pies en la tierra."],
  capricornio: ["Tu disciplina construye montañas, paso a paso.", "Permitite celebrar los logros antes del próximo objetivo."],
  acuario: ["Tu mirada distinta es justo lo que falta en la mesa.", "Innovar también es animarte a hacerlo a tu manera."],
  piscis: ["Tu sensibilidad es talento, no fragilidad.", "Date espacio para soñar: de ahí salen tus mejores ideas."],
};

/** Hash simple y estable de un string → entero no negativo */
function hash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

export function fraseDelDia(dayKey: string, zodiac?: string): string {
  const signo = zodiac && POR_SIGNO[zodiac] ? zodiac : "leo";
  const pool = [...GENERALES, ...(POR_SIGNO[signo] ?? [])];
  // índice determinístico por día (combina fecha + signo)
  const dia = fromKey(dayKey).getTime();
  const idx = (Math.floor(dia / 86_400_000) + hash(signo)) % pool.length;
  return pool[idx];
}

export const ZODIAC_LABEL: Record<string, string> = {
  aries: "Aries", tauro: "Tauro", geminis: "Géminis", cancer: "Cáncer",
  leo: "Leo", virgo: "Virgo", libra: "Libra", escorpio: "Escorpio",
  sagitario: "Sagitario", capricornio: "Capricornio", acuario: "Acuario", piscis: "Piscis",
};
