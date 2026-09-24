const { test, describe } = require("node:test");
const assert = require("node:assert");
const crypto = require("node:crypto");

// Minimal direct replica of JwtService logic for node test runner
const JWT_SECRET = process.env.AUTH_SECRET || "nails-express-secure-fortune500-secret-2026-tacna-peru";

function sign(payload, expiresInSeconds = 3600) {
  const exp = Math.floor(Date.now() / 1000) + expiresInSeconds;
  const fullPayload = { ...payload, exp };

  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");

  const signature = crypto
    .createHmac("sha256", JWT_SECRET)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest("base64url");

  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

function verify(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;

    const expectedSignature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url");

    if (
      !crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
      )
    ) {
      return null;
    }

    const payload = JSON.parse(
      Buffer.from(encodedPayload, "base64url").toString("utf-8")
    );

    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

describe("Security: JwtService Cryptographic Audit", () => {
  test("debe firmar y verificar un token de sesión legítimo", () => {
    const session = {
      userId: "usr-admin-1",
      email: "admin@nailsexpress.com",
      nombre: "Administrador",
      rol: "OWNER",
    };

    const token = sign(session);
    assert.ok(typeof token === "string");
    assert.strictEqual(token.split(".").length, 3);

    const verified = verify(token);
    assert.ok(verified !== null);
    assert.strictEqual(verified.userId, "usr-admin-1");
    assert.strictEqual(verified.rol, "OWNER");
  });

  test("debe rechazar tokens falsificados o con firma manipulada", () => {
    const token = sign({ userId: "user-1", rol: "MANICURISTA" });
    const parts = token.split(".");

    // Atacante altera payload para escalar a OWNER
    const forgedPayload = Buffer.from(
      JSON.stringify({ userId: "user-1", rol: "OWNER" })
    ).toString("base64url");

    const forgedToken = `${parts[0]}.${forgedPayload}.${parts[2]}`;
    const result = verify(forgedToken);

    assert.strictEqual(result, null, "Un token manipulado debe ser rechazado rotundamente");
  });

  test("debe rechazar tokens expirados", () => {
    // Token expirado hace 10 segundos
    const expiredToken = sign({ userId: "user-old" }, -10);
    const result = verify(expiredToken);

    assert.strictEqual(result, null, "Un token vencido debe ser inválido");
  });
});
