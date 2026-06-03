/* Íconos SVG originales — sin dependencias externas. */
import type { SVGProps } from "react";

type P = SVGProps<SVGSVGElement>;

const base = (props: P) => ({
  width: 20,
  height: 20,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  ...props,
});

/** Sello-emblema: brújula */
export function Brujula(props: P) {
  return (
    <svg {...base({ ...props, strokeWidth: 1.3 })} aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="7" strokeDasharray="1.5 2.5" opacity="0.5" />
      <polygon points="12,5 13.4,12 12,11 10.6,12" fill="currentColor" stroke="none" />
      <polygon points="12,19 13.4,12 12,13 10.6,12" fill="currentColor" stroke="none" opacity="0.45" />
      <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    </svg>
  );
}

export const Agenda = (p: P) => (
  <svg {...base(p)} aria-hidden="true">
    <rect x="3.5" y="4.5" width="17" height="16" rx="2.5" />
    <line x1="8" y1="2.5" x2="8" y2="6.5" />
    <line x1="16" y1="2.5" x2="16" y2="6.5" />
    <line x1="3.5" y1="9.5" x2="20.5" y2="9.5" />
  </svg>
);

export const Finanzas = (p: P) => (
  <svg {...base(p)} aria-hidden="true">
    <circle cx="12" cy="12" r="9.2" />
    <line x1="12" y1="6" x2="12" y2="7.8" />
    <line x1="12" y1="16.2" x2="12" y2="18" />
    <path d="M9.3 10.2C9.3 8.9 10.5 8 12 8s2.7 .9 2.7 2.1-1 1.7-2.7 2.1-2.7 .9-2.7 2.1 1.2 2.1 2.7 2.1 2.7-.9 2.7-2.1" />
  </svg>
);

export const Habitos = (p: P) => (
  <svg {...base(p)} aria-hidden="true">
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="M8 12.2l2.6 2.6L16.5 9" />
  </svg>
);

export const Pendientes = (p: P) => (
  <svg {...base(p)} aria-hidden="true">
    <path d="M9 4h6a1 1 0 0 1 1 1v0a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1v0a1 1 0 0 1 1-1z" />
    <path d="M8 5H6a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
    <path d="M8.5 12l2 2 3.5-3.8" />
  </svg>
);

export const Casa = (p: P) => (
  <svg {...base(p)} aria-hidden="true">
    <path d="M3.5 11.5L12 4l8.5 7.5" />
    <path d="M5.5 10v9.5h5v-5h3v5h5V10" />
  </svg>
);

export const Destinos = (p: P) => (
  <svg {...base(p)} aria-hidden="true">
    <circle cx="12" cy="9.5" r="3" />
    <path d="M12 21.5C12 21.5 5 15.5 5 9.5a7 7 0 0 1 14 0c0 6-7 12-7 12z" />
  </svg>
);

export const Papelera = (p: P) => (
  <svg {...base(p)} aria-hidden="true">
    <path d="M4 7h16" />
    <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    <path d="M6 7l1 13a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-13" />
    <line x1="10" y1="11" x2="10" y2="18" />
    <line x1="14" y1="11" x2="14" y2="18" />
  </svg>
);

export const Menu = (p: P) => (
  <svg {...base(p)} aria-hidden="true">
    <line x1="4" y1="7" x2="20" y2="7" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <line x1="4" y1="17" x2="20" y2="17" />
  </svg>
);

export const Cerrar = (p: P) => (
  <svg {...base(p)} aria-hidden="true">
    <line x1="6" y1="6" x2="18" y2="18" />
    <line x1="18" y1="6" x2="6" y2="18" />
  </svg>
);

export const Flecha = (p: P) => (
  <svg {...base(p)} aria-hidden="true">
    <polyline points="9 6 15 12 9 18" />
  </svg>
);

export const Mas = (p: P) => (
  <svg {...base(p)} aria-hidden="true">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

export const Reloj = (p: P) => (
  <svg {...base(p)} aria-hidden="true">
    <circle cx="12" cy="12" r="8.5" />
    <polyline points="12 7.5 12 12 15 13.5" />
  </svg>
);

export const Campana = (p: P) => (
  <svg {...base(p)} aria-hidden="true">
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </svg>
);

export const Lapiz = (p: P) => (
  <svg {...base(p)} aria-hidden="true">
    <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z" />
  </svg>
);

export const Tilde = (p: P) => (
  <svg {...base(p)} aria-hidden="true">
    <polyline points="5 12.5 10 17.5 19 6.5" />
  </svg>
);

export const Cambio = (p: P) => (
  <svg {...base(p)} aria-hidden="true">
    <path d="M4 8h13l-3-3" />
    <path d="M20 16H7l3 3" />
  </svg>
);

/* ── Íconos de hábitos ── */
export const Sol = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" /></svg>
);
export const Pluma = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><path d="M20 4C13 4 8 9 5 16l-1 4 4-1c7-3 12-8 12-15z" /><path d="M5 19c3-4 6-7 10-9" /></svg>
);
export const Caminar = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><circle cx="13" cy="4" r="1.6" /><path d="M11 8l-2 5 3 2 1 6M13 9l3 2 3-1M9 13l-3 1-1 5" /></svg>
);
export const Idioma = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.6 2.5 15 0 18M12 3c-2.5 2.6-2.5 15 0 18" /></svg>
);
export const Moneda = Finanzas;
export const Gota = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><path d="M12 3s6 6 6 10a6 6 0 0 1-12 0c0-4 6-10 6-10z" /></svg>
);
export const Luna = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><path d="M20 14a8 8 0 1 1-9.5-9.8A6.5 6.5 0 0 0 20 14z" /></svg>
);
export const Libro = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><path d="M4 5a2 2 0 0 1 2-2h6v16H6a2 2 0 0 0-2 2zM20 5a2 2 0 0 0-2-2h-6v16h6a2 2 0 0 1 2 2z" /></svg>
);
export const Corazon = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><path d="M12 20s-7-4.5-9.5-9C1 8 2.5 4.5 6 4.5c2 0 3.2 1.2 4 2.3.8-1.1 2-2.3 4-2.3 3.5 0 5 3.5 3.5 6.5C19 15.5 12 20 12 20z" /></svg>
);
export const Pesa = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><path d="M6.5 9v6M17.5 9v6M3.5 10.5v3M20.5 10.5v3M6.5 12h11" /></svg>
);

/* Registro de íconos para hábitos (clave → componente) */
export const HABIT_ICONS: Record<string, (p: P) => React.JSX.Element> = {
  sol: Sol, pluma: Pluma, caminar: Caminar, idioma: Idioma, moneda: Moneda,
  gota: Gota, luna: Luna, libro: Libro, corazon: Corazon, pesa: Pesa,
};

/* ── Íconos de tipos de destino / agenda ── */
export const Avion = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><path d="M21 15l-8-3V5.5a1.5 1.5 0 0 0-3 0V12l-8 3v2l8-2v3.5L6 20v1.5l4-1 4 1V20l-2-1.5V15l8 2z" /></svg>
);
export const Cama = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><path d="M3 18v-6h13a3 3 0 0 1 3 3v3M3 18v-9M3 13h16M21 18v-2M7 12v-2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2" /></svg>
);
export const Mapa = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><path d="M9 4L3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" /></svg>
);
export const Camara = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2" /><path d="M8 7l1.5-2h5L16 7" /><circle cx="12" cy="13" r="3.2" /></svg>
);
export const Birrete = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><path d="M2 9l10-4 10 4-10 4-10-4z" /><path d="M6 11v4c0 1.5 2.7 3 6 3s6-1.5 6-3v-4M22 9v5" /></svg>
);
export const Charla = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><path d="M4 5h16a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4v-4H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" /></svg>
);
export const Entrada = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><path d="M3 8a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2 2 2 0 0 0 0 4 2 2 0 0 1 0 4 2 2 0 0 1-2 2H5a2 2 0 0 1-2-2 2 2 0 0 0 0-4 2 2 0 0 1 0-4z" /><path d="M15 6v12" strokeDasharray="2 2" /></svg>
);
export const Pin = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><circle cx="12" cy="10" r="3" /><path d="M12 21.5C12 21.5 5 15.5 5 10a7 7 0 0 1 14 0c0 5.5-7 11.5-7 11.5z" /></svg>
);
export const Torta = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><path d="M4 20h16M5 20v-6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v6M3 16c1.5 0 1.5 1.5 3 1.5S10.5 16 12 16s1.5 1.5 3 1.5 1.5-1.5 3-1.5M12 8V5M9 8V6M15 8V6" /></svg>
);
export const Brillo = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" /><path d="M19 15l.7 2 2 .7-2 .7-.7 2-.7-2-2-.7 2-.7z" /></svg>
);

export const Telefono = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><path d="M5 4h3l1.5 4-2 1.5a12 12 0 0 0 5 5l1.5-2 4 1.5V19a2 2 0 0 1-2 2A16 16 0 0 1 4 6a2 2 0 0 1 1-2z" /></svg>
);
export const Whatsapp = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><path d="M4 20l1.4-4A8 8 0 1 1 9 19.2L4 20z" /><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5M9 9.5c0-.6.4-1 1-1s1.2 1.4 1.2 1.8-.7.8-.7 1.2M14.5 15c.6 0 1-.4 1-1s-1.4-1.2-1.8-1.2-.8.7-1.2.7" /></svg>
);

export const Persona = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c0-3.5 3-6 7-6s7 2.5 7 6" /></svg>
);
export const Pata = (p: P) => (
  <svg {...base(p)} aria-hidden="true"><ellipse cx="12" cy="15" rx="4" ry="3.2" /><circle cx="7" cy="10" r="1.6" /><circle cx="17" cy="10" r="1.6" /><circle cx="9.5" cy="6.5" r="1.5" /><circle cx="14.5" cy="6.5" r="1.5" /></svg>
);

export const Huella = (p: P) => (
  <svg {...base(p)} aria-hidden="true">
    {/* arco externo */}
    <path d="M6.5 19.5C5 17.5 4 15 4 12a8 8 0 0 1 16 0c0 2-.3 3.8-1 5.5" />
    {/* arco medio */}
    <path d="M9 18.5C8 17 7.5 14.8 7.5 12a4.5 4.5 0 0 1 9 0c0 1.8-.4 3.5-1 4.8" />
    {/* arco interno */}
    <path d="M11.5 17C11 15.8 10.8 14 10.8 12a1.2 1.2 0 0 1 2.4 0c0 1.6-.2 3.2-.7 4.5" />
    {/* base / dedo */}
    <path d="M9.5 8.5A4.4 4.4 0 0 1 12 8" />
  </svg>
);

import type { TipoDestino } from "@/lib/types";
export const ICONO_TIPO: Record<TipoDestino, (p: P) => React.JSX.Element> = {
  vuelo: Avion, estadia: Cama, tour: Mapa, visita: Camara,
  curso: Birrete, charla: Charla, evento: Entrada,
};
