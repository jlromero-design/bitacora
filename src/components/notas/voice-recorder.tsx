"use client";
import { useState, useRef, useCallback } from "react";
import type { NoteAttachment } from "@/lib/types";
import { saveBlob } from "@/lib/idb-attachments";
import { preferredAudioMime, formatDuration } from "@/lib/note-utils";
import { Boton } from "@/components/ui";

type Props = {
  onSave: (attachment: NoteAttachment) => void;
  onCancel: () => void;
};

type RecState = "idle" | "recording" | "preview";

function genId() {
  return `att-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;
}

export function VoiceRecorder({ onSave, onCancel }: Props) {
  const [state, setState] = useState<RecState>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const mediaRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = preferredAudioMime();
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        const b = new Blob(chunksRef.current, { type: mime });
        setBlob(b);
        setPreviewUrl(URL.createObjectURL(b));
        setState("preview");
      };
      rec.start(250);
      mediaRef.current = rec;
      setElapsed(0);
      setState("recording");
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000);
    } catch {
      alert("No se pudo acceder al micrófono. Verificá los permisos.");
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRef.current?.stop();
  }, []);

  const handleSave = useCallback(async () => {
    if (!blob) return;
    setSaving(true);
    const idbKey = genId();
    await saveBlob(idbKey, blob);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    onSave({
      id: genId(),
      kind: "voice",
      name: `Nota de voz · ${formatDuration(elapsed)}`,
      mimeType: blob.type,
      storage: "indexeddb",
      idbKey,
      sizeBytes: blob.size,
      durationSec: elapsed,
      createdAt: new Date().toISOString(),
    });
  }, [blob, elapsed, previewUrl, onSave]);

  const handleDiscard = useCallback(() => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setBlob(null);
    setPreviewUrl(null);
    setState("idle");
    setElapsed(0);
  }, [previewUrl]);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-[var(--hairline)] bg-[var(--tinta)] p-4">
      <p className="font-display text-xs uppercase tracking-widest text-gris-azul">🎙 Nota de voz</p>

      {state === "idle" && (
        <Boton variante="primario" onClick={startRecording}>⏺ Grabar</Boton>
      )}

      {state === "recording" && (
        <div className="flex items-center gap-3">
          <span className="animate-pulse text-peligro">● REC</span>
          <span className="font-mono text-marfil">{formatDuration(elapsed)}</span>
          <Boton variante="peligro" onClick={stopRecording}>⏹ Detener</Boton>
        </div>
      )}

      {state === "preview" && previewUrl && (
        <div className="flex flex-col gap-2">
          <audio src={previewUrl} controls className="w-full" />
          <p className="text-xs text-gris-azul">Duración: {formatDuration(elapsed)} · {blob ? `${(blob.size / 1024).toFixed(0)} KB` : ""}</p>
          <div className="flex gap-2">
            <Boton variante="fantasma" onClick={handleDiscard}>Descartar</Boton>
            <Boton variante="oro" onClick={handleSave} disabled={saving}>
              {saving ? "Guardando…" : "Guardar nota de voz"}
            </Boton>
          </div>
        </div>
      )}

      <Boton variante="fantasma" onClick={onCancel}>Cancelar</Boton>
    </div>
  );
}
