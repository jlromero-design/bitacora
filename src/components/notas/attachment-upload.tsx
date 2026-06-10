"use client";
import { useRef, useState } from "react";
import type { NoteAttachment, AttachmentKind } from "@/lib/types";
import { saveBlob } from "@/lib/idb-attachments";
import { Boton } from "@/components/ui";

const SIZE_LIMIT = 10 * 1024 * 1024; // 10 MB

function genId() {
  return `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

function kindFromMime(mime: string): AttachmentKind {
  if (mime.startsWith("image/")) return "image";
  return "document";
}

type Props = {
  onSave: (attachment: NoteAttachment) => void;
  onCancel: () => void;
};

export function AttachmentUpload({ onSave, onCancel }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setError(null);
    if (file.size > SIZE_LIMIT) {
      setError(`El archivo supera el límite de 10 MB (${(file.size / (1024 * 1024)).toFixed(1)} MB).`);
      return;
    }
    setSaving(true);
    try {
      const idbKey = genId();
      const blob = new Blob([await file.arrayBuffer()], { type: file.type });
      await saveBlob(idbKey, blob);
      onSave({
        id: genId(),
        kind: kindFromMime(file.type),
        name: file.name,
        mimeType: file.type,
        storage: "indexeddb",
        idbKey,
        sizeBytes: file.size,
        createdAt: new Date().toISOString(),
      });
    } catch {
      setError("No se pudo guardar el archivo. Intentá de nuevo.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--hairline)] bg-[var(--tinta)] p-4">
      <p className="font-display text-xs uppercase tracking-widest text-gris-azul">📄 Subir archivo</p>
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={saving}
        className="flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-[var(--hairline)] py-6 text-sm text-gris-azul transition-colors hover:border-laton hover:text-laton-claro"
      >
        <span className="text-2xl">⬆</span>
        {saving ? "Guardando…" : "Tocá para elegir un archivo"}
        <span className="text-xs text-gris-azul-dim">Imágenes, PDF, Word, Excel · máx. 10 MB</span>
      </button>
      {error && <p className="text-xs text-peligro">{error}</p>}
      <Boton variante="fantasma" onClick={onCancel}>Cancelar</Boton>
    </div>
  );
}
