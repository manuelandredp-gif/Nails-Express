import React from "react";
import { prisma } from "@/lib/db";
import { requireManager } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-content";
import { startOfDay, endOfDay, subDays } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { Wallet, TrendingUp, Clock, CheckCircle2, CalendarDays } from "lucide-react";

export const dynamic = "force-dynamic";

const TZ = "America/Lima";

export default async function CajaPage() {
  await requireManager();
  const settings = await getSiteSettings();
  const moneda = settings.moneda || "S/";

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfDay(subDays(now, 6));

  const [todayAppts, weekAppts] = await Promise.all([
    prisma.appointment.findMany({
      where: {
        startAt: { gte: todayStart, lte: todayEnd },
        estado: { not: "CANCELADA" },
      },
      include: { customer: true, service: true, staff: true },
      orderBy: { startAt: "asc" },
    }),
    prisma.appointment.findMany({
      where: {
        startAt: { gte: weekStart, lte: todayEnd },
        estado: { not: "CANCELADA" },
      },
      select: { precio: true, pagado: true },
    }),
  ]);

  const money = (n: number) =>
    `${moneda} ${n.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  const cobradoHoy = todayAppts
    .filter((a) => a.pagado)
    .reduce((s, a) => s + a.precio, 0);

  const pendienteHoy = todayAppts
    .filter((a) => !a.pagado && a.estado === "COMPLETADA")
    .reduce((s, a) => s + a.precio, 0);

  const porVenirHoy = todayAppts
    .filter((a) => !a.pagado && a.estado !== "COMPLETADA")
    .reduce((s, a) => s + a.precio, 0);

  const cobradoSemana = weekAppts
    .filter((a) => a.pagado)
    .reduce((s, a) => s + a.precio, 0);

  const citasPagadasHoy = todayAppts.filter((a) => a.pagado).length;

  const fechaHoy = formatInTimeZone(now, TZ, "EEEE d 'de' MMMM", { locale: es });

  const kpis = [
    {
      label: "Cobrado hoy",
      value: money(cobradoHoy),
      sub: `${citasPagadasHoy} ${citasPagadasHoy === 1 ? "cita pagada" : "citas pagadas"}`,
      icon: Wallet,
      grad: "from-[#5CC6BF] to-[#3FA8A1]",
    },
    {
      label: "Por cobrar (atendidas)",
      value: money(pendienteHoy),
      sub: "Citas completadas sin pago",
      icon: Clock,
      grad: "from-[#F0A94C] to-[#E08A2A]",
    },
    {
      label: "Agendado por venir",
      value: money(porVenirHoy),
      sub: "Citas de hoy aún no atendidas",
      icon: CalendarDays,
      grad: "from-[#7C9EF0] to-[#5578E0]",
    },
    {
      label: "Cobrado últimos 7 días",
      value: money(cobradoSemana),
      sub: "Total de la semana",
      icon: TrendingUp,
      grad: "from-[#E26D9A] to-[#C64E7E]",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
          Caja del día
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5 capitalize">
          {fechaHoy}
        </p>
      </div>

      {/* KPIs */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <div
              key={k.label}
              className="rounded-2xl bg-white border border-[#ECECEC] shadow-sm overflow-hidden"
            >
              <div className={`h-1.5 bg-gradient-to-r ${k.grad}`} />
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#6B6B6B]">
                    {k.label}
                  </span>
                  <span
                    className={`w-8 h-8 rounded-lg bg-gradient-to-br ${k.grad} text-white flex items-center justify-center`}
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-[#1A1A1A] mt-2">
                  {k.value}
                </p>
                <p className="text-[0.7rem] text-[#9B8890] mt-0.5">{k.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detalle de cobros de hoy */}
      <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#ECECEC] flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#5CC6BF]" />
          <h2 className="font-bold text-[#1A1A1A]">Movimientos de hoy</h2>
          <span className="ml-auto text-xs text-[#9B8890]">
            {todayAppts.length} citas
          </span>
        </div>

        {todayAppts.length === 0 ? (
          <p className="p-6 text-center text-sm text-[#9B8890]">
            No hay citas para hoy.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.7rem] uppercase tracking-wide text-[#9B8890] border-b border-[#F3F3F3]">
                  <th className="px-5 py-2.5 font-semibold">Hora</th>
                  <th className="px-3 py-2.5 font-semibold">Cliente</th>
                  <th className="px-3 py-2.5 font-semibold">Servicio</th>
                  <th className="px-3 py-2.5 font-semibold">Manicurista</th>
                  <th className="px-3 py-2.5 font-semibold text-right">Monto</th>
                  <th className="px-5 py-2.5 font-semibold text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F6F6F6]">
                {todayAppts.map((a) => (
                  <tr key={a.id} className="hover:bg-[#FCFAFB]">
                    <td className="px-5 py-3 text-[#1A1A1A] font-medium whitespace-nowrap">
                      {formatInTimeZone(a.startAt, TZ, "HH:mm")}
                    </td>
                    <td className="px-3 py-3 text-[#1A1A1A]">{a.customer.nombre}</td>
                    <td className="px-3 py-3 text-[#6B6B6B]">{a.service.nombre}</td>
                    <td className="px-3 py-3 text-[#6B6B6B]">{a.staff.nombre}</td>
                    <td className="px-3 py-3 text-right font-semibold text-[#1A1A1A] whitespace-nowrap">
                      {money(a.precio)}
                    </td>
                    <td className="px-5 py-3 text-center">
                      {a.pagado ? (
                        <span className="inline-block text-[0.65rem] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-semibold">
                          Pagado
                        </span>
                      ) : a.estado === "COMPLETADA" ? (
                        <span className="inline-block text-[0.65rem] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-semibold">
                          Por cobrar
                        </span>
                      ) : (
                        <span className="inline-block text-[0.65rem] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-semibold">
                          Pendiente
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-[#F0F0F0] bg-[#FCFAFB]">
                  <td colSpan={4} className="px-5 py-3 text-right font-semibold text-[#6B6B6B]">
                    Cobrado hoy
                  </td>
                  <td className="px-3 py-3 text-right font-extrabold text-[#5CC6BF] whitespace-nowrap">
                    {money(cobradoHoy)}
                  </td>
                  <td />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <p className="text-[0.7rem] text-[#9B8890] px-1">
        El pago se marca desde <strong>Citas</strong> con el botón «Pagado». La
        caja suma automáticamente las citas marcadas como pagadas.
      </p>
    </div>
  );
}
