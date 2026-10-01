import React from "react";
import { prisma } from "@/lib/db";
import { requireManager } from "@/lib/auth";
import TeamAccessManager from "@/components/admin/TeamAccessManager";

export const dynamic = "force-dynamic";

export default async function EquipoPage() {
  await requireManager();

  const [users, staff] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        staffId: true,
      },
    }),
    prisma.staff.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, foto: true, color: true },
      orderBy: { orden: "asc" },
    }),
  ]);

  // Cada manicurista (Staff) puede tener —o no— una cuenta de acceso (User).
  const managers = users
    .filter((u) => u.rol === "OWNER" || u.rol === "ADMIN")
    .map((u) => ({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol }));

  const manicuristas = staff.map((s) => {
    const cuenta = users.find(
      (u) => u.staffId === s.id && (u.rol === "MANICURISTA" || u.rol === "RECEPCION")
    );
    return {
      staffId: s.id,
      nombre: s.nombre,
      foto: s.foto,
      color: s.color,
      cuenta: cuenta
        ? {
            userId: cuenta.id,
            email: cuenta.email,
            activo: cuenta.activo,
          }
        : null,
    };
  });

  return <TeamAccessManager manicuristas={manicuristas} managers={managers} />;
}
