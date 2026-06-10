"use client";
import { useState } from "react";
import type { Note, NoteContact, NoteAttachment } from "@/lib/types";
import { isNoteEditable } from "@/lib/note-utils";
import { useStore } from "@/lib/store";
import { inputClase } from "@/components/ui";
import { VoiceRecorder } from "./voice-recorder";
import { AttachmentUrlInput } from "./attachment-url-input";
import { AttachmentUpload } from "./attachment-upload";
import { ContactPicker } from "./contact-picker";
import { NoteContactsList } from "./note-contacts-list";
import { NoteAttachmentsList } from "./note-attachments-list";

type Panel = "voice" | "url" | "upload" | "contact" | null;

type Props = {
  dayKey: string;
  nota: Note | null;
  onNew?: () => void;
};

export function NoteEditor({ dayKey, nota, onNew }: Props) {
  const { upsertNote, updateNoteText, addNoteContact, removeNoteContact, addNoteAttachment, removeNoteAttachment } = useStore();
  const [panel, setPanel] = useState<Panel>(null);

  const editable = !nota || isNoteEditable(nota);
  const contacts = nota?.contacts ?? [];
  const attachments = nota?.attachments ?? [];

  function handleText(e: React.ChangeEvent<HTMLTextAreaElement>) {
    if (!editable) return;
    if (nota) {
      updateNoteText(nota.id, e.target.value);
    } else {
      upsertNote(dayKey, e.target.value);
    }
  }

  function handleAddContact(contact: NoteContact) {
    if (nota) addNoteContact(nota.id, contact);
    setPanel(null);
  }

  function handleAddAttachment(attachment: NoteAttachment) {
    if (nota) addNoteAttachment(nota.id, attachment);
    setPanel(null);
  }

  function handleRemoveContact(id: string) {
    if (nota) removeNoteContact(nota.id, id);
  }

  function handleRemoveAttachment(id: string) {
    if (nota) removeNoteAttachment(nota.id, id);
  }

  const hasContent = (nota?.text.trim() ?? "").length > 0 || contacts.length > 0 || attachments.length > 0;

  return (
    <div className="flex flex-col gap-4">
      {editable ? (
        <textarea
          className={`${inputClase} min-h-[120px] resize-y font-serif`}
          value={nota?.text ?? ""}
          onChange={handleText}
          placeholder="¿Qué pasó hoy?…"
          autoFocus={!nota?.text}
        />
      ) : (
        <p className="whitespace-pre-wrap font-serif text-marfil-dim">{nota?.text}</p>
      )}

      <NoteContactsList contacts={contacts} editable={editable} onRemove={handleRemoveContact} />
      <NoteAttachmentsList attachments={attachments} editable={editable} onRemove={handleRemoveAttachment} />

      {panel === "voice" && <VoiceRecorder onSave={handleAddAttachment} onCancel={() => setPanel(null)} />}
      {panel === "url" && <AttachmentUrlInput onSave={handleAddAttachment} onCancel={() => setPanel(null)} />}
      {panel === "upload" && <AttachmentUpload onSave={handleAddAttachment} onCancel={() => setPanel(null)} />}
      {panel === "contact" && <ContactPicker onAdd={handleAddContact} onCancel={() => setPanel(null)} />}

      {editable && !panel && nota && (
        <div className="flex flex-wrap gap-2">
          <ActionBtn onClick={() => setPanel("contact")} label="👤 Persona" />
          <ActionBtn onClick={() => setPanel("upload")} label="📄 Archivo" />
          <ActionBtn onClick={() => setPanel("url")} label="🔗 Enlace" />
          <ActionBtn onClick={() => setPanel("voice")} label="🎙 Voz" />
          {onNew && hasContent && (
            <ActionBtn onClick={onNew} label="✦ Nueva nota" />
          )}
        </div>
      )}

      {editable && !panel && !nota && (
        <p className="text-xs italic text-gris-azul-dim">
          Escribí algo primero para poder agregar personas o adjuntos.
        </p>
      )}

      {!editable && (contacts.length > 0 || attachments.length > 0) && (
        <p className="text-xs text-gris-azul-dim">Esta nota ya no es editable (pasaron más de 24 h).</p>
      )}
    </div>
  );
}

function ActionBtn({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-[var(--hairline)] bg-[var(--tinta)] px-3 py-1.5 text-xs text-gris-azul transition-colors hover:border-laton hover:text-laton-claro"
    >
      {label}
    </button>
  );
}
