import { describe, it, expect } from "vitest";
import { PAISES, buscarPais, ciudadesDeProvincia } from "../places";

describe("buscarPais", () => {
  it("encuentra un país existente", () => {
    const p = buscarPais("Argentina");
    expect(p).toBeDefined();
    expect(p?.nombre).toBe("Argentina");
  });

  it("retorna undefined para país inexistente", () => {
    expect(buscarPais("Narnia")).toBeUndefined();
  });

  it("es sensible a mayúsculas", () => {
    expect(buscarPais("argentina")).toBeUndefined();
  });

  it("cada país tiene moneda, timezone, provincias y ciudades", () => {
    for (const p of PAISES) {
      expect(p.nombre).toBeTruthy();
      expect(p.currency).toBeTruthy();
      expect(p.timezone).toBeTruthy();
      expect(p.provincias.length).toBeGreaterThan(0);
      expect(Object.keys(p.ciudades).length).toBeGreaterThan(0);
    }
  });
});

describe("ciudadesDeProvincia", () => {
  it("retorna ciudades de una provincia existente", () => {
    const arg = buscarPais("Argentina");
    const ciudades = ciudadesDeProvincia(arg, "Córdoba");
    expect(ciudades).toContain("Córdoba");
    expect(ciudades.length).toBeGreaterThan(1);
  });

  it("retorna vacío si el país es undefined", () => {
    expect(ciudadesDeProvincia(undefined, "Córdoba")).toEqual([]);
  });

  it("retorna vacío si la provincia es vacía", () => {
    const arg = buscarPais("Argentina");
    expect(ciudadesDeProvincia(arg, "")).toEqual([]);
  });

  it("retorna vacío si la provincia no existe en el país", () => {
    const arg = buscarPais("Argentina");
    expect(ciudadesDeProvincia(arg, "Cataluña")).toEqual([]);
  });

  it("cascada completa: Argentina → CABA → Buenos Aires", () => {
    const arg = buscarPais("Argentina");
    const ciudades = ciudadesDeProvincia(arg, "CABA");
    expect(ciudades).toContain("Buenos Aires");
  });

  it("cascada completa: Reino Unido → Inglaterra → Londres", () => {
    const uk = buscarPais("Reino Unido");
    const ciudades = ciudadesDeProvincia(uk, "Inglaterra");
    expect(ciudades).toContain("Londres");
  });

  it("todas las provincias de cada país tienen ciudades definidas", () => {
    for (const pais of PAISES) {
      for (const provincia of pais.provincias) {
        const ciudades = ciudadesDeProvincia(pais, provincia);
        expect(ciudades.length, `${pais.nombre} → ${provincia} sin ciudades`).toBeGreaterThan(0);
      }
    }
  });
});

describe("consistencia del catálogo", () => {
  it("las claves de ciudades coinciden con las provincias declaradas", () => {
    for (const pais of PAISES) {
      const claves = Object.keys(pais.ciudades);
      for (const clave of claves) {
        expect(
          pais.provincias,
          `Clave '${clave}' en ciudades de ${pais.nombre} no está en provincias`
        ).toContain(clave);
      }
    }
  });

  it("no hay ciudades duplicadas dentro de una provincia", () => {
    for (const pais of PAISES) {
      for (const [provincia, ciudades] of Object.entries(pais.ciudades)) {
        const uniq = new Set(ciudades);
        expect(uniq.size, `Ciudades duplicadas en ${pais.nombre} → ${provincia}`).toBe(ciudades.length);
      }
    }
  });
});
