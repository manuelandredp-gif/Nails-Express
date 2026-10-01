import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { revalidatePublicSite } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session || (session.rol !== "OWNER" && session.rol !== "ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { nombre, color, bio, activo, foto, dni, telefono, email, direccion } =
      await request.json();
    const dataToUpdate: any = {};
    if (nombre !== undefined) dataToUpdate.nombre = String(nombre).trim();
    if (color !== undefined) dataToUpdate.color = color;
    if (bio !== undefined) dataToUpdate.bio = bio;
    if (foto !== undefined && foto) dataToUpdate.foto = foto;
    if (activo !== undefined) dataToUpdate.activo = Boolean(activo);
    // Ficha interna de la empleada
    if (dni !== undefined) dataToUpdate.dni = dni ? String(dni).trim() : null;
    if (telefono !== undefined)
      dataToUpdate.telefono = telefono ? String(telefono).trim() : null;
    if (email !== undefined)
      dataToUpdate.email = email ? String(email).trim().toLowerCase() : null;
    if (direccion !== undefined)
      dataToUpdate.direccion = direccion ? String(direccion).trim() : null;

    const staff = await prisma.staff.update({
      where: { id: params.id },
      data: dataToUpdate,
    });

    revalidatePublicSite();
    return NextResponse.json({ success: true, staff });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al actualizar manicurista." },
      { status: 500 }
    );
  }
}

/**
 * Elimina a la empleada. Si tiene citas registradas no se puede borrar
 * (se perdería el historial): en ese caso se desactiva.
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getAdminSession();
    if (!session || (session.rol !== "OWNER" && session.rol !== "ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const citas = await prisma.appointment.count({
      where: { staffId: params.id },
    });

    // Siempre se elimina su cuenta de acceso y sus vínculos
    await prisma.user.deleteMany({ where: { staffId: params.id } });

    if (citas > 0) {
      await prisma.staff.update({
        where: { id: params.id },
        data: { activo: false },
      });
      revalidatePublicSite();
      return NextResponse.json({
        success: true,
        desactivada: true,
        mensaje: `Tiene ${citas} citas en el historial, así que se desactivó (no aparecerá en la agenda ni en la web).`,
      });
    }

    await prisma.staffService.deleteMany({ where: { staffId: params.id } });
    await prisma.timeBlock.deleteMany({ where: { staffId: params.id } });
    await prisma.staff.delete({ where: { id: params.id } });

    revalidatePublicSite();
    return NextResponse.json({ success: true, desactivada: false });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al eliminar la empleada." },
      { status: 500 }
    );
  }
}
