import { NextRequest, NextResponse } from "next/server";
import { createBooking } from "@/lib/booking";
import { z } from "zod";

const bookingSchema = z.object({
  serviceId: z.string().min(1, "El servicio es requerido"),
  startAt: z.string().min(1, "La fecha y hora son requeridas"),
  staffId: z.string().optional(),
  nombre: z.string().min(2, "El nombre debe tener al menos 2 caracteres"),
  celular: z.string().min(8, "Ingresa un número de celular válido"),
  email: z.string().email("Correo electrónico inválido").optional().or(z.literal("")),
  notasCliente: z.string().max(500).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = bookingSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const booking = await createBooking(validation.data);

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
    console.error("Error creating booking:", error);
    const message =
      error.message || "No se pudo procesar la reserva. Por favor intenta nuevamente.";
    const status = error.message?.includes("acaba de ser reservado") ? 409 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
