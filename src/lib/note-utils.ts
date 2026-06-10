import type { Note, NoteAttachment } from "./types";
import { getBlob } from "./idb-attachments";

const EDITABLE_MS = 24 * 60 * 60 * 1000;

export function isNoteEditable(note: Note): boolean {
  return Date.now() - new Date(note.createdAt).getTime() < EDITABLE_MS;
}

/** Resuelve la URL reproducible de un adjunto, cargando desde IndexedDB si corresponde */
export async function resolveAttachmentUrl(att: NoteAttachment): Promise<string | null> {
  if (att.storage === "url" || att.storage === "supabase") {
    return att.url ?? null;
  }
  if (att.storage === "indexeddb" && att.idbKey) {
    const blob = await getBlob(att.idbKey);
    if (!blob) return null;
    return URL.createObjectURL(blob);
  }
  return null;
}

export function attachmentIcon(kind: NoteAttachment["kind"]): string {
  if (kind === "voice") return "🎙";
  if (kind === "image") return "🖼";
  return "📄";
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

/** Detecta si el navegador soporta el Contact Picker API */
export function hasContactPicker(): boolean {
  return (
    typeof window !== "undefined" &&
    "contacts" in navigator &&
    "ContactsManager" in window
  );
}

/** Mime type soportado para MediaRecorder de audio */
export function preferredAudioMime(): string {
  if (typeof MediaRecorder === "undefined") return "audio/webm";
  return MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
    ? "audio/webm;codecs=opus"
    : "audio/mp4";
}
