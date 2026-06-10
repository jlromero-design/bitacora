"use client";
import { useState, useEffect, useCallback } from "react";
import type { NoteAttachment } from "@/lib/types";
import { resolveAttachmentUrl, attachmentIcon, formatBytes, formatDuration } from "@/lib/note-utils";
import { Papelera } from "@/components/icons";

type Props = {
  attachments: NoteAttachment[];
  editable: boolean;
  onRemove: (id: string) => void;
};

function AttachmentItem({ att, editable, onRemove }: { att: NoteAttachment; editable: boolean; onRemove: (id: string) => void }) {
  const [url, setUrl] = useState<string | null>(att.storage === "url" ? (att.url ?? null) : null);

  useEffect(() => {
    if (att.storage !== "url") {
      resolveAttachmentUrl(att).then(setUrl);
    }
    return () => {
      if (url && att.storage === "indexeddb") URL.revokeObjectURL(url);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [att.id, att.storage]);

  const handleOpen = useCallback(() => {
    if (url) window.open(url, "_blank", "noopener");
  }, [url]);

  return (
    <li className="flex items-start gap-3 rounded-xl border border-[var(--hairline-soft)] bg-[var(--tinta)] px-3 py-2">
      <span className="mt-0.5 text-lg" aria-hidden="true">{attachmentIcon(att.kind)}</span>
      <div className="min-w-0 flex-1">
        {att.kind === "voice" && url ? (
          <audio src={url} controls className="w-full" aria-label={att.name} />
        ) : (
          <button
            type="button"
            onClick={handleOpen}
            disabled={!url}
            className="text-left text-sm text-laton-claro hover:underline disabled:cursor-default disabled:opacity-50"
          >
            {att.name}
          </button>
        )}
        <p className="mt-0.5 text-xs text-gris-azul-dim">
          {att.kind === "voice" && att.durationSec ? formatDuration(att.durationSec) : ""}
          {att.sizeBytes ? (att.kind === "voice" ? " · " : "") + formatBytes(att.sizeBytes) : ""}
          {att.storage === "url" ? " · enlace externo" : ""}
        </p>
      </div>
      {editable && (
        <button
          type="button"
          onClick={() => onRemove(att.id)}
          aria-label={`Eliminar adjunto ${att.name}`}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-gris-azul-dim hover:text-peligro"
        >
          <Papelera width={14} height={14} />
        </button>
      )}
    </li>
  );
}

export function NoteAttachmentsList({ attachments, editable, onRemove }: Props) {
  if (attachments.length === 0) return null;

  return (
    <div className="flex flex-col gap-2">
      <p className="font-display text-xs uppercase tracking-widest text-gris-azul">Adjuntos · {attachments.length}</p>
      <ul className="flex flex-col gap-1.5">
        {attachments.map((att) => (
          <AttachmentItem key={att.id} att={att} editable={editable} onRemove={onRemove} />
        ))}
      </ul>
    </div>
  );
}
