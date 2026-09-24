import { format } from "date-fns";
import { es } from "date-fns/locale";

export interface NotificationPayload {
  toEmail?: string | null;
  toPhone: string;
  customerName: string;
  serviceName: string;
  startAt: Date;
  bookingCode: string;
  price: number;
}

export interface NotificationProvider {
  sendBookingConfirmation(payload: NotificationPayload): Promise<boolean>;
  sendReminder(payload: NotificationPayload): Promise<boolean>;
  sendCancellation(payload: NotificationPayload): Promise<boolean>;
}

/**
 * Generates direct pre-filled WhatsApp link for Peru numbers
 */
export function generateWhatsAppLink(phone: string, text: string): string {
  const cleanPhone = phone.replace(/[^\d]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`;
}

/**
 * Default implementation for Email and WhatsApp notifications
 */
export class StudioNotificationService implements NotificationProvider {
  async sendBookingConfirmation(payload: NotificationPayload): Promise<boolean> {
    const formattedDate = format(payload.startAt, "EEEE d 'de' MMMM 'a las' HH:mm 'hrs'", {
      locale: es,
    });

    console.log(
      `[NOTIFICACIÓN CITA CREADA] Email a: ${payload.toEmail || "Sin email"} | Teléfono: ${payload.toPhone}`
    );
    console.log(
      `Mensaje: Hola ${payload.customerName}, tu cita para ${payload.serviceName} ha sido confirmada para el ${formattedDate}. Código: ${payload.bookingCode}.`
    );

    // If RESEND_API_KEY is configured in production, send real email:
    if (process.env.RESEND_API_KEY && payload.toEmail) {
      try {
        await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          },
          body: JSON.stringify({
            from: "Nails Express <reservas@nailsexpress.com>",
            to: payload.toEmail,
            subject: `¡Cita confirmada! Nails Express - ${payload.serviceName}`,
            html: `
              <h2>¡Tu cita ha sido confirmada con éxito!</h2>
              <p>Hola <strong>${payload.customerName}</strong>,</p>
              <p>Te esperamos para tu servicio de <strong>${payload.serviceName}</strong>.</p>
              <p><strong>Fecha y Hora:</strong> ${formattedDate}</p>
              <p><strong>Código de reserva:</strong> ${payload.bookingCode}</p>
              <p><strong>Dirección:</strong> Av. San Martín 456, Tacna, Perú</p>
            `,
          }),
        });
      } catch (err) {
        console.error("Error sending email via Resend:", err);
      }
    }

    return true;
  }

  async sendReminder(payload: NotificationPayload): Promise<boolean> {
    console.log(
      `[RECORDATORIO 24H] Enviado a ${payload.customerName} (${payload.toPhone}) para cita ${payload.bookingCode}.`
    );
    return true;
  }

  async sendCancellation(payload: NotificationPayload): Promise<boolean> {
    console.log(
      `[CANCELACION] Cita ${payload.bookingCode} ha sido cancelada para ${payload.customerName}.`
    );
    return true;
  }
}

export const notifications = new StudioNotificationService();
