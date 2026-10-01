import { NextRequest, NextResponse } from "next/server";
import { bookingService } from "@/lib/application/booking.service";
import { z } from "zod";
import { rateLimit } from "@/lib/infrastructure/security/rate-limit";
import { logError, logWarn } from "@/lib/infrastructure/logger";

const bookingSchema = z.object({
  serviceId: z.string().min(1, "El servicio es requerido"),
  startAt: z.string().min(1, "La fecha y hora son requeridas"),
  staffId: z.string().optional(),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  celular: z.string().min(8, "Ingresa un número de celular válido"),
  email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
  notasCliente: z.string().max(500).optional(),
  // Honeypot anti-bot: campo invisible para humanos; si llega con texto, es un bot.
  website: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
      request.headers.get("x-real-ip") ||
      "local";

    // Límite anti-spam: máx. 5 reservas cada 10 minutos por IP.
    const gate = await rateLimit(`booking:${ip}`, 5, 10 * 60 * 1000);
    if (!gate.ok) {
      return NextResponse.json(
        { error: "Demasiadas reservas seguidas. Espera unos minutos e inténtalo de nuevo." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const validation = bookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // Honeypot: si el campo trampa viene lleno, es un bot. Respondemos "ok" falso
    // para no darle pistas, pero no creamos nada.
    if (validation.data.website && validation.data.website.trim() !== "") {
      logWarn("booking_honeypot_triggered", { ip });
      return NextResponse.json({ success: true, booking: null }, { status: 201 });
    }

    const { website, ...datos } = validation.data;
    const booking = await bookingService.createBooking(datos);

    return NextResponse.json(
      {
        success: true,
        booking: {
          id: booking.id,
          codigo: booking.codigo,
          startAt: booking.startAt,
          endAt: booking.endAt,
          precio: booking.precio,
          servicio: booking.service.nombre,
          manicurista: booking.staff.nombre,
          cliente: booking.customer.nombre,
          celular: booking.customer.celular,
        },
      },
      { status: 201 }
    );
  } catch (error: any) {
    logError("booking_create_error", error);
    const message =
      error.message || "No se pudo procesar la reserva. Por favor intenta nuevamente.";
    const status = error.message?.includes("acaba de ser reservado") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
