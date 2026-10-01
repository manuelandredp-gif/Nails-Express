import crypto from "crypto";

/**
 * Hash y verificación de contraseñas con scrypt (nativo de Node, sin dependencias).
 * Formato almacenado: scrypt$N$saltHex$hashHex
 */
const N = 16384; // costo CPU/memoria
const KEYLEN = 64;

export function hashPassword(plain: string): string {
  const salt = crypto.randomBytes(16);
  const derived = crypto.scryptSync(plain.normalize("NFKC"), salt, KEYLEN, { N });
  return `scrypt$${N}$${salt.toString("hex")}$${derived.toString("hex")}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  try {
    const parts = stored.split("$");
    if (parts.length !== 4 || parts[0] !== "scrypt") return false;
    const n = parseInt(parts[1], 10);
    const salt = Buffer.from(parts[2], "hex");
    const expected = Buffer.from(parts[3], "hex");
    const derived = crypto.scryptSync(plain.normalize("NFKC"), salt, expected.length, { N: n });
    return crypto.timingSafeEqual(derived, expected);
  } catch {
    return false;
  }
}

/** Indica si un valor almacenado ya está hasheado con este esquema. */
export function isHashed(stored: string): boolean {
  return typeof stored === "string" && stored.startsWith("scrypt$");
}
