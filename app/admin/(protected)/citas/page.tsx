import React from "react";
import { prisma } from "@/lib/db";
import { requireSession, isManager } from "@/lib/auth";
import AppointmentsTable from "@/components/admin/AppointmentsTable";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CitasPage() {
  const session = await requireSession();

  // Las trabajadoras vinculadas a una manicurista solo ven sus propias citas.
  const where: any = {};
  if (!isManager(session.rol) && session.staffId) {
    where.staffId = session.staffId;
  }

  const appointments = await prisma.appointment.findMany({
    where,
    include: {
      customer: true,
      service: true,
      staff: true,
    },
    orderBy: { startAt: "desc" },
    take: 100,
  });

  const formattedAppointments = appointments.map((a) => ({
    id: a.id,
    codigo: a.codigo,
    startAt: a.startAt.toISOString(),
    endAt: a.endAt.toISOString(),
    precio: a.precio,
    estado: a.estado,
    origen: a.origen,
    notasCliente: a.notasCliente,
    pagado: a.pagado,
    resenaEstrellas: a.resenaEstrellas,
    resenaTexto: a.resenaTexto,
    customer: {
      nombre: a.customer.nombre,
      celular: a.customer.celular,
    },
    service: {
      nombre: a.service.nombre,
    },
    staff: {
      nombre: a.staff.nombre,
      color: a.staff.color,
    },
  }));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
            Listado de Citas
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
            Registro completo de reservas, filtros y exportación
          </p>
        </div>

        <Link
          href="/admin/agenda"
          className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Nueva Cita</span>
        </Link>
      </div>

      <AppointmentsTable initialAppointments={formattedAppointments} />
    </div>
  );
}
