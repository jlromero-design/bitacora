"use client";
import { useState } from "react";
import type { NoteAttachment } from "@/lib/types";
import { Campo, Boton, inputClase } from "@/components/ui";

function genId() {
  return `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

type Props = {
  onSave: (attachment: NoteAttachment) => void;
  onCancel: () => void;
};

export function AttachmentUrlInput({ onSave, onCancel }: Props) {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");

  function handleSave() {
    const trimmed = url.trim();
    if (!trimmed) return;
    onSave({
      id: genId(),
      kind: "document",
      name: name.trim() || trimmed,
      mimeType: "text/html",
      storage: "url",
      url: trimmed,
      createdAt: new Date().toISOString(),
    });
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--hairline)] bg-[var(--tinta)] p-4">
      <p className="font-display text-xs uppercase tracking-widest text-gris-azul">🔗 Agregar enlace</p>
      <Campo label="URL" htmlFor="att-url">
        <input
          id="att-url"
          className={inputClase}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
          type="url"
        />
      </Campo>
      <Campo label="Nombre (opcional)" htmlFor="att-url-name">
        <input
          id="att-url-name"
          className={inputClase}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Ej: Reserva del hotel"
        />
      </Campo>
      <div className="flex gap-2">
        <Boton variante="fantasma" onClick={onCancel}>Cancelar</Boton>
        <Boton variante="oro" onClick={handleSave} disabled={!url.trim()}>Guardar enlace</Boton>
      </div>
    </div>
  );
}
