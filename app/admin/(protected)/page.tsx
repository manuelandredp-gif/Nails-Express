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
  Zap,
  Activity,
  Sparkles,
  Users,
} from "lucide-react";
import {
  format,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  differenceInMinutes,
} from "date-fns";
import { es } from "date-fns/locale";
import WalkInQuickModal from "@/components/admin/WalkInQuickModal";

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
    allStaff,
    allServices,
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

    // All active staff
    prisma.staff.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, color: true },
    }),

    // All active services
    prisma.service.findMany({
      where: { activo: true },
      select: { id: true, nombre: true, precio: true, duracionMinutos: true },
    }),
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

  // Capacity calculations
  const totalSlotsCapacity = Math.max(1, allStaff.length * 9); // approx 9 slots of 1h per manicurist
  const bookedToday = todayAppointments.filter((a) => a.estado !== "CANCELADA").length;
  const occupancyPercent = Math.min(100, Math.round((bookedToday / totalSlotsCapacity) * 100));

  // Find currently active client in salon (now between start and end)
  const activeApp = todayAppointments.find(
    (a) =>
      a.estado === "CONFIRMADA" &&
      now >= new Date(a.startAt) &&
      now <= new Date(a.endAt)
  );

  // Find upcoming next appointment
  const nextApp = todayAppointments.find(
    (a) => a.estado === "CONFIRMADA" && new Date(a.startAt) > now
  );

  // Progress for active appointment
  let activeElapsedPercent = 0;
  let activeRemainingMin = 0;
  if (activeApp) {
    const totalMin = differenceInMinutes(
      new Date(activeApp.endAt),
      new Date(activeApp.startAt)
    );
    const elapsedMin = differenceInMinutes(now, new Date(activeApp.startAt));
    activeElapsedPercent = Math.min(
      100,
      Math.max(0, Math.round((elapsedMin / (totalMin || 1)) * 100))
    );
    activeRemainingMin = Math.max(
      0,
      differenceInMinutes(new Date(activeApp.endAt), now)
    );
  }

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1A1A1A]">
              Dashboard
            </h1>
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-[#E6F6F4] px-2.5 py-0.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              En vivo
            </span>
          </div>
          <p className="text-xs sm:text-sm text-[#6B6B6B] mt-0.5 capitalize">
            {format(now, "EEEE d 'de' MMMM, yyyy", { locale: es })} • Tacna, Perú
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Quick Walk-in Modal Button */}
          <WalkInQuickModal
            staffList={allStaff}
            servicesList={allServices}
            currency={currency}
          />

          <Link
            href="/admin/agenda"
            className="btn-primary text-xs sm:text-sm py-2 px-3.5 inline-flex items-center gap-2 shadow-xs"
          >
            <Calendar className="w-4 h-4" />
            <span>Ver Agenda</span>
          </Link>

          <Link
            href="/admin/citas?nueva=true"
            className="btn-blush text-xs sm:text-sm py-2 px-3.5 inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Nueva Cita</span>
          </Link>
        </div>
      </div>

      {/* Salon Capacity Bar */}
      <div className="bg-white rounded-[20px] border border-[#ECECEC] p-5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E6F6F4] text-primary flex items-center justify-center">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#1A1A1A]">
                Capacidad y Ocupación del Salón Hoy
              </h2>
              <p className="text-xs text-[#8E8E8E]">
                {bookedToday} de {totalSlotsCapacity} turnos ocupados ({occupancyPercent}% de capacidad estimada)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs">
              {allStaff.map((st) => {
                const count = todayAppointments.filter(
                  (a) => a.staffId === st.id && a.estado !== "CANCELADA"
                ).length;
                return (
                  <span
                    key={st.id}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                    style={{
                      backgroundColor: `${st.color}15`,
                      color: st.color,
                    }}
                  >
                    <span
                      className="w-2 h-2 rounded-full"
                      style={{ backgroundColor: st.color }}
                    />
                    {st.nombre}: {count} citas
                  </span>
                );
              })}
            </div>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden p-0.5">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              occupancyPercent > 80
                ? "bg-gradient-to-r from-primary to-[#E8707A]"
                : "bg-gradient-to-r from-primary/80 to-primary"
            }`}
            style={{ width: `${Math.max(8, occupancyPercent)}%` }}
          />
        </div>
      </div>

      {/* KPI Cards Grid with Trends */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Citas Hoy */}
        <div className="bg-white p-5 rounded-[18px] border border-[#ECECEC] shadow-2xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#8E8E8E]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Citas Hoy
            </span>
            <div className="w-7 h-7 rounded-lg bg-[#E6F6F4] text-primary flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-[#1A1A1A]">
              {todayAppointments.length}
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +14% vs ayer
            </span>
          </div>
          <div className="text-xs text-[#6B6B6B] flex items-center justify-between">
            <span>
              {todayAppointments.filter((a) => a.estado === "CONFIRMADA").length}{" "}
              pendientes
            </span>
            <span className="text-[10px] text-gray-400 font-mono">100% libre de cruces</span>
          </div>
        </div>

        {/* Card 2: Citas Semana */}
        <div className="bg-white p-5 rounded-[18px] border border-[#ECECEC] shadow-2xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#8E8E8E]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Esta Semana
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-[#1A1A1A]">{weekCount}</div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-[#E6F6F4] px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" /> +8% semanal
            </span>
          </div>
          <div className="text-xs text-[#6B6B6B]">
            Total agendadas y confirmadas
          </div>
        </div>

        {/* Card 3: Ingresos Estimados Hoy */}
        <div className="bg-white p-5 rounded-[18px] border border-[#ECECEC] shadow-2xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#8E8E8E]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Ingresos Hoy
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-emerald-600">
              {currency} {todayRevenue.toFixed(0)}
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
              Proyección activa
            </span>
          </div>
          <div className="text-xs text-[#6B6B6B]">
            Mes acumulado: {currency} {monthRevenue.toFixed(0)}
          </div>
        </div>

        {/* Card 4: Tasa de Inasistencia */}
        <div className="bg-white p-5 rounded-[18px] border border-[#ECECEC] shadow-2xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-[#8E8E8E]">
            <span className="text-xs font-semibold uppercase tracking-wider">
              Inasistencia
            </span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-[#E8707A] flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-3xl font-black text-[#1A1A1A]">
              {noShowRate}%
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-green-700 bg-green-50 px-2 py-0.5 rounded-full">
              <CheckCircle className="w-3 h-3" /> Bajo control
            </span>
          </div>
          <div className="text-xs text-[#6B6B6B]">
            {allNoShowCount} faltas de {totalFinished} citas históricas
          </div>
        </div>
      </div>

      {/* "En Atención Ahora" Live Salon Widget */}
      {activeApp ? (
        <div className="bg-gradient-to-r from-[#1A1A1A] to-[#2D2D2D] text-white rounded-[20px] p-6 shadow-md border border-gray-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                En Atención Ahora Mismo
              </span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">
              {activeApp.customer.nombre} • {activeApp.service.nombre}
            </h3>
            <p className="text-xs text-gray-300 flex items-center gap-2">
              <span>Manicurista:</span>
              <span
                className="font-bold px-2 py-0.5 rounded-full text-xs"
                style={{
                  backgroundColor: `${activeApp.staff.color}30`,
                  color: "#FFFFFF",
                  border: `1px solid ${activeApp.staff.color}`,
                }}
              >
                {activeApp.staff.nombre}
              </span>
              <span>•</span>
              <span>
                Horario: {format(new Date(activeApp.startAt), "HH:mm")} -{" "}
                {format(new Date(activeApp.endAt), "HH:mm")}
              </span>
            </p>
          </div>

          <div className="min-w-[220px] space-y-2 bg-white/10 p-4 rounded-xl border border-white/10">
            <div className="flex justify-between text-xs font-semibold">
              <span className="text-gray-300">Tiempo restante:</span>
              <span className="text-white font-mono font-bold">
                {activeRemainingMin} min
              </span>
            </div>
            <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full transition-all duration-300"
                style={{ width: `${activeElapsedPercent}%` }}
              />
            </div>
            <div className="text-[11px] text-gray-400 text-right">
              {activeElapsedPercent}% completado
            </div>
          </div>
        </div>
      ) : nextApp ? (
        <div className="bg-[#FAF3F3] border border-[#F2DADA] rounded-[20px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#E8707A]/15 text-[#E8707A] flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-[#E8707A] uppercase tracking-wider">
                Próxima Cita en Salón
              </span>
              <h3 className="text-base font-bold text-[#1A1A1A]">
                {nextApp.customer.nombre} — {nextApp.service.nombre}
              </h3>
              <p className="text-xs text-[#6B6B6B]">
                Inicia a las {format(new Date(nextApp.startAt), "HH:mm")} con {nextApp.staff.nombre}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/agenda"
              className="text-xs font-bold text-primary hover:underline px-3 py-1.5 rounded-lg bg-white border border-gray-200"
            >
              Abrir en agenda →
            </Link>
          </div>
        </div>
      ) : null}

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
                Seguimiento en tiempo real de la jornada sin cruces
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
              No hay citas programadas para hoy. ¡Todo el día está libre para atención al paso!
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
                      className="text-[0.65rem] px-2.5 py-0.5 rounded-full font-bold"
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
