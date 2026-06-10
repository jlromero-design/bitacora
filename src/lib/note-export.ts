import type { Note } from "./types";
import { fmtLargo } from "./dates";
import { getBlob } from "./idb-attachments";

export function noteToText(note: Note): string {
  const lines: string[] = [];
  const time = new Date(note.createdAt).toLocaleTimeString("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
  });
  lines.push(`📅 ${fmtLargo(note.dayKey)} · ${time}`);
  lines.push("──────────────────────────────");

  if (note.text.trim()) {
    lines.push(note.text.trim());
    lines.push("");
  }

  const contacts = note.contacts ?? [];
  if (contacts.length > 0) {
    lines.push("👤 Personas");
    for (const c of contacts) {
      const info = [c.phone, c.email].filter(Boolean).join(" — ");
      lines.push(`• ${c.name}${info ? ` — ${info}` : ""}`);
    }
    lines.push("");
  }

  const attachments = note.attachments ?? [];
  if (attachments.length > 0) {
    lines.push("📎 Adjuntos");
    for (const att of attachments) {
      if (att.storage === "url" && att.url) {
        lines.push(`• 🔗 ${att.name} — ${att.url}`);
      } else {
        const icon = att.kind === "voice" ? "🎙" : att.kind === "image" ? "🖼" : "📄";
        const dur =
          att.durationSec != null
            ? ` ${Math.floor(att.durationSec / 60)}:${String(Math.floor(att.durationSec % 60)).padStart(2, "0")}`
            : "";
        const size = att.sizeBytes ? ` (${(att.sizeBytes / 1024).toFixed(0)} KB)` : "";
        lines.push(`• ${icon} ${att.name}${dur}${size} [adjunto guardado]`);
      }
    }
    lines.push("");
  }

  lines.push("──────────────────────────────");
  lines.push("Bitácora Vale · valeriajuri.com.ar");
  return lines.join("\n");
}

/** Intenta compartir texto con la Web Share API. Devuelve true si tuvo éxito. */
export async function shareText(note: Note): Promise<boolean> {
  const text = noteToText(note);
  const title = `Nota del ${fmtLargo(note.dayKey)}`;
  if (navigator.share) {
    try {
      await navigator.share({ title, text });
      return true;
    } catch {
      return false;
    }
  }
  return false;
}

/** Intenta compartir con archivos adjuntos via Web Share API. */
export async function shareWithFiles(note: Note): Promise<{ ok: boolean; unsupported?: boolean }> {
  const attachments = (note.attachments ?? []).filter((a) => a.storage !== "url");
  const text = noteToText(note);
  const title = `Nota del ${fmtLargo(note.dayKey)}`;

  if (!navigator.share) return { ok: false, unsupported: true };

  const files: File[] = [];
  for (const att of attachments) {
    let blob: Blob | null = null;
    if (att.storage === "indexeddb" && att.idbKey) {
      blob = await getBlob(att.idbKey);
    } else if (att.storage === "supabase" && att.url) {
      try {
        const res = await fetch(att.url);
        blob = await res.blob();
      } catch {
        // ignorar si falla la descarga
      }
    }
    if (blob) files.push(new File([blob], att.name, { type: att.mimeType }));
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canShareFiles = files.length > 0 && (navigator as any).canShare?.({ files });
  try {
    if (canShareFiles) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (navigator as any).share({ title, text, files });
    } else {
      await navigator.share({ title, text });
    }
    return { ok: true };
  } catch {
    return { ok: false };
  }
}

/** Devuelve una URL de descarga para un adjunto almacenado en IDB. */
export async function buildDownloadUrl(idbKey: string): Promise<string | null> {
  const blob = await getBlob(idbKey);
  if (!blob) return null;
  return URL.createObjectURL(blob);
}
