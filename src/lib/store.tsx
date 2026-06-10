"use client";
/* ════════════════════════════════════════════════════════════
   Store local — Context + localStorage. CRUD con soft-delete e
   historial. Diseñado para reemplazarse por server actions de
   Supabase sin cambiar la interfaz que consumen los componentes.
   ════════════════════════════════════════════════════════════ */
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import type {
  AppData,
  TripAction,
  ActionHistory,
  Expense,
  ExchangeRate,
  Habit,
  Destination,
  BudgetCategory,
  Reminder,
  Note,
  NoteContact,
  NoteAttachment,
  BudgetAlloc,
  Persona,
  PersonaItem,
} from "./types";
import { deleteBlob } from "./idb-attachments";
import { zonaDispositivo } from "./dates";

const STORAGE_KEY = "valejuri:data:v2";
const SCHEMA_VERSION = 2;

function emptyData(): AppData {
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
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
      deletedAt: null,
      title: "Mi viaje",
      startsOn: "2026-06-01",
      endsOn: "2026-08-31",
      baseCurrency: "ARS",
    },
    destinations:  [],
    actions:       [],
    history:       [],
    categories:    [],
    expenses:      [],
    rates:         [],
    habits:        [],
    habitLogs:     [],
    reminders:     [],
    notes:         [],
    budgets:       [],
    personas:      [],
    personaItems:  [],
  };
}

function genId(prefix: string): string {
  return `${prefix}-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 7)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

interface StoreCtx {
  data: AppData;
  ready: boolean;
  // Acciones (agenda / finance / task / home / destination)
  addAction: (a: Partial<TripAction> & Pick<TripAction, "group" | "title" | "actionDate">) => TripAction;
  updateAction: (id: string, patch: Partial<TripAction>) => void;
  softDeleteAction: (id: string) => void;
  restoreAction: (id: string) => void;
  setStatus: (id: string, status: TripAction["status"]) => void;
  // Gastos
  addExpense: (e: Partial<Expense> & Pick<Expense, "title" | "amount" | "currency" | "spentOn">) => void;
  updateExpense: (id: string, patch: Partial<Expense>) => void;
  softDeleteExpense: (id: string) => void;
  restoreExpense: (id: string) => void;
  // Presupuesto
  upsertCategory: (c: Partial<BudgetCategory> & { id?: string }) => void;
  // Cotizaciones
  upsertRate: (r: Partial<ExchangeRate> & { id?: string }) => void;
  // Hábitos
  toggleHabit: (habitId: string, dayKey: string) => void;
  addHabit: (h: Partial<Habit> & Pick<Habit, "name">) => void;
  softDeleteHabit: (id: string) => void;
  restoreHabit: (id: string) => void;
  // Destinos
  upsertDestination: (d: Partial<Destination> & { id?: string }) => void;
  softDeleteDestination: (id: string) => void;
  suspendDestination: (id: string, reason: string) => void;
  unsuspendDestination: (id: string) => void;
  // Recordatorios
  markReminderSeen: (id: string) => void;
  // Notas de bitácora (múltiples por día)
  upsertNote: (dayKey: string, texto: string) => void;
  addNote: (dayKey: string, id: string) => void;
  updateNoteText: (id: string, texto: string) => void;
  addNoteContact: (noteId: string, contact: NoteContact) => void;
  removeNoteContact: (noteId: string, contactId: string) => void;
  addNoteAttachment: (noteId: string, attachment: NoteAttachment) => void;
  removeNoteAttachment: (noteId: string, attachmentId: string) => void;
  // Presupuestos por período
  addBudget: (b: Partial<BudgetAlloc> & Pick<BudgetAlloc, "scope" | "periodKey" | "name" | "amount">) => void;
  updateBudget: (id: string, patch: Partial<BudgetAlloc>) => void;
  deleteBudget: (id: string) => void;
  // Configuración (reloj dual, etc.)
  updateSettings: (patch: Partial<AppData["settings"]>) => void;
  // Personas y sus ítems
  addPersona: (nombre: string, tipo: Persona["tipo"]) => void;
  removePersona: (id: string) => void;
  addPersonaItem: (personaId: string, texto: string, tipo: PersonaItem["tipo"]) => void;
  togglePersonaItem: (id: string) => void;
  removePersonaItem: (id: string) => void;
  // Mantenimiento
  resetAll: () => void;
}

const Ctx = createContext<StoreCtx | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<AppData>(() => emptyData());
  const [ready, setReady] = useState(false);

  // Cargar desde localStorage al montar (cliente)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.__v === SCHEMA_VERSION && parsed.data) {
          const base = emptyData();
          const incoming = parsed.data as Partial<AppData>;
          setData({
            ...base,
            ...incoming,
            settings: { ...base.settings, ...(incoming.settings ?? {}) },
          });
        }
      }
    } catch {
      /* datos corruptos → estado vacío */
    }
    setReady(true);
  }, []);

  // Persistir en cada cambio (una vez listo)
  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ __v: SCHEMA_VERSION, data }),
      );
    } catch {
      /* almacenamiento lleno o no disponible */
    }
  }, [data, ready]);

  const pushHistory = (h: Omit<ActionHistory, "id" | "at">) =>
    ({ ...h, id: genId("hist"), at: nowIso() } as ActionHistory);

  const addAction: StoreCtx["addAction"] = useCallback((a) => {
    const action: TripAction = {
      id: genId("act"),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      deletedAt: null,
      tripId: "trip-1",
      destinationId: a.destinationId ?? null,
      group: a.group,
      kind: a.kind,
      title: a.title,
      description: a.description ?? "",
      actionDate: a.actionDate,
      startsAt: a.startsAt ?? null,
      endsAt: a.endsAt ?? null,
      status: a.status ?? "planned",
      priority: a.priority ?? "medium",
      amount: a.amount ?? null,
      currency: a.currency ?? null,
      metadata: a.metadata ?? {},
    };
    setData((d) => ({
      ...d,
      actions: [...d.actions, action],
      history: [
        ...d.history,
        pushHistory({ actionId: action.id, operation: "create", summary: `Creada: ${action.title}` }),
      ],
    }));
    return action;
  }, []);

  const updateAction: StoreCtx["updateAction"] = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      actions: d.actions.map((a) =>
        a.id === id ? { ...a, ...patch, updatedAt: nowIso() } : a,
      ),
      history: [
        ...d.history,
        pushHistory({ actionId: id, operation: "update", summary: "Editada" }),
      ],
    }));
  }, []);

  const softDeleteAction: StoreCtx["softDeleteAction"] = useCallback((id) => {
    setData((d) => ({
      ...d,
      actions: d.actions.map((a) =>
        a.id === id ? { ...a, deletedAt: nowIso(), updatedAt: nowIso() } : a,
      ),
      history: [
        ...d.history,
        pushHistory({ actionId: id, operation: "soft_delete", summary: "Enviada a la papelera" }),
      ],
    }));
  }, []);

  const restoreAction: StoreCtx["restoreAction"] = useCallback((id) => {
    setData((d) => ({
      ...d,
      actions: d.actions.map((a) =>
        a.id === id ? { ...a, deletedAt: null, updatedAt: nowIso() } : a,
      ),
      history: [
        ...d.history,
        pushHistory({ actionId: id, operation: "restore", summary: "Recuperada" }),
      ],
    }));
  }, []);

  const setStatus: StoreCtx["setStatus"] = useCallback((id, status) => {
    setData((d) => ({
      ...d,
      actions: d.actions.map((a) =>
        a.id === id ? { ...a, status, updatedAt: nowIso() } : a,
      ),
      history: [
        ...d.history,
        pushHistory({ actionId: id, operation: "status", summary: `Estado: ${status}` }),
      ],
    }));
  }, []);

  const addExpense: StoreCtx["addExpense"] = useCallback((e) => {
    const exp: Expense = {
      id: genId("exp"),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      deletedAt: null,
      tripId: "trip-1",
      actionId: e.actionId ?? null,
      categoryId: e.categoryId ?? null,
      destinationId: e.destinationId ?? null,
      spentOn: e.spentOn,
      title: e.title,
      amount: e.amount,
      currency: e.currency,
      amountBase: e.amountBase ?? null,
      baseCurrency: e.baseCurrency ?? "ARS",
      notes: e.notes,
    };
    setData((d) => ({ ...d, expenses: [...d.expenses, exp] }));
  }, []);

  const updateExpense: StoreCtx["updateExpense"] = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      expenses: d.expenses.map((e) =>
        e.id === id ? { ...e, ...patch, updatedAt: nowIso() } : e,
      ),
    }));
  }, []);

  const softDeleteExpense: StoreCtx["softDeleteExpense"] = useCallback((id) => {
    setData((d) => ({
      ...d,
      expenses: d.expenses.map((e) =>
        e.id === id ? { ...e, deletedAt: nowIso() } : e,
      ),
    }));
  }, []);

  const restoreExpense: StoreCtx["restoreExpense"] = useCallback((id) => {
    setData((d) => ({
      ...d,
      expenses: d.expenses.map((e) =>
        e.id === id ? { ...e, deletedAt: null, updatedAt: nowIso() } : e,
      ),
    }));
  }, []);

  const upsertCategory: StoreCtx["upsertCategory"] = useCallback((c) => {
    setData((d) => {
      if (c.id && d.categories.some((x) => x.id === c.id)) {
        return {
          ...d,
          categories: d.categories.map((x) =>
            x.id === c.id ? { ...x, ...c, updatedAt: nowIso() } : x,
          ),
        };
      }
      const cat: BudgetCategory = {
        id: c.id ?? genId("cat"),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        deletedAt: null,
        tripId: "trip-1",
        name: c.name ?? "Nueva categoría",
        colorToken: c.colorToken ?? "finanzas",
        plannedAmount: c.plannedAmount ?? 0,
        currency: c.currency ?? "ARS",
        sortOrder: c.sortOrder ?? d.categories.length,
      };
      return { ...d, categories: [...d.categories, cat] };
    });
  }, []);

  const upsertRate: StoreCtx["upsertRate"] = useCallback((r) => {
    setData((d) => {
      if (r.id && d.rates.some((x) => x.id === r.id)) {
        return {
          ...d,
          rates: d.rates.map((x) =>
            x.id === r.id ? { ...x, ...r, validAt: nowIso() } : x,
          ),
        };
      }
      // sin id: deduplicar por moneda + tipo (actualiza el existente)
      const existente = d.rates.find(
        (x) => x.quoteCurrency === r.quoteCurrency && x.rateKind === r.rateKind,
      );
      if (existente) {
        return {
          ...d,
          rates: d.rates.map((x) =>
            x.id === existente.id ? { ...x, ...r, id: x.id, validAt: nowIso() } : x,
          ),
        };
      }
      const rate: ExchangeRate = {
        id: r.id ?? genId("rate"),
        baseCurrency: r.baseCurrency ?? "ARS",
        quoteCurrency: r.quoteCurrency ?? "USD",
        rate: r.rate ?? 1,
        rateKind: r.rateKind ?? "manual",
        sourceType: r.sourceType ?? "manual",
        sourceName: r.sourceName ?? "Manual",
        validAt: nowIso(),
      };
      return { ...d, rates: [...d.rates, rate] };
    });
  }, []);

  const toggleHabit: StoreCtx["toggleHabit"] = useCallback((habitId, dayKey) => {
    setData((d) => {
      const existing = d.habitLogs.find(
        (l) => l.habitId === habitId && l.loggedOn === dayKey,
      );
      if (existing) {
        return {
          ...d,
          habitLogs: d.habitLogs.filter((l) => l.id !== existing.id),
        };
      }
      return {
        ...d,
        habitLogs: [
          ...d.habitLogs,
          { id: genId("hl"), habitId, loggedOn: dayKey, value: true },
        ],
      };
    });
  }, []);

  const addHabit: StoreCtx["addHabit"] = useCallback((h) => {
    const habit: Habit = {
      id: genId("hab"),
      createdAt: nowIso(),
      updatedAt: nowIso(),
      deletedAt: null,
      tripId: "trip-1",
      name: h.name,
      description: h.description ?? "",
      targetPerWeek: h.targetPerWeek ?? 7,
      colorToken: h.colorToken ?? "habitos",
      icon: h.icon ?? "✦",
    };
    setData((d) => ({ ...d, habits: [...d.habits, habit] }));
  }, []);

  const softDeleteHabit: StoreCtx["softDeleteHabit"] = useCallback((id) => {
    setData((d) => ({
      ...d,
      habits: d.habits.map((h) =>
        h.id === id ? { ...h, deletedAt: nowIso() } : h,
      ),
    }));
  }, []);

  const restoreHabit: StoreCtx["restoreHabit"] = useCallback((id) => {
    setData((d) => ({
      ...d,
      habits: d.habits.map((h) =>
        h.id === id ? { ...h, deletedAt: null, updatedAt: nowIso() } : h,
      ),
    }));
  }, []);

  const upsertDestination: StoreCtx["upsertDestination"] = useCallback((dest) => {
    setData((d) => {
      if (dest.id && d.destinations.some((x) => x.id === dest.id)) {
        return {
          ...d,
          destinations: d.destinations.map((x) =>
            x.id === dest.id ? { ...x, ...dest, updatedAt: nowIso() } : x,
          ),
        };
      }
      const nd: Destination = {
        id: dest.id ?? genId("dest"),
        createdAt: nowIso(),
        updatedAt: nowIso(),
        deletedAt: null,
        tripId: "trip-1",
        name: dest.name ?? "Nuevo destino",
        country: dest.country,
        city: dest.city,
        province: dest.province,
        timezone: dest.timezone ?? "Europe/London",
        currency: dest.currency ?? "EUR",
        startsOn: dest.startsOn ?? "2026-06-05",
        endsOn: dest.endsOn ?? "2026-06-05",
        accommodation: dest.accommodation,
        reference: dest.reference,
        contactName: dest.contactName,
        contactPhone: dest.contactPhone,
        notes: dest.notes,
        sortOrder: dest.sortOrder ?? d.destinations.length,
      };
      return { ...d, destinations: [...d.destinations, nd] };
    });
  }, []);

  const softDeleteDestination: StoreCtx["softDeleteDestination"] = useCallback((id) => {
    setData((d) => ({
      ...d,
      destinations: d.destinations.map((x) =>
        x.id === id ? { ...x, deletedAt: nowIso(), updatedAt: nowIso() } : x,
      ),
    }));
  }, []);

  const suspendDestination: StoreCtx["suspendDestination"] = useCallback((id, reason) => {
    setData((d) => ({
      ...d,
      destinations: d.destinations.map((x) =>
        x.id === id ? { ...x, suspended: true, suspendReason: reason, updatedAt: nowIso() } : x,
      ),
    }));
  }, []);

  const unsuspendDestination: StoreCtx["unsuspendDestination"] = useCallback((id) => {
    setData((d) => ({
      ...d,
      destinations: d.destinations.map((x) =>
        x.id === id ? { ...x, suspended: false, suspendReason: undefined, updatedAt: nowIso() } : x,
      ),
    }));
  }, []);

  const markReminderSeen: StoreCtx["markReminderSeen"] = useCallback((id) => {
    setData((d) => ({
      ...d,
      reminders: d.reminders.map((r) =>
        r.id === id ? { ...r, isSeen: true } : r,
      ),
    }));
  }, []);

  const upsertNote: StoreCtx["upsertNote"] = useCallback((dayKey, texto) => {
    setData((d) => {
      const existing = d.notes.find((n) => n.dayKey === dayKey);
      if (existing) {
        return {
          ...d,
          notes: d.notes.map((n) =>
            n.id === existing.id ? { ...n, text: texto, updatedAt: nowIso() } : n,
          ),
        };
      }
      const note: Note = {
        id: genId("note"),
        dayKey,
        text: texto,
        createdAt: nowIso(),
        updatedAt: nowIso(),
        tz: zonaDispositivo(),
      };
      return { ...d, notes: [...d.notes, note] };
    });
  }, []);

  const addNote: StoreCtx["addNote"] = useCallback((dayKey, id) => {
    setData((d) => {
      const note: Note = {
        id,
        dayKey,
        text: "",
        createdAt: nowIso(),
        updatedAt: nowIso(),
        tz: zonaDispositivo(),
      };
      return { ...d, notes: [...d.notes, note] };
    });
  }, []);

  const updateNoteText: StoreCtx["updateNoteText"] = useCallback((id, texto) => {
    setData((d) => ({
      ...d,
      notes: d.notes.map((n) =>
        n.id === id ? { ...n, text: texto, updatedAt: nowIso() } : n,
      ),
    }));
  }, []);

  const addNoteContact: StoreCtx["addNoteContact"] = useCallback((noteId, contact) => {
    setData((d) => ({
      ...d,
      notes: d.notes.map((n) =>
        n.id === noteId
          ? { ...n, contacts: [...(n.contacts ?? []), contact], updatedAt: nowIso() }
          : n,
      ),
    }));
  }, []);

  const removeNoteContact: StoreCtx["removeNoteContact"] = useCallback((noteId, contactId) => {
    setData((d) => ({
      ...d,
      notes: d.notes.map((n) =>
        n.id === noteId
          ? { ...n, contacts: (n.contacts ?? []).filter((c) => c.id !== contactId), updatedAt: nowIso() }
          : n,
      ),
    }));
  }, []);

  const addNoteAttachment: StoreCtx["addNoteAttachment"] = useCallback((noteId, attachment) => {
    setData((d) => ({
      ...d,
      notes: d.notes.map((n) =>
        n.id === noteId
          ? { ...n, attachments: [...(n.attachments ?? []), attachment], updatedAt: nowIso() }
          : n,
      ),
    }));
  }, []);

  const removeNoteAttachment: StoreCtx["removeNoteAttachment"] = useCallback((noteId, attachmentId) => {
    setData((d) => {
      const note = d.notes.find((n) => n.id === noteId);
      const att = note?.attachments?.find((a) => a.id === attachmentId);
      if (att?.storage === "indexeddb" && att.idbKey) {
        deleteBlob(att.idbKey).catch(() => {});
      }
      return {
        ...d,
        notes: d.notes.map((n) =>
          n.id === noteId
            ? { ...n, attachments: (n.attachments ?? []).filter((a) => a.id !== attachmentId), updatedAt: nowIso() }
            : n,
        ),
      };
    });
  }, []);

  const addBudget: StoreCtx["addBudget"] = useCallback((b) => {
    const budget: BudgetAlloc = {
      id: genId("bud"),
      scope: b.scope,
      periodKey: b.periodKey,
      name: b.name,
      amount: b.amount,
      currency: b.currency ?? "ARS",
      categoryId: b.categoryId ?? null,
    };
    setData((d) => ({ ...d, budgets: [...d.budgets, budget] }));
  }, []);

  const updateBudget: StoreCtx["updateBudget"] = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      budgets: d.budgets.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  }, []);

  const deleteBudget: StoreCtx["deleteBudget"] = useCallback((id) => {
    setData((d) => ({ ...d, budgets: d.budgets.filter((b) => b.id !== id) }));
  }, []);

  const updateSettings: StoreCtx["updateSettings"] = useCallback((patch) => {
    setData((d) => ({ ...d, settings: { ...d.settings, ...patch } }));
  }, []);

  const addPersona: StoreCtx["addPersona"] = useCallback((nombre, tipo) => {
    const p: Persona = { id: genId("per"), nombre: nombre.trim(), tipo, createdAt: nowIso() };
    setData((d) => ({ ...d, personas: [...d.personas, p] }));
  }, []);

  const removePersona: StoreCtx["removePersona"] = useCallback((id) => {
    setData((d) => ({
      ...d,
      personas: d.personas.filter((p) => p.id !== id),
      personaItems: d.personaItems.filter((i) => i.personaId !== id),
    }));
  }, []);

  const addPersonaItem: StoreCtx["addPersonaItem"] = useCallback((personaId, texto, tipo) => {
    const item: PersonaItem = {
      id: genId("pit"), personaId, texto: texto.trim(), tipo, hecho: false, createdAt: nowIso(),
    };
    setData((d) => ({ ...d, personaItems: [...d.personaItems, item] }));
  }, []);

  const togglePersonaItem: StoreCtx["togglePersonaItem"] = useCallback((id) => {
    setData((d) => ({
      ...d,
      personaItems: d.personaItems.map((i) => i.id === id ? { ...i, hecho: !i.hecho } : i),
    }));
  }, []);

  const removePersonaItem: StoreCtx["removePersonaItem"] = useCallback((id) => {
    setData((d) => ({ ...d, personaItems: d.personaItems.filter((i) => i.id !== id) }));
  }, []);

  const resetAll: StoreCtx["resetAll"] = useCallback(() => {
    setData(emptyData());
  }, []);

  const value = useMemo<StoreCtx>(
    () => ({
      data,
      ready,
      addAction,
      updateAction,
      softDeleteAction,
      restoreAction,
      setStatus,
      addExpense,
      updateExpense,
      softDeleteExpense,
      restoreExpense,
      upsertCategory,
      upsertRate,
      toggleHabit,
      addHabit,
      softDeleteHabit,
      restoreHabit,
      upsertDestination,
      softDeleteDestination,
      suspendDestination,
      unsuspendDestination,
      markReminderSeen,
      upsertNote,
      addNote,
      updateNoteText,
      addNoteContact,
      removeNoteContact,
      addNoteAttachment,
      removeNoteAttachment,
      addBudget,
      updateBudget,
      deleteBudget,
      updateSettings,
      addPersona, removePersona, addPersonaItem, togglePersonaItem, removePersonaItem,
      resetAll,
    }),
    [
      data, ready, addAction, updateAction, softDeleteAction, restoreAction,
      setStatus, addExpense, updateExpense, softDeleteExpense, restoreExpense,
      upsertCategory, upsertRate, toggleHabit, addHabit, softDeleteHabit, restoreHabit,
      upsertDestination,
      markReminderSeen, upsertNote, addNote, updateNoteText,
      addNoteContact, removeNoteContact, addNoteAttachment, removeNoteAttachment,
      addBudget, updateBudget, deleteBudget,
      updateSettings, addPersona, removePersona, addPersonaItem, togglePersonaItem,
      removePersonaItem, resetAll,
    ],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useStore(): StoreCtx {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useStore debe usarse dentro de <StoreProvider>");
  return ctx;
}
