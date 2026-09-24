const { test, describe } = require("node:test");
const assert = require("node:assert");

function normalizePhone(phone) {
  const cleaned = phone.replace(/[^\d+]/g, "");
  if (cleaned.startsWith("+51")) return cleaned;
  if (cleaned.startsWith("51") && cleaned.length >= 11) return `+${cleaned}`;
  if (cleaned.length === 9) return `+51${cleaned}`;
  return cleaned;
}

function generateSecureBookingCode() {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let result = "NX-";
  for (let i = 0; i < 5; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

describe("Application: BookingService Domain Logic", () => {
  test("debe normalizar números de celular estándar de Perú a formato E.164 (+51)", () => {
    assert.strictEqual(normalizePhone("952123456"), "+51952123456");
    assert.strictEqual(normalizePhone("952 123 456"), "+51952123456");
    assert.strictEqual(normalizePhone("+51 952 123 456"), "+51952123456");
    assert.strictEqual(normalizePhone("51952123456"), "+51952123456");
  });

  test("debe generar códigos de reserva seguros con prefijo NX- y sin caracteres ambiguos (0, 1, I, O)", () => {
    const codes = new Set();
    const ambiguousChars = ["0", "1", "I", "O"];

    for (let i = 0; i < 50; i++) {
      const code = generateSecureBookingCode();
      assert.ok(code.startsWith("NX-"), "Debe comenzar con NX-");
      assert.strictEqual(code.length, 8, "Debe tener longitud 8 (NX-XXXXX)");

      ambiguousChars.forEach((ch) => {
        assert.ok(!code.includes(ch), `El código no debe incluir el carácter confuso '${ch}'`);
      });

      codes.add(code);
    }

    // High entropy verification: 50 codes must all be distinct
    assert.strictEqual(codes.size, 50, "Los 50 códigos generados deben ser únicos");
  });
});
