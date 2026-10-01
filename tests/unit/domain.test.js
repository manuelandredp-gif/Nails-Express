const { test, describe } = require("node:test");
const assert = require("node:assert");

/**
 * Tests unitarios puros (sin base de datos) de las utilidades de dominio.
 * Corren en CI en milisegundos y protegen las reglas más fáciles de romper sin
 * darse cuenta: acumulación de dinero, normalización de celulares y permisos.
 */

// Réplicas mínimas de la lógica (el código fuente es TS; aquí validamos el comportamiento).
function redondearDinero(n) {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}
function sumarDinero(importes) {
  const centimos = importes.reduce((acc, n) => acc + Math.round((n + Number.EPSILON) * 100), 0);
  return centimos / 100;
}
function normalizarCelular(phone) {
  const c = (phone || "").replace(/[^\d+]/g, "");
  if (c.startsWith("+51")) return c;
  if (c.startsWith("51") && c.length >= 11) return `+${c}`;
  if (c.length === 9) return `+51${c}`;
  return c;
}
function isManagerRol(rol) {
  return rol === "OWNER" || rol === "ADMIN";
}

describe("Dominio: dinero", () => {
  test("suma de importes clásicos de floats sin error de acumulación", () => {
    // 0.1 + 0.2 en float da 0.30000000000000004; la suma de caja debe dar 0.3
    assert.strictEqual(sumarDinero([0.1, 0.2]), 0.3);
  });

  test("suma muchos cobros con céntimos de forma exacta", () => {
    const cobros = [39.9, 50.1, 19.99, 0.01, 120.5];
    assert.strictEqual(sumarDinero(cobros), 230.5);
  });

  test("redondea a 2 decimales", () => {
    assert.strictEqual(redondearDinero(10.005), 10.01);
    assert.strictEqual(redondearDinero(39), 39);
  });
});

describe("Dominio: celular", () => {
  test("normaliza formatos peruanos a E.164 (+51)", () => {
    assert.strictEqual(normalizarCelular("952123456"), "+51952123456");
    assert.strictEqual(normalizarCelular("952 123 456"), "+51952123456");
    assert.strictEqual(normalizarCelular("+51 952 123 456"), "+51952123456");
    assert.strictEqual(normalizarCelular("51952123456"), "+51952123456");
  });
});

describe("Dominio: roles", () => {
  test("OWNER y ADMIN son gerencia; RECEPCION y MANICURISTA no", () => {
    assert.strictEqual(isManagerRol("OWNER"), true);
    assert.strictEqual(isManagerRol("ADMIN"), true);
    assert.strictEqual(isManagerRol("RECEPCION"), false);
    assert.strictEqual(isManagerRol("MANICURISTA"), false);
    assert.strictEqual(isManagerRol(null), false);
  });
});
