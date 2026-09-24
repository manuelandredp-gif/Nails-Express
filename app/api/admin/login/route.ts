import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { setAdminSession } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
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

    if (!user || !user.activo) {
      return NextResponse.json(
        { error: "Credenciales inválidas o usuario inactivo." },
        { status: 401 }
      );
    }

    // Simple password check (in production can use bcrypt.compare)
    if (user.passwordHash !== password.trim()) {
      return NextResponse.json(
        { error: "Contraseña incorrecta." },
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
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Error en el servidor al iniciar sesión." },
      { status: 500 }
    );
  }
}
