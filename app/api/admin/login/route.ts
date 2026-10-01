import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setAdminSession } from "@/lib/auth";
import { verifyPassword, isHashed, hashPassword } from "@/lib/infrastructure/security/password";
import { rateLimit } from "@/lib/infrastructure/security/rate-limit";
import { logError } from "@/lib/infrastructure/logger";

// Hash ficticio para igualar el tiempo de respuesta cuando el correo no existe.
const DUMMY_HASH = hashPassword("nails-express-dummy-password-constant");

export async function POST(request: NextRequest) {
  try {
    // Límite de intentos por IP (anti fuerza bruta)
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "local";
    const gate = await rateLimit(`login:${ip}`, 8, 15 * 60 * 1000);
    if (!gate.ok) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo." },
        { status: 429 }
      );
    }

    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Correo y contraseña son requeridos." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    // Mensaje único y verificación de igual duración aunque el usuario no exista:
    // así no se revela si el correo está registrado (anti-enumeración + timing).
    const GENERICO = "Correo o contraseña incorrectos.";

    if (!user || !user.activo) {
      verifyPassword(password, DUMMY_HASH); // quema tiempo similar a un login real
      return NextResponse.json({ error: GENERICO }, { status: 401 });
    }

    // Verificación de contraseña con scrypt. Compatibilidad hacia atrás:
    // si el registro está en texto plano (datos viejos), se valida y se re-hashea.
    let valid = false;
    if (isHashed(user.passwordHash)) {
      valid = verifyPassword(password, user.passwordHash);
    } else {
      valid = user.passwordHash === password;
      if (valid) {
        await prisma.user.update({
          where: { id: user.id },
          data: { passwordHash: hashPassword(password) },
        });
      }
    }

    if (!valid) {
      return NextResponse.json(
        { error: GENERICO },
        { status: 401 }
      );
    }

    await setAdminSession(user);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
      },
    });
  } catch (error: any) {
    logError("login_error", error);
    return NextResponse.json(
      { error: "Error en el servidor al iniciar sesión." },
      { status: 500 }
    );
  }
}
