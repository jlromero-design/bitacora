import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { isNoteEditable, attachmentIcon, formatBytes, formatDuration } from "../note-utils";
import type { Note } from "../types";

function makeNote(createdAt: string): Note {
  return {
    id: "n1",
    dayKey: "2026-06-10",
    text: "Test",
    createdAt,
    updatedAt: createdAt,
    tz: "America/Argentina/Buenos_Aires",
  };
}

describe("isNoteEditable", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("nota creada hace 1 hora es editable", () => {
    const now = new Date("2026-06-10T10:00:00Z");
    vi.setSystemTime(now);
    const nota = makeNote("2026-06-10T09:00:00Z");
    expect(isNoteEditable(nota)).toBe(true);
  });

  it("nota creada hace exactamente 24h no es editable", () => {
    const now = new Date("2026-06-10T10:00:00Z");
    vi.setSystemTime(now);
    const nota = makeNote("2026-06-09T10:00:00Z");
    expect(isNoteEditable(nota)).toBe(false);
  });

  it("nota creada hace 23h 59m sí es editable", () => {
    const now = new Date("2026-06-10T10:00:00Z");
    vi.setSystemTime(now);
    const nota = makeNote("2026-06-09T10:01:00Z");
    expect(isNoteEditable(nota)).toBe(true);
  });

  it("nota creada hace 25h no es editable", () => {
    const now = new Date("2026-06-10T10:00:00Z");
    vi.setSystemTime(now);
    const nota = makeNote("2026-06-09T09:00:00Z");
    expect(isNoteEditable(nota)).toBe(false);
  });
});

describe("attachmentIcon", () => {
  it("voice → 🎙", () => expect(attachmentIcon("voice")).toBe("🎙"));
  it("image → 🖼", () => expect(attachmentIcon("image")).toBe("🖼"));
  it("document → 📄", () => expect(attachmentIcon("document")).toBe("📄"));
});

describe("formatBytes", () => {
  it("menos de 1 KB", () => expect(formatBytes(512)).toBe("512 B"));
  it("kilobytes", () => expect(formatBytes(1536)).toBe("1.5 KB"));
  it("megabytes", () => expect(formatBytes(2 * 1024 * 1024)).toBe("2.0 MB"));
});

describe("formatDuration", () => {
  it("menos de un minuto", () => expect(formatDuration(45)).toBe("0:45"));
  it("un minuto exacto", () => expect(formatDuration(60)).toBe("1:00"));
  it("1 minuto 30 segundos", () => expect(formatDuration(90)).toBe("1:30"));
  it("segundos con cero inicial", () => expect(formatDuration(65)).toBe("1:05"));
});
