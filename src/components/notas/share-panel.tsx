"use client";
import { useState, useCallback } from "react";
import type { Note } from "@/lib/types";
import { noteToText, shareText, shareWithFiles, buildDownloadUrl } from "@/lib/note-export";
import { attachmentIcon, formatBytes, formatDuration } from "@/lib/note-utils";
import { Sheet, Boton } from "@/components/ui";

type Props = {
  nota: Note;
  onClose: () => void;
};

type ShareState = "idle" | "loading" | "copied" | "shared" | "error";

export function SharePanel({ nota, onClose }: Props) {
  const [mode, setMode] = useState<"texto" | "adjuntos">("texto");
  const [state, setState] = useState<ShareState>("idle");
  const [msg, setMsg] = useState<string | null>(null);

  const texto = noteToText(nota);
  const tieneAdjuntosLocales = (nota.attachments ?? []).some((a) => a.storage !== "url");

  function feedback(st: ShareState, m: string) {
    setState(st);
    setMsg(m);
    if (st !== "loading") setTimeout(() => { setState("idle"); setMsg(null); }, 3000);
  }

  const handleCompartirTexto = useCallback(async () => {
    setState("loading");
    const ok = await shareText(nota);
    if (ok) {
      feedback("shared", "¡Compartido!");
    } else {
      // fallback a clipboard
      try {
        await navigator.clipboard.writeText(texto);
        feedback("copied", "Texto copiado al portapapeles");
      } catch {
        feedback("error", "No se pudo compartir. Copiá el texto manualmente.");
      }
    }
  }, [nota, texto]);

  const handleCompartirConAdjuntos = useCallback(async () => {
    setState("loading");
    const result = await shareWithFiles(nota);
    if (result.unsupported) {
      feedback("error", "Tu dispositivo no soporta compartir archivos. Descargalos individualmente.");
    } else if (result.ok) {
      feedback("shared", "¡Compartido!");
    } else {
      feedback("error", "No se pudo compartir.");
    }
  }, [nota]);

  const handleCopiar = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(texto);
      feedback("copied", "Texto copiado ✓");
    } catch {
      feedback("error", "No se pudo acceder al portapapeles.");
    }
  }, [texto]);

  const handleWhatsApp = useCallback(() => {
    window.open(`https://wa.me/?text=${encodeURIComponent(texto)}`, "_blank", "noopener");
  }, [texto]);

  const handleEmail = useCallback(() => {
    const subject = encodeURIComponent(`Nota del ${new Date(nota.dayKey).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}`);
    const body = encodeURIComponent(texto);
    window.open(`mailto:?subject=${subject}&body=${body}`, "_self");
  }, [nota.dayKey, texto]);

  const handleDownload = useCallback(async (idbKey: string, name: string) => {
    const url = await buildDownloadUrl(idbKey);
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }, []);

  return (
    <Sheet open onClose={onClose} titulo="Compartir nota">
      {/* Selector de modo (solo si hay adjuntos locales) */}
      {tieneAdjuntosLocales && (
        <div className="flex gap-1.5" role="group" aria-label="Modo de compartir">
          {(["texto", "adjuntos"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setMode(m)}
              aria-pressed={mode === m}
              className={`flex-1 rounded-full border py-1.5 text-xs transition-colors ${
                mode === m
                  ? "border-laton bg-[var(--laton-tenue)] text-laton-claro"
                  : "border-[var(--hairline-soft)] text-gris-azul hover:text-marfil"
              }`}
            >
              {m === "texto" ? "📝 Solo texto" : "📎 Con adjuntos"}
            </button>
          ))}
        </div>
      )}

      {/* Feedback de estado */}
      {msg && (
        <p className={`rounded-lg px-3 py-2 text-sm ${
          state === "error" ? "bg-[color-mix(in_srgb,var(--peligro)_15%,transparent)] text-peligro"
            : "bg-[var(--laton-tenue)] text-laton-claro"
        }`}>
          {msg}
        </p>
      )}

      {/* Vista previa del texto */}
      <div className="max-h-40 overflow-y-auto rounded-xl border border-[var(--hairline-soft)] bg-[var(--tinta)] p-3">
        <pre className="whitespace-pre-wrap font-serif text-xs text-marfil-dim">{texto}</pre>
      </div>

      {/* Modo: solo texto */}
      {mode === "texto" && (
        <div className="flex flex-col gap-2">
          <p className="text-xs uppercase tracking-widest text-gris-azul">Compartir texto</p>
          <div className="grid grid-cols-2 gap-2">
            <ShareBtn onClick={handleCompartirTexto} disabled={state === "loading"} label="📤 Compartir" />
            <ShareBtn onClick={handleWhatsApp} label="💬 WhatsApp" />
            <ShareBtn onClick={handleEmail} label="📧 Email" />
            <ShareBtn onClick={handleCopiar} label="📋 Copiar" />
          </div>
        </div>
      )}

      {/* Modo: con adjuntos */}
      {mode === "adjuntos" && (
        <div className="flex flex-col gap-3">
          <Boton
            variante="oro"
            onClick={handleCompartirConAdjuntos}
            disabled={state === "loading"}
          >
            {state === "loading" ? "Preparando…" : "📤 Compartir texto + archivos"}
          </Boton>
          <p className="text-xs text-gris-azul-dim">
            Usa la hoja de compartir nativa del dispositivo (requiere Android o iOS moderno).
          </p>

          {/* Descarga individual */}
          {(nota.attachments ?? []).length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs uppercase tracking-widest text-gris-azul">Descargar individualmente</p>
              {(nota.attachments ?? []).map((att) => (
                <div key={att.id} className="flex items-center gap-2 rounded-xl border border-[var(--hairline-soft)] bg-[var(--tinta)] px-3 py-2 text-sm">
                  <span aria-hidden="true">{attachmentIcon(att.kind)}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-marfil">{att.name}</p>
                    <p className="text-xs text-gris-azul-dim">
                      {att.kind === "voice" && att.durationSec ? formatDuration(att.durationSec) + " · " : ""}
                      {att.sizeBytes ? formatBytes(att.sizeBytes) : ""}
                      {att.storage === "url" ? "enlace externo" : ""}
                    </p>
                  </div>
                  {att.storage === "indexeddb" && att.idbKey ? (
                    <button
                      type="button"
                      onClick={() => handleDownload(att.idbKey!, att.name)}
                      className="shrink-0 rounded-lg border border-[var(--hairline)] px-2 py-1 text-xs text-laton-claro hover:bg-[var(--laton-tenue)]"
                    >
                      ⬇
                    </button>
                  ) : att.storage === "url" && att.url ? (
                    <a
                      href={att.url}
                      target="_blank"
                      rel="noopener"
                      className="shrink-0 rounded-lg border border-[var(--hairline)] px-2 py-1 text-xs text-laton-claro hover:bg-[var(--laton-tenue)]"
                    >
                      ↗
                    </a>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <Boton variante="fantasma" onClick={onClose}>Cerrar</Boton>
    </Sheet>
  );
}

function ShareBtn({ onClick, label, disabled }: { onClick: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl border border-[var(--hairline)] bg-[var(--tinta)] px-3 py-2.5 text-sm text-marfil transition-colors hover:border-laton hover:text-laton-claro disabled:opacity-50"
    >
      {label}
    </button>
  );
}
