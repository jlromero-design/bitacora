"use client";
/* Estado de UI efímero: día seleccionado, calendario abierto, menú. */
import { createContext, useContext, useState } from "react";
import { todayKey } from "./dates";

interface UICtx {
  selectedDay: string;
  setSelectedDay: (k: string) => void;
  calendarOpen: boolean;
  toggleCalendar: () => void;
  menuOpen: boolean;
  setMenuOpen: (v: boolean) => void;
}

const Ctx = createContext<UICtx | null>(null);

export function UIProvider({ children }: { children: React.ReactNode }) {
  const [selectedDay, setSelectedDay] = useState(todayKey());
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Ctx.Provider
      value={{
        selectedDay,
        setSelectedDay,
        calendarOpen,
        toggleCalendar: () => setCalendarOpen((v) => !v),
        menuOpen,
        setMenuOpen,
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useUI(): UICtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useUI debe usarse dentro de <UIProvider>");
  return ctx;
}
