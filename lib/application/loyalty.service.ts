import crypto from "crypto";
import { addDays } from "date-fns";
import { prisma } from "../db";
import { getSiteSettings } from "../site-content";

export interface LoyaltyState {
  activo: boolean;
  sellos: number;
  meta: number;
  premio: string;
  titulo: string;
  subtitulo: string;
  sellosTotal: number;
  nivel: string;
  rewards: {
    codigo: string;
    premio: string;
    estado: string;
    ganadoEn: Date;
    expiraEn: Date | null;
  }[];
}

function generateRewardCode(): string {
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  const bytes = crypto.randomBytes(4);
  let s = "NX-P-";
  for (let i = 0; i < 4; i++) s += chars[bytes[i] % chars.length];
  return s;
}

/**
 * Otorga un sello por una cita completada. Idempotente: si la cita ya dio su
 * sello (selloOtorgado), no hace nada. Al alcanzar la meta genera un premio
 * y reinicia la tarjeta con el excedente.
 */
export async function awardStampForAppointment(appointmentId: string) {
  const settings = await getSiteSettings();
  if (!settings.sellosActivo) return null;

  const meta = Math.max(1, settings.sellosMeta || 8);

  return prisma.$transaction(async (tx) => {
    const appt = await tx.appointment.findUnique({ where: { id: appointmentId } });
    if (!appt || appt.estado !== "COMPLETADA" || appt.selloOtorgado) return null;

    await tx.appointment.update({
      where: { id: appt.id },
      data: { selloOtorgado: true },
    });

    const customer = await tx.customer.update({
      where: { id: appt.customerId },
      data: { sellos: { increment: 1 }, sellosTotal: { increment: 1 } },
    });

    let reward = null;
    let sellosRestantes = customer.sellos;

    if (customer.sellos >= meta) {
      const expiraEn =
        settings.sellosExpiraDias > 0
          ? addDays(new Date(), settings.sellosExpiraDias)
          : null;
      reward = await tx.reward.create({
        data: {
          codigo: generateRewardCode(),
          customerId: customer.id,
          premio: settings.sellosPremio,
          expiraEn,
        },
      });
      sellosRestantes = customer.sellos - meta;
      await tx.customer.update({
        where: { id: customer.id },
        data: { sellos: sellosRestantes },
      });
      await tx.appointmentLog.create({
        data: {
          appointmentId: appt.id,
          accion: "PREMIO_FIDELIDAD",
          detalle: `Tarjeta de sellos completada. Premio "${settings.sellosPremio}" (código ${reward.codigo}).`,
          realizadoPor: "SISTEMA",
        },
      });
    }

    return { sellos: sellosRestantes, meta, reward };
  });
}

/** Nivel de clienta frecuente según el total de sellos ganados. */
export function nivelPorSellos(sellosTotal: number): string {
  if (sellosTotal >= 20) return "Oro";
  if (sellosTotal >= 10) return "Plata";
  if (sellosTotal >= 4) return "Bronce";
  return "Nueva";
}

/** Estado de fidelidad de un cliente para mostrar en "Mis Citas" o el panel. */
export async function getLoyaltyForCustomer(customerId: string): Promise<LoyaltyState> {
  const settings = await getSiteSettings();
  const customer = await prisma.customer.findUnique({ where: { id: customerId } });
  const rewards = await prisma.reward.findMany({
    where: { customerId, estado: "DISPONIBLE" },
    orderBy: { ganadoEn: "desc" },
  });

  const sellosTotal = customer?.sellosTotal ?? 0;

  return {
    activo: settings.sellosActivo,
    sellos: customer?.sellos ?? 0,
    meta: Math.max(1, settings.sellosMeta || 8),
    premio: settings.sellosPremio,
    titulo: settings.sellosTitulo,
    subtitulo: settings.sellosSubtitulo,
    sellosTotal,
    nivel: nivelPorSellos(sellosTotal),
    rewards: rewards.map((r) => ({
      codigo: r.codigo,
      premio: r.premio,
      estado: r.estado,
      ganadoEn: r.ganadoEn,
      expiraEn: r.expiraEn,
    })),
  };
}
