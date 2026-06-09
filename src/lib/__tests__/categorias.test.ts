import { describe, it, expect } from "vitest";
import { CATALOGO, categoriaById, type CatalogoCategoria } from "../categorias";

describe("CATALOGO – estructura general", () => {
  it("contiene al menos una categoría", () => {
    expect(CATALOGO.length).toBeGreaterThan(0);
  });

  it("cada categoría tiene id, nombre, emoji, colorToken y subcategorias", () => {
    for (const cat of CATALOGO) {
      expect(cat.id, `falta id en ${JSON.stringify(cat)}`).toBeTruthy();
      expect(cat.nombre, `falta nombre en ${cat.id}`).toBeTruthy();
      expect(cat.emoji, `falta emoji en ${cat.id}`).toBeTruthy();
      expect(cat.colorToken, `falta colorToken en ${cat.id}`).toBeTruthy();
      expect(Array.isArray(cat.subcategorias), `subcategorias no es array en ${cat.id}`).toBe(true);
      expect(cat.subcategorias.length, `${cat.id} no tiene subcategorías`).toBeGreaterThan(0);
    }
  });

  it("todos los ids son únicos", () => {
    const ids = CATALOGO.map((c) => c.id);
    const uniq = new Set(ids);
    expect(uniq.size).toBe(ids.length);
  });

  it("ninguna subcategoría está vacía dentro de una misma categoría", () => {
    for (const cat of CATALOGO) {
      for (const sub of cat.subcategorias) {
        expect(sub.trim(), `subcategoría vacía en ${cat.id}`).toBeTruthy();
      }
    }
  });

  it("no hay subcategorías duplicadas dentro de una misma categoría", () => {
    for (const cat of CATALOGO) {
      const uniq = new Set(cat.subcategorias);
      expect(
        uniq.size,
        `Subcategorías duplicadas en categoría '${cat.id}'`
      ).toBe(cat.subcategorias.length);
    }
  });
});

describe("CATALOGO – categorías concretas", () => {
  it("existe la categoría 'transporte'", () => {
    const c = CATALOGO.find((x) => x.id === "transporte");
    expect(c).toBeDefined();
    expect(c?.nombre).toBe("Transporte");
  });

  it("transporte contiene 'Pasaje aéreo' y 'Taxi'", () => {
    const c = CATALOGO.find((x) => x.id === "transporte");
    expect(c?.subcategorias).toContain("Pasaje aéreo");
    expect(c?.subcategorias).toContain("Taxi");
  });

  it("existe la categoría 'alojamiento' con Hotel y Airbnb", () => {
    const c = CATALOGO.find((x) => x.id === "alojamiento");
    expect(c).toBeDefined();
    expect(c?.subcategorias).toContain("Hotel");
    expect(c?.subcategorias).toContain("Airbnb");
  });

  it("existe la categoría 'alimentacion' con Desayuno, Almuerzo y Cena", () => {
    const c = CATALOGO.find((x) => x.id === "alimentacion");
    expect(c).toBeDefined();
    expect(c?.subcategorias).toContain("Desayuno");
    expect(c?.subcategorias).toContain("Almuerzo");
    expect(c?.subcategorias).toContain("Cena");
  });

  it("existe la categoría 'imprevistos'", () => {
    const c = CATALOGO.find((x) => x.id === "imprevistos");
    expect(c).toBeDefined();
    expect(c?.emoji).toBe("⚡");
  });

  it("existe la categoría 'otros' con exactamente una subcategoría", () => {
    const c = CATALOGO.find((x) => x.id === "otros");
    expect(c).toBeDefined();
    expect(c?.subcategorias.length).toBe(1);
  });
});

describe("categoriaById", () => {
  it("retorna la categoría correcta por id existente", () => {
    const c = categoriaById("transporte");
    expect(c).toBeDefined();
    expect(c?.id).toBe("transporte");
    expect(c?.nombre).toBe("Transporte");
  });

  it("retorna undefined para id inexistente", () => {
    expect(categoriaById("xxxnope")).toBeUndefined();
  });

  it("retorna undefined para string vacío", () => {
    expect(categoriaById("")).toBeUndefined();
  });

  it("es sensible a mayúsculas (id en minúsculas)", () => {
    expect(categoriaById("Transporte")).toBeUndefined();
  });

  it("retorna la referencia exacta al objeto del catálogo", () => {
    const c = categoriaById("salud");
    const fromCatalog = CATALOGO.find((x) => x.id === "salud");
    expect(c).toBe(fromCatalog);
  });

  it("funciona para todos los ids del catálogo", () => {
    for (const cat of CATALOGO) {
      const found = categoriaById(cat.id);
      expect(found, `categoriaById('${cat.id}') debería encontrar la categoría`).toBeDefined();
      expect(found?.id).toBe(cat.id);
    }
  });

  it("retorna categoría 'finanzas' con emoji 💱", () => {
    const c = categoriaById("finanzas");
    expect(c?.emoji).toBe("💱");
  });

  it("retorna categoría 'estudio' con colorToken 'laton'", () => {
    const c = categoriaById("estudio");
    expect(c?.colorToken).toBe("laton");
  });
});
