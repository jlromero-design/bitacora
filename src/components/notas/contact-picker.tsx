"use client";
import { useState } from "react";
import type { NoteContact } from "@/lib/types";
import { hasContactPicker } from "@/lib/note-utils";
import { Campo, Boton, inputClase } from "@/components/ui";

function genId() {
  return `con-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

type Props = {
  onAdd: (contact: NoteContact) => void;
  onCancel: () => void;
};

export function ContactPicker({ onAdd, onCancel }: Props) {
  const [mode, setMode] = useState<"choose" | "manual">(hasContactPicker() ? "choose" : "manual");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [pickerError, setPickerError] = useState<string | null>(null);

  async function launchPicker() {
    setPickerError(null);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const contacts = await (navigator as any).contacts.select(["name", "tel", "email"], { multiple: true });
      if (!contacts || contacts.length === 0) return;
      for (const c of contacts) {
        onAdd({
          id: genId(),
          name: (c.name?.[0] ?? "Sin nombre").trim(),
          phone: c.tel?.[0]?.trim() || undefined,
          email: c.email?.[0]?.trim() || undefined,
          source: "picker",
        });
      }
    } catch {
      setPickerError("No se pudo acceder a los contactos. Ingresalos manualmente.");
      setMode("manual");
    }
  }

  function handleManualSave() {
    if (!name.trim()) return;
    onAdd({
      id: genId(),
      name: name.trim(),
      phone: phone.trim() || undefined,
      email: email.trim() || undefined,
      source: "manual",
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--hairline)] bg-[var(--tinta)] p-4">
      <p className="font-display text-xs uppercase tracking-widest text-gris-azul">👤 Agregar persona</p>

      {mode === "choose" && (
        <div className="flex flex-col gap-2">
          <Boton variante="primario" onClick={launchPicker}>📱 Desde mis contactos</Boton>
          <Boton variante="fantasma" onClick={() => setMode("manual")}>✏ Ingresar manualmente</Boton>
          {pickerError && <p className="text-xs text-peligro">{pickerError}</p>}
        </div>
      )}

      {mode === "manual" && (
        <div className="flex flex-col gap-3">
          <Campo label="Nombre *" htmlFor="con-name">
            <input id="con-name" className={inputClase} value={name} onChange={(e) => setName(e.target.value)} placeholder="Nombre completo" />
          </Campo>
          <div className="grid grid-cols-2 gap-3">
            <Campo label="Teléfono" htmlFor="con-phone">
              <input id="con-phone" className={inputClase} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+54 …" type="tel" />
            </Campo>
            <Campo label="Email" htmlFor="con-email">
              <input id="con-email" className={inputClase} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="…@mail.com" type="email" />
            </Campo>
          </div>
          <div className="flex gap-2">
            {hasContactPicker() && (
              <Boton variante="fantasma" onClick={() => setMode("choose")}>← Desde contactos</Boton>
            )}
            <div className="ml-auto flex gap-2">
              <Boton variante="fantasma" onClick={onCancel}>Cancelar</Boton>
              <Boton variante="oro" onClick={handleManualSave} disabled={!name.trim()}>Agregar</Boton>
            </div>
          </div>
        </div>
      )}

      {mode === "choose" && (
        <Boton variante="fantasma" onClick={onCancel}>Cancelar</Boton>
      )}
    </div>
  );
}
