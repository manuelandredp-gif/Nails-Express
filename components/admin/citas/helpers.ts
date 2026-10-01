import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { AppointmentItem } from "./types";

export const METODOS_PAGO = [
  { id: "EFECTIVO", label: "Efectivo", emoji: "💵" },
  { id: "YAPE", label: "Yape", emoji: "📱" },
  { id: "PLIN", label: "Plin", emoji: "📲" },
  { id: "TARJETA", label: "Tarjeta", emoji: "💳" },
] as const;

/** Enlace de WhatsApp con un recordatorio prellenado para la clienta. */
export function buildReminderLink(app: AppointmentItem): string {
  const digits = app.customer.celular.replace(/[^\d]/g, "");
  const fecha = format(new Date(app.startAt), "EEEE d 'de' MMMM", { locale: es });
  const hora = format(new Date(app.startAt), "HH:mm");
  const nombre = app.customer.nombre.split(" ")[0];
  const msg =
    `Hola ${nombre}! 💅 Te recordamos tu cita en Nails Express ` +
    `el ${fecha} a las ${hora} para ${app.service.nombre}. ` +
    `¡Te esperamos! Si necesitas reprogramar, avísanos por aquí.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}

/** Enlace de WhatsApp para pedirle una reseña a la clienta tras atenderla. */
export function buildReviewRequestLink(app: AppointmentItem): string {
  const digits = app.customer.celular.replace(/[^\d]/g, "");
  const nombre = app.customer.nombre.split(" ")[0];
  const msg =
    `Hola ${nombre}! 💕 Gracias por visitarnos en Nails Express. ` +
    `¿Cómo quedaron tus uñas? Nos encantaría conocer tu opinión: ` +
    `tu recomendación nos ayuda muchísimo. ¡Y recuerda que cada visita suma un sello para tu premio! 💅✨`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(msg)}`;
}
