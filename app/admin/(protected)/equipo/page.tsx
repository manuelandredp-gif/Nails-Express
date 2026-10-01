import React from "react";
import { prisma } from "@/lib/db";
import { requireManager } from "@/lib/auth";
import TeamAccessManager from "@/components/admin/TeamAccessManager";

export const dynamic = "force-dynamic";

export default async function EquipoPage() {
  const session = await requireManager();

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
      orderBy: { orden: "asc" },
      select: {
        id: true,
        nombre: true,
        foto: true,
        color: true,
        activo: true,
        dni: true,
        telefono: true,
        email: true,
        direccion: true,
      },
    }),
  ]);

  // Cada empleada (Staff) con su cuenta de acceso, si la tiene.
  const empleadas = staff.map((s) => {
    const cuenta = users.find((u) => u.staffId === s.id);
    return {
      staffId: s.id,
      nombre: s.nombre,
      foto: s.foto,
      color: s.color,
      activo: s.activo,
      dni: s.dni,
      telefono: s.telefono,
      email: s.email,
      direccion: s.direccion,
      cuenta: cuenta
        ? {
            userId: cuenta.id,
            email: cuenta.email,
            rol: cuenta.rol,
            activo: cuenta.activo,
          }
        : null,
    };
  });

  // Cuentas de administración sin vincular a una empleada (la dueña, etc.)
  const managers = users
    .filter(
      (u) => (u.rol === "OWNER" || u.rol === "ADMIN") && !u.staffId
    )
    .map((u) => ({ id: u.id, nombre: u.nombre, email: u.email, rol: u.rol }));

  return (
    <TeamAccessManager
      empleadas={empleadas}
      managers={managers}
      miUserId={session.userId}
    />
  );
}
