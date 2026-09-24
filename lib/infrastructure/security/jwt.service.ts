import crypto from "crypto";

const JWT_SECRET = process.env.AUTH_SECRET || "nails-express-secure-fortune500-secret-2026-tacna-peru";

export interface SessionPayload {
  userId: string;
  email: string;
  nombre: string;
  rol: "OWNER" | "ADMIN" | "RECEPCION" | "MANICURISTA";
  staffId?: string | null;
  exp: number; // Expiration timestamp in seconds
}

export class JwtService {
  /**
   * Signs a payload with HMAC-SHA256 producing header.payload.signature
   */
  static sign(payload: Omit<SessionPayload, "exp">, expiresInDays = 7): string {
    const exp = Math.floor(Date.now() / 1000) + expiresInDays * 24 * 60 * 60;
    const fullPayload: SessionPayload = { ...payload, exp };

    const header = { alg: "HS256", typ: "JWT" };
    const encodedHeader = Buffer.from(JSON.stringify(header)).toString("base64url");
    const encodedPayload = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");

    const signature = crypto
      .createHmac("sha256", JWT_SECRET)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest("base64url");

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  /**
   * Verifies the cryptographic HMAC signature and expiration
   */
  static verify(token: string): SessionPayload | null {
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
      ) as SessionPayload;

      // Check expiration
      if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) {
        return null;
      }

      return payload;
    } catch {
      return null;
    }
  }
}
