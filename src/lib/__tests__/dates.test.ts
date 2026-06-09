import { describe, it, expect } from "vitest";
import {
  fromKey,
  toKey,
  todayKey,
  fmtLargo,
  fmtCorto,
  fmtMes,
  fmtDiaSemana,
  diaDelMes,
  sumarDias,
  diasEntre,
  dentroDe,
  gridMes,
  semanaDe,
  semanaKey,
  mesKey,
  diaKey,
  etiquetaSemana,
  etiquetaMes,
  periodKeyDe,
  etiquetaZona,
  horaEnZona,
  zonaDispositivo,
  NOMBRES_DIA,
} from "../dates";

/* ── fromKey / toKey ── */
describe("fromKey", () => {
  it("convierte 'yyyy-MM-dd' a Date con hora 12:00 local", () => {
    const d = fromKey("2026-06-09");
    expect(d.getHours()).toBe(12);
    expect(d.getMinutes()).toBe(0);
  });

  it("preserva el día correcto (no hay corrimiento UTC)", () => {
    const d = fromKey("2026-01-01");
    expect(d.getDate()).toBe(1);
    expect(d.getMonth()).toBe(0); // enero
    expect(d.getFullYear()).toBe(2026);
  });
});

describe("toKey", () => {
  it("convierte Date a 'yyyy-MM-dd'", () => {
    const d = new Date(2026, 5, 9, 12, 0); // 9-jun-2026 local
    expect(toKey(d)).toBe("2026-06-09");
  });

  it("round-trip fromKey → toKey", () => {
    const key = "2025-12-31";
    expect(toKey(fromKey(key))).toBe(key);
  });
});

describe("todayKey", () => {
  it("retorna string con formato yyyy-MM-dd", () => {
    expect(todayKey()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});

/* ── Formateo ── */
describe("fmtLargo", () => {
  it("formatea en español largo", () => {
    const r = fmtLargo("2026-06-09");
    expect(r).toMatch(/martes/i);
    expect(r).toMatch(/junio/i);
    expect(r).toMatch(/2026/);
  });

  it("incluye el día del mes", () => {
    expect(fmtLargo("2026-06-01")).toMatch(/1/);
  });
});

describe("fmtCorto", () => {
  it("retorna formato corto con mes abreviado", () => {
    const r = fmtCorto("2026-06-09");
    expect(r).toMatch(/jun/i);
    expect(r).toMatch(/9/);
  });
});

describe("fmtMes", () => {
  it("retorna nombre del mes y año", () => {
    const d = new Date(2026, 5, 1); // junio 2026
    expect(fmtMes(d)).toMatch(/junio/i);
    expect(fmtMes(d)).toMatch(/2026/);
  });
});

describe("fmtDiaSemana", () => {
  it("retorna abreviatura del día en español", () => {
    // 2026-06-09 es martes
    const r = fmtDiaSemana("2026-06-09");
    expect(r).toMatch(/mar/i);
  });
});

/* ── Aritmética de fechas ── */
describe("diaDelMes", () => {
  it("retorna el número de día correcto", () => {
    expect(diaDelMes("2026-06-09")).toBe(9);
    expect(diaDelMes("2026-01-31")).toBe(31);
  });
});

describe("sumarDias", () => {
  it("suma días correctamente", () => {
    expect(sumarDias("2026-06-09", 1)).toBe("2026-06-10");
    expect(sumarDias("2026-06-09", 0)).toBe("2026-06-09");
    expect(sumarDias("2026-06-09", -1)).toBe("2026-06-08");
  });

  it("cruza fin de mes", () => {
    expect(sumarDias("2026-01-31", 1)).toBe("2026-02-01");
  });

  it("cruza fin de año", () => {
    expect(sumarDias("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("diasEntre", () => {
  it("calcula días entre dos fechas", () => {
    expect(diasEntre("2026-06-01", "2026-06-09")).toBe(8);
  });

  it("retorna 0 para la misma fecha", () => {
    expect(diasEntre("2026-06-09", "2026-06-09")).toBe(0);
  });

  it("retorna negativo si b < a", () => {
    expect(diasEntre("2026-06-09", "2026-06-01")).toBe(-8);
  });
});

describe("dentroDe", () => {
  it("retorna true cuando la fecha está dentro del intervalo", () => {
    expect(dentroDe("2026-06-05", "2026-06-01", "2026-06-09")).toBe(true);
  });

  it("retorna true en los límites inclusive", () => {
    expect(dentroDe("2026-06-01", "2026-06-01", "2026-06-09")).toBe(true);
    expect(dentroDe("2026-06-09", "2026-06-01", "2026-06-09")).toBe(true);
  });

  it("retorna false fuera del intervalo", () => {
    expect(dentroDe("2026-05-31", "2026-06-01", "2026-06-09")).toBe(false);
    expect(dentroDe("2026-06-10", "2026-06-01", "2026-06-09")).toBe(false);
  });
});

/* ── Grid de mes y semana ── */
describe("gridMes", () => {
  it("retorna una matriz de arrays de 7 días", () => {
    const grid = gridMes(new Date(2026, 5, 1)); // junio 2026
    expect(grid.length).toBeGreaterThan(0);
    for (const semana of grid) {
      expect(semana.length).toBe(7);
    }
  });

  it("todos los elementos tienen formato yyyy-MM-dd", () => {
    const grid = gridMes(new Date(2026, 5, 1));
    for (const semana of grid) {
      for (const dia of semana) {
        expect(dia).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      }
    }
  });

  it("el primer día es lunes", () => {
    const grid = gridMes(new Date(2026, 5, 1)); // junio 2026
    const primerDia = fromKey(grid[0][0]);
    expect(primerDia.getDay()).toBe(1); // lunes = 1
  });

  it("el último día es domingo", () => {
    const grid = gridMes(new Date(2026, 5, 1));
    const ultima = grid[grid.length - 1];
    const ultimoDia = fromKey(ultima[ultima.length - 1]);
    expect(ultimoDia.getDay()).toBe(0); // domingo = 0
  });

  it("cubre al menos todos los días del mes de junio 2026", () => {
    const grid = gridMes(new Date(2026, 5, 1));
    const dias = grid.flat();
    expect(dias).toContain("2026-06-01");
    expect(dias).toContain("2026-06-30");
  });
});

describe("semanaDe", () => {
  it("retorna 7 días", () => {
    expect(semanaDe("2026-06-09").length).toBe(7);
  });

  it("empieza en lunes", () => {
    const semana = semanaDe("2026-06-09");
    const lunes = fromKey(semana[0]);
    expect(lunes.getDay()).toBe(1);
  });

  it("termina en domingo", () => {
    const semana = semanaDe("2026-06-09");
    const domingo = fromKey(semana[6]);
    expect(domingo.getDay()).toBe(0);
  });

  it("contiene la fecha de entrada", () => {
    const semana = semanaDe("2026-06-09");
    expect(semana).toContain("2026-06-09");
  });

  it("2026-06-09 (martes) → semana empieza en 2026-06-08 (lunes)", () => {
    const semana = semanaDe("2026-06-09");
    expect(semana[0]).toBe("2026-06-08");
    expect(semana[6]).toBe("2026-06-14");
  });
});

describe("NOMBRES_DIA", () => {
  it("contiene 7 nombres de día", () => {
    expect(NOMBRES_DIA.length).toBe(7);
  });

  it("empieza con 'lun' y termina con 'dom'", () => {
    expect(NOMBRES_DIA[0]).toBe("lun");
    expect(NOMBRES_DIA[6]).toBe("dom");
  });
});

/* ── Claves de período ── */
describe("diaKey", () => {
  it("es un passthrough de la key", () => {
    expect(diaKey("2026-06-09")).toBe("2026-06-09");
  });
});

describe("semanaKey", () => {
  it("retorna formato yyyy-Www", () => {
    expect(semanaKey("2026-06-09")).toMatch(/^\d{4}-W\d{2}$/);
  });

  it("2026-06-09 está en la semana 24 de 2026", () => {
    expect(semanaKey("2026-06-09")).toBe("2026-W24");
  });

  it("2026-01-01 (inicio de año)", () => {
    // 2026-01-01 es jueves, semana ISO 1 de 2026
    expect(semanaKey("2026-01-01")).toBe("2026-W01");
  });
});

describe("mesKey", () => {
  it("retorna los primeros 7 caracteres de la key", () => {
    expect(mesKey("2026-06-09")).toBe("2026-06");
    expect(mesKey("2025-12-31")).toBe("2025-12");
  });
});

describe("etiquetaSemana", () => {
  it("retorna string con guión entre días", () => {
    const r = etiquetaSemana("2026-06-09");
    expect(r).toContain("–");
  });

  it("2026-06-09 → semana 8 – 14 jun", () => {
    const r = etiquetaSemana("2026-06-09");
    expect(r).toMatch(/8/);
    expect(r).toMatch(/14/);
    expect(r).toMatch(/jun/i);
  });
});

describe("etiquetaMes", () => {
  it("retorna nombre del mes capitalizado y año", () => {
    const r = etiquetaMes("2026-06");
    expect(r).toMatch(/junio/i);
    expect(r).toMatch(/2026/);
  });

  it("funciona para enero", () => {
    const r = etiquetaMes("2026-01");
    expect(r).toMatch(/enero/i);
  });
});

describe("periodKeyDe", () => {
  it("scope 'day' retorna la key tal cual", () => {
    expect(periodKeyDe("day", "2026-06-09")).toBe("2026-06-09");
  });

  it("scope 'week' retorna semanaKey", () => {
    expect(periodKeyDe("week", "2026-06-09")).toBe(semanaKey("2026-06-09"));
  });

  it("scope 'month' retorna mesKey", () => {
    expect(periodKeyDe("month", "2026-06-09")).toBe("2026-06");
  });
});

/* ── Zona horaria ── */
describe("zonaDispositivo", () => {
  it("retorna un string no vacío", () => {
    const tz = zonaDispositivo();
    expect(typeof tz).toBe("string");
    expect(tz.length).toBeGreaterThan(0);
  });
});

describe("horaEnZona", () => {
  it("retorna formato HH:mm para zona válida", () => {
    const h = horaEnZona("America/Argentina/Buenos_Aires");
    expect(h).toMatch(/^\d{2}:\d{2}$/);
  });

  it("retorna '--:--' para zona inválida", () => {
    expect(horaEnZona("Invalid/Zone_XYZ")).toBe("--:--");
  });

  it("acepta fecha como segundo argumento", () => {
    const fecha = new Date(2026, 5, 9, 15, 30, 0);
    const h = horaEnZona("UTC", fecha);
    expect(h).toMatch(/^\d{2}:\d{2}$/);
  });
});

describe("etiquetaZona", () => {
  it("extrae la última parte del path", () => {
    expect(etiquetaZona("America/Argentina/Buenos_Aires")).toBe("Buenos Aires");
    expect(etiquetaZona("Europe/London")).toBe("London");
    expect(etiquetaZona("UTC")).toBe("UTC");
  });

  it("reemplaza guiones bajos por espacios", () => {
    expect(etiquetaZona("America/New_York")).toBe("New York");
  });
});
