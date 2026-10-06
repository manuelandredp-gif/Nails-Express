import React from "react";
import { prisma } from "@/lib/db";
import { requireManager } from "@/lib/auth";
import { getSiteSettings } from "@/lib/site-content";
import { startOfDay, endOfDay, subDays, startOfMonth } from "date-fns";
import { es } from "date-fns/locale";
import { formatInTimeZone } from "date-fns-tz";
import { sumarPrecios, sumarDinero, formatearDinero } from "@/lib/domain/money";
import {
  Wallet,
  TrendingUp,
  Clock,
  CheckCircle2,
  CalendarDays,
  Users,
  CreditCard,
} from "lucide-react";

export const dynamic = "force-dynamic";

const TZ = "America/Lima";

const METODO_LABEL: Record<string, string> = {
  EFECTIVO: "💵 Efectivo",
  YAPE: "📱 Yape",
  PLIN: "📲 Plin",
  TARJETA: "💳 Tarjeta",
};

export default async function CajaPage() {
  await requireManager();
  const settings = await getSiteSettings();
  const moneda = settings.moneda || "S/";

  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfDay(subDays(now, 6));
  const monthStart = startOfMonth(now);

  const [todayAppts, paidMonth] = await Promise.all([
    // Citas de hoy (para la tabla de movimientos y pendientes)
    prisma.appointment.findMany({
      where: {
        startAt: { gte: todayStart, lte: todayEnd },
        estado: { not: "CANCELADA" },
      },
      include: { customer: true, service: true, staff: true },
      orderBy: { startAt: "asc" },
    }),
    // Todo lo cobrado en el mes (la fecha real del cobro es pagadoEn;
    // las citas antiguas sin pagadoEn usan la fecha de la cita)
    prisma.appointment.findMany({
      where: {
        pagado: true,
        estado: { not: "CANCELADA" },
        OR: [
          { pagadoEn: { gte: monthStart } },
          { pagadoEn: null, startAt: { gte: monthStart } },
        ],
      },
      select: {
        precio: true,
        pagadoEn: true,
        startAt: true,
        metodoPago: true,
        staff: { select: { nombre: true, color: true } },
      },
    }),
  ]);

  // Suma de dinero con redondeo a céntimos en cada paso (evita error acumulado).
  const money = (n: number) => formatearDinero(n, moneda);

  // Fecha efectiva del cobro
  const fechaCobro = (p: { pagadoEn: Date | null; startAt: Date }) =>
    p.pagadoEn ?? p.startAt;

  const paidToday = paidMonth.filter((p) => fechaCobro(p) >= todayStart && fechaCobro(p) <= todayEnd);
  const paidWeek = paidMonth.filter((p) => fechaCobro(p) >= weekStart);

  const cobradoHoy = sumarPrecios(paidToday);
  const cobradoSemana = sumarPrecios(paidWeek);
  const cobradoMes = sumarPrecios(paidMonth);

  const pendienteHoy = sumarPrecios(
    todayAppts.filter((a) => !a.pagado && a.estado === "COMPLETADA")
  );

  // Desglose últimos 7 días
  const porManicurista = Object.entries(
    paidWeek.reduce<Record<string, { importes: number[]; count: number; color: string }>>(
      (acc, p) => {
        const k = p.staff.nombre;
        if (!acc[k]) acc[k] = { importes: [], count: 0, color: p.staff.color };
        acc[k].importes.push(p.precio);
        acc[k].count += 1;
        return acc;
      },
      {}
    )
  )
    .map(([nombre, d]) => [nombre, { total: sumarDinero(d.importes), count: d.count, color: d.color }] as const)
    .sort((a, b) => b[1].total - a[1].total);

  const porMetodo = Object.entries(
    paidWeek.reduce<Record<string, number[]>>((acc, p) => {
      const k = p.metodoPago || "SIN_METODO";
      (acc[k] = acc[k] || []).push(p.precio);
      return acc;
    }, {})
  )
    .map(([metodo, importes]) => [metodo, sumarDinero(importes)] as const)
    .sort((a, b) => b[1] - a[1]);

  const fechaCruda = formatInTimeZone(now, TZ, "EEEE d 'de' MMMM", { locale: es });
  const fechaHoy = fechaCruda.charAt(0).toUpperCase() + fechaCruda.slice(1);
  const nombreMes = formatInTimeZone(now, TZ, "MMMM", { locale: es });

  const kpis = [
    {
      label: "Cobrado hoy",
      value: money(cobradoHoy),
      sub: `${paidToday.length} ${paidToday.length === 1 ? "cobro" : "cobros"}`,
      icon: Wallet,
      grad: "from-[#5CC6BF] to-[#3FA8A1]",
    },
    {
      label: "Por cobrar (atendidas)",
      value: money(pendienteHoy),
      sub: "Citas de hoy completadas sin pago",
      icon: Clock,
      grad: "from-[#F0A94C] to-[#E08A2A]",
    },
    {
      label: "Últimos 7 días",
      value: money(cobradoSemana),
      sub: `${paidWeek.length} cobros en la semana`,
      icon: TrendingUp,
      grad: "from-[#7C9EF0] to-[#5578E0]",
    },
    {
      label: `Este mes (${nombreMes})`,
      value: money(cobradoMes),
      sub: `${paidMonth.length} cobros en el mes`,
      icon: CalendarDays,
      grad: "from-[#3EA59E] to-[#2AA79C]",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
          Caja del día
        </h1>
        <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5">
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
                <p className="text-[0.7rem] text-[#8E8E8E] mt-0.5">{k.sub}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desglose de la semana */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Por manicurista */}
        <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#ECECEC] flex items-center gap-2">
            <Users className="w-5 h-5 text-[#3EA59E]" />
            <h2 className="font-bold text-[#1A1A1A]">Por manicurista</h2>
            <span className="ml-auto text-xs text-[#8E8E8E]">Últimos 7 días</span>
          </div>
          {porManicurista.length === 0 ? (
            <p className="p-6 text-center text-sm text-[#8E8E8E]">
              Sin cobros esta semana.
            </p>
          ) : (
            <ul className="divide-y divide-[#F6F6F6]">
              {porManicurista.map(([nombre, d]) => (
                <li key={nombre} className="px-5 py-3 flex items-center gap-3">
                  <span
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-white text-xs shrink-0"
                    style={{ backgroundColor: d.color }}
                  >
                    {nombre.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#1A1A1A] truncate">
                      {nombre}
                    </p>
                    <p className="text-[0.7rem] text-[#8E8E8E]">
                      {d.count} {d.count === 1 ? "cita cobrada" : "citas cobradas"}
                    </p>
                  </div>
                  <span className="font-extrabold text-[#1A1A1A] whitespace-nowrap">
                    {money(d.total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Por método de pago */}
        <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-[#ECECEC] flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-[#5CC6BF]" />
            <h2 className="font-bold text-[#1A1A1A]">Por método de pago</h2>
            <span className="ml-auto text-xs text-[#8E8E8E]">Últimos 7 días</span>
          </div>
          {porMetodo.length === 0 ? (
            <p className="p-6 text-center text-sm text-[#8E8E8E]">
              Sin cobros esta semana.
            </p>
          ) : (
            <ul className="divide-y divide-[#F6F6F6]">
              {porMetodo.map(([metodo, total]) => (
                <li key={metodo} className="px-5 py-3 flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-[#1A1A1A]">
                    {METODO_LABEL[metodo] || "Sin método registrado"}
                  </span>
                  <span className="font-extrabold text-[#1A1A1A] whitespace-nowrap">
                    {money(total)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* Detalle de movimientos de hoy */}
      <div className="bg-white rounded-2xl border border-[#ECECEC] shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-[#ECECEC] flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-[#5CC6BF]" />
          <h2 className="font-bold text-[#1A1A1A]">Movimientos de hoy</h2>
          <span className="ml-auto text-xs text-[#8E8E8E]">
            {todayAppts.length} citas
          </span>
        </div>

        {todayAppts.length === 0 ? (
          <p className="p-6 text-center text-sm text-[#8E8E8E]">
            No hay citas para hoy.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[0.7rem] uppercase tracking-wide text-[#8E8E8E] border-b border-[#F3F3F3]">
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
                          Pagado{a.metodoPago ? ` · ${(METODO_LABEL[a.metodoPago] || a.metodoPago).replace(/^[^ ]+ /, "")}` : ""}
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

      <p className="text-[0.7rem] text-[#8E8E8E] px-1">
        El cobro se registra desde <strong>Citas</strong> con el botón «Cobrar»,
        eligiendo el método de pago. La caja usa la fecha y hora reales de cada cobro.
      </p>
    </div>
  );
}
