import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { revalidatePublicSite } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const staff = await prisma.staff.findMany({
      include: {
        servicios: { include: { service: true } },
      },
      orderBy: { orden: "asc" },
    });
    return NextResponse.json({ staff });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al listar personal." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || (session.rol !== "OWNER" && session.rol !== "ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { nombre, foto, color, bio } = await request.json();
    const count = await prisma.staff.count();

    const staff = await prisma.staff.create({
      data: {
        nombre,
        foto:
          foto ||
          "https://images.unsplash.com/photo-1595152772835-219674b2a8a6?w=400",
        color: color || "#5CC6BF",
        bio: bio || "Manicurista profesional",
        activo: true,
        orden: count + 1,
      },
    });

    revalidatePublicSite();
    return NextResponse.json({ success: true, staff }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json(
      { error: "Error al registrar manicurista." },
      { status: 500 }
    );
  }
}
