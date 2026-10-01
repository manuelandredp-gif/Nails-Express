import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/infrastructure/security/password";
import { withSession, readJson, HttpError } from "@/lib/http/api";
import { changePasswordSchema } from "@/lib/validation/schemas";

export const dynamic = "force-dynamic";

/** Permite a cualquier usuario logueado cambiar su propia contraseña. */
export const POST = withSession(async (req, _ctx, session) => {
  const { actual, nueva } = await readJson(req, changePasswordSchema);

  const user = await prisma.user.findUnique({ where: { id: session.userId } });
  if (!user) throw new HttpError(404, "Usuario no encontrado.");

  if (!verifyPassword(actual, user.passwordHash)) {
    throw new HttpError(400, "La contraseña actual no es correcta.");
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: hashPassword(nueva) },
  });

  return NextResponse.json({ success: true });
});
