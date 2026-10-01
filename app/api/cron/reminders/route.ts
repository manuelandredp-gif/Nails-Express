import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { notifications } from "@/lib/application/notifications.service";
import { addHours, subMinutes, addMinutes } from "date-fns";
import { logError } from "@/lib/infrastructure/logger";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    // Autorización: requiere el secreto del cron (Vercel Cron envía este header).
    const secret = process.env.CRON_SECRET;
    const auth = request.headers.get("authorization");
    if (!secret || auth !== `Bearer ${secret}`) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const now = new Date();
    // Target window 24h ahead (+/- 30 min)
    const in24h = addHours(now, 24);
    const windowStart = subMinutes(in24h, 30);
    const windowEnd = addMinutes(in24h, 30);

    const appointments = await prisma.appointment.findMany({
      where: {
        estado: "CONFIRMADA",
        startAt: { gte: windowStart, lte: windowEnd },
      },
      include: {
        customer: true,
        service: true,
      },
    });

    let sentCount = 0;
    for (const app of appointments) {
      await notifications.sendReminder({
        toEmail: app.customer.email,
        toPhone: app.customer.celular,
        customerName: app.customer.nombre,
        serviceName: app.service.nombre,
        startAt: app.startAt,
        bookingCode: app.codigo,
        price: app.precio,
      });

      await prisma.appointmentLog.create({
        data: {
          appointmentId: app.id,
          accion: "RECORDATORIO_24H",
          detalle: `Recordatorio automático 24h enviado a ${app.customer.celular}`,
          realizadoPor: "CRON_VERCEL",
        },
      });

      sentCount++;
    }

    return NextResponse.json({
      success: true,
      message: `Recordatorios procesados: ${sentCount}`,
      sentCount,
    });
  } catch (err: any) {
    logError("cron_reminders_error", err);
    return NextResponse.json(
      { error: "Error ejecutando cron de recordatorios." },
      { status: 500 }
    );
  }
}
