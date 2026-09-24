import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { bookingService } from "@/lib/application/booking.service";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const startStr = searchParams.get("start");
    const endStr = searchParams.get("end");
    const staffId = searchParams.get("staffId");
    const status = searchParams.get("status");

    const whereClause: any = {};

    // If role is MANICURISTA, only see own appointments
    if (session.rol === "MANICURISTA" && session.staffId) {
      whereClause.staffId = session.staffId;
    } else if (staffId && staffId !== "all") {
      whereClause.staffId = staffId;
    }

    if (startStr && endStr) {
      whereClause.startAt = {
        gte: new Date(startStr),
        lte: new Date(endStr),
      };
    }

    if (status && status !== "all") {
      whereClause.estado = status;
    }

    const appointments = await prisma.appointment.findMany({
      where: whereClause,
      include: {
        customer: true,
        service: true,
        staff: true,
        logs: { orderBy: { fecha: "desc" } },
      },
      orderBy: { startAt: "asc" },
    });

    return NextResponse.json({ appointments });
  } catch (err: any) {
    console.error("Error fetching appointments:", err);
    return NextResponse.json(
      { error: "Error al cargar las citas." },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const body = await request.json();
    const {
      serviceId,
      startAt,
      staffId,
      nombre,
      celular,
      email,
      notasCliente,
      origen = "ADMIN",
    } = body;

    const appointment = await bookingService.createBooking({
      serviceId,
      startAt,
      staffId,
      nombre,
      celular,
      email,
      notasCliente,
      origen,
    });

    return NextResponse.json({ success: true, appointment }, { status: 201 });
  } catch (err: any) {
    console.error("Error creating admin appointment:", err);
    return NextResponse.json(
      { error: err.message || "Error al agendar la cita." },
      { status: 400 }
    );
  }
}
