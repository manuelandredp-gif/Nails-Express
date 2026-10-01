import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword } from "@/lib/infrastructure/security/password";
import { withManager, readJson, HttpError } from "@/lib/http/api";
import { userCreateSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

/** Lista los usuarios con acceso al panel (dueña, admin y trabajadoras). */
export const GET = withManager(async () => {
  const [users, staff] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: { id: true, nombre: true, email: true, rol: true, activo: true, staffId: true, createdAt: true },
    }),
    prisma.staff.findMany({
      where: { activo: true },
      select: { id: true, nombre: true },
      orderBy: { orden: "asc" },
    }),
  ]);
  return NextResponse.json({ users, staff });
});

/** Crea la cuenta de acceso de una empleada con el rol que asigne la administración. */
export const POST = withManager(async (req) => {
  const { nombre, email, password, staffId, rol } = await readJson(req, userCreateSchema);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new HttpError(409, "Ya existe un usuario con ese correo.");

  // Una manicurista solo puede tener una cuenta de acceso.
  if (staffId) {
    const yaVinculada = await prisma.user.findFirst({ where: { staffId } });
    if (yaVinculada) throw new HttpError(409, "Esa manicurista ya tiene una cuenta de acceso.");
  }

  const user = await prisma.user.create({
    data: {
      nombre,
      email,
      passwordHash: hashPassword(password),
      rol: rol ?? "MANICURISTA",
      staffId: staffId ?? null,
      activo: true,
    },
    select: { id: true, nombre: true, email: true, rol: true, activo: true, staffId: true, createdAt: true },
  });

  return NextResponse.json({ success: true, user }, { status: 201 });
});
