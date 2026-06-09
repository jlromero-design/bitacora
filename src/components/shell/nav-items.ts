import { Agenda, Finanzas, Habitos, Pendientes, Casa, Destinos, Papelera, Reloj, Libro } from "@/components/icons";

export const MENU_PRINCIPAL = [
  { href: "/agenda", label: "Agenda", icon: Agenda },
  { href: "/destinos", label: "Destinos", icon: Destinos },
  { href: "/finanzas", label: "Finanzas", icon: Finanzas },
  { href: "/habitos", label: "Hábitos", icon: Habitos },
  { href: "/pendientes", label: "Pendientes", icon: Pendientes },
] as const;

export const MENU_SECUNDARIO = [
  { href: "/en-casa", label: "En casa", icon: Casa },
  { href: "/notas", label: "Notas", icon: Libro },
  { href: "/tiempo", label: "Tiempo", icon: Reloj },
  { href: "/papelera", label: "Papelera", icon: Papelera },
] as const;
