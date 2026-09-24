import React from "react";
import { prisma } from "@/lib/db";
import Link from "next/link";
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  TrendingUp,
  Plus,
  Scissors,
  ArrowRight,
  UserCheck,
} from "lucide-react";
import { format, startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from "date-fns";
import { es } from "date-fns/locale";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  const monthStart = startOfMonth(now);
  const monthEnd = endOfMonth(now);

  const [
    todayAppointments,
    weekCount,
    monthAppointments,
    allCompletedCount,
    allNoShowCount,
    topServices,
    settings,
  ] = await Promise.all([
    // Citas de hoy
    prisma.appointment.findMany({
      where: {
        startAt: { gte: todayStart, lte: todayEnd },
      },
      include: {
        customer: true,
        service: true,
        staff: true,
      },
      orderBy: { startAt: "asc" },
    }),

    // Citas de la semana
    prisma.appointment.count({
      where: {
        startAt: { gte: weekStart, lte: weekEnd },
      },
    }),

    // Citas del mes para cálculo de ingresos
    prisma.appointment.findMany({
      where: {
        startAt: { gte: monthStart, lte: monthEnd },
        estado: { in: ["CONFIRMADA", "COMPLETADA"] },
      },
      select: { precio: true, startAt: true },
    }),

    // Total de completadas e inasistencias históricas
    prisma.appointment.count({ where: { estado: "COMPLETADA" } }),
    prisma.appointment.count({ where: { estado: "NO_ASISTIO" } }),

    // Servicios más reservados
    prisma.service.findMany({
      include: {
        _count: { select: { citas: true } },
      },
      orderBy: { citas: { _count: "desc" } },
      take: 4,
    }),

    prisma.settings.findUnique({ where: { id: "default" } }),
  ]);

  // Calculations
  const currency = settings?.moneda || "S/";
  const todayRevenue = todayAppointments
    .filter((a) => a.estado === "CONFIRMADA" || a.estado === "COMPLETADA")
    .reduce((acc, curr) => acc + curr.precio, 0);

  const monthRevenue = monthAppointments.reduce(
    (acc, curr) => acc + curr.precio,
    0
  );

  const totalFinished = allCompletedCount + allNoShowCount;
  const noShowRate =
    totalFinished > 0
      ? ((allNoShowCount / totalFinished) * 100).toFixed(1)
      : "0.0";

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5 capitalize">
            {format(now, "EEEE d 'de' MMMM, yyyy", { locale: es })} • Tacna, Perú
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/agenda"
            className="btn-primary text-xs sm:text-sm py-2 px-4 inline-flex items-center gap-2 shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            <span>Ver Agenda Full</span>
          </Link>
          <Link
            href="/admin/citas?nueva=true"
            className="btn-blush text-xs sm:text-sm py-2 px-4 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Cita</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Citas Hoy */}
        <div className="bg-white p-5 rounded-[16px] border border-[#ECECEC] shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-[#8E8E8E]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Citas Hoy
            </span>
            <Clock className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-black text-[#1A1A1A]">
            {todayAppointments.length}
          </div>
          <div className="text-xs text-[#6B6B6B]">
            {todayAppointments.filter((a) => a.estado === "CONFIRMADA").length}{" "}
            pendientes de atención
          </div>
        </div>

        {/* Card 2: Citas Semana */}
        <div className="bg-white p-5 rounded-[16px] border border-[#ECECEC] shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-[#8E8E8E]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Esta Semana
            </span>
            <Calendar className="w-4 h-4 text-primary" />
          </div>
          <div className="text-3xl font-black text-[#1A1A1A]">{weekCount}</div>
          <div className="text-xs text-[#6B6B6B]">Total agendadas</div>
        </div>

        {/* Card 3: Ingresos Estimados Hoy */}
        <div className="bg-white p-5 rounded-[16px] border border-[#ECECEC] shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-[#8E8E8E]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Ingresos Hoy
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-600">
            {currency} {todayRevenue.toFixed(0)}
          </div>
          <div className="text-xs text-[#6B6B6B]">
            Mes acumulado: {currency} {monthRevenue.toFixed(0)}
          </div>
        </div>

        {/* Card 4: Tasa de Inasistencia */}
        <div className="bg-white p-5 rounded-[16px] border border-[#ECECEC] shadow-2xs space-y-3">
          <div className="flex items-center justify-between text-[#8E8E8E]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Inasistencia
            </span>
            <AlertTriangle className="w-4 h-4 text-[#E8707A]" />
          </div>
          <div className="text-3xl font-black text-[#1A1A1A]">
            {noShowRate}%
          </div>
          <div className="text-xs text-[#6B6B6B]">
            {allNoShowCount} faltas de {totalFinished} citas
          </div>
        </div>
      </div>

      {/* Main Grid: Today's Schedule & Top Services */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Citas de Hoy (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-[18px] border border-[#ECECEC] p-6 shadow-2xs space-y-5">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div>
              <h2 className="text-lg font-bold text-[#1A1A1A]">
                Citas programadas para hoy
              </h2>
              <p className="text-xs text-[#6B6B6B]">
                Seguimiento en tiempo real de la jornada
              </p>
            </div>
            <Link
              href="/admin/agenda"
              className="text-xs font-semibold text-primary hover:text-primary-dark inline-flex items-center gap-1"
            >
              <span>Ver agenda</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {todayAppointments.length === 0 ? (
            <div className="text-center py-12 text-[#8E8E8E] text-sm">
              No hay citas programadas para hoy. ¡Todo el día está libre!
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {todayAppointments.map((app) => (
                <div
                  key={app.id}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-gray-50/50 rounded-lg px-2 transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div className="w-12 text-center shrink-0 pt-0.5">
                      <span className="text-sm font-bold text-[#1A1A1A]">
                        {format(new Date(app.startAt), "HH:mm")}
                      </span>
                      <span className="block text-[0.65rem] text-[#8E8E8E]">
                        {format(new Date(app.endAt), "HH:mm")}
                      </span>
                    </div>

                    <div className="border-l-2 border-primary pl-3">
                      <p className="text-sm font-bold text-[#1A1A1A]">
                        {app.customer.nombre}
                      </p>
                      <p className="text-xs text-[#6B6B6B] flex items-center gap-1.5 mt-0.5">
                        <Scissors className="w-3 h-3 text-primary" />
                        <span>{app.service.nombre}</span>
                        <span>•</span>
                        <span className="font-semibold text-[#E8707A]">
                          {currency} {app.precio.toFixed(0)}
                        </span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto">
                    <span
                      className="text-[0.65rem] px-2 py-0.5 rounded-full font-bold"
                      style={{
                        backgroundColor: `${app.staff.color}20`,
                        color: app.staff.color,
                      }}
                    >
                      {app.staff.nombre}
                    </span>
                    <span
                      className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${
                        app.estado === "CONFIRMADA"
                          ? "bg-green-100 text-green-700"
                          : app.estado === "COMPLETADA"
                          ? "bg-blue-100 text-blue-700"
                          : app.estado === "CANCELADA"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {app.estado}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Servicios Más Populares & Acciones Rápidas (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white rounded-[18px] border border-[#ECECEC] p-6 shadow-2xs space-y-4">
            <h3 className="text-base font-bold text-[#1A1A1A]">
              Servicios más reservados
            </h3>
            <div className="space-y-3">
              {topServices.map((srv, i) => (
                <div
                  key={srv.id}
                  className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <span className="w-5 text-xs font-bold text-[#8E8E8E]">
                      #{i + 1}
                    </span>
                    <span className="font-semibold text-[#1A1A1A] truncate max-w-[150px]">
                      {srv.nombre}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-primary bg-[#E6F6F4] px-2 py-0.5 rounded-full">
                    {srv._count.citas} citas
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#FAF3F3] rounded-[18px] border border-[#F2DADA] p-6 space-y-3">
            <h3 className="text-base font-bold text-[#1A1A1A]">
              Reglas de Agendamiento
            </h3>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              El motor garantiza cero solapamiento por manicurista. Las citas canceladas liberan el horario de forma inmediata.
            </p>
            <div className="pt-2">
              <Link
                href="/admin/configuracion"
                className="text-xs font-bold text-primary hover:underline inline-flex items-center gap-1"
              >
                <span>Ajustar horarios e intervalos</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
