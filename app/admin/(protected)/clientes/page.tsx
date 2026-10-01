import React from "react";
import { prisma } from "@/lib/db";
import CustomersManager from "@/components/admin/CustomersManager";

export const dynamic = "force-dynamic";

export default async function ClientesPage() {
  const customers = await prisma.customer.findMany({
    include: {
      citas: {
        include: { service: true, staff: true },
        orderBy: { startAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const formattedCustomers = customers.map((c) => ({
    id: c.id,
    nombre: c.nombre,
    celular: c.celular,
    email: c.email,
    notasInternas: c.notasInternas,
    totalCitas: c.totalCitas,
    inasistencias: c.inasistencias,
    sellos: c.sellos,
    sellosTotal: c.sellosTotal,
    nivel: c.sellosTotal >= 20 ? "Oro" : c.sellosTotal >= 10 ? "Plata" : c.sellosTotal >= 4 ? "Bronce" : "Nueva",
    ultimaVisita: c.ultimaVisita?.toISOString() || null,
    citas: c.citas.map((cita) => ({
      id: cita.id,
      codigo: cita.codigo,
      startAt: cita.startAt.toISOString(),
      precio: cita.precio,
      estado: cita.estado,
      service: { nombre: cita.service.nombre },
      staff: { nombre: cita.staff.nombre },
    })),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
          Directorio de Clientes
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
          Fichas individuales, historial de atenciones y notas de preferencias
        </p>
      </div>

      <CustomersManager initialCustomers={formattedCustomers} />
    </div>
  );
}
