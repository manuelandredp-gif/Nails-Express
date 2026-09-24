"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Download,
  Calendar,
  Phone,
  Scissors,
  User,
  CheckCircle,
  XCircle,
  MoreVertical,
  Plus,
  MessageCircle,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface AppointmentItem {
  id: string;
  codigo: string;
  startAt: string;
  endAt: string;
  precio: number;
  estado: string;
  origen: string;
  notasCliente?: string | null;
  customer: {
    nombre: string;
    celular: string;
  };
  service: {
    nombre: string;
  };
  staff: {
    nombre: string;
    color: string;
  };
}

interface AppointmentsTableProps {
  initialAppointments: AppointmentItem[];
}

export default function AppointmentsTable({
  initialAppointments,
}: AppointmentsTableProps) {
  const [appointments, setAppointments] =
    useState<AppointmentItem[]>(initialAppointments);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [originFilter, setOriginFilter] = useState("all");

  const filteredAppointments = appointments.filter((app) => {
    const q = search.toLowerCase();
    const matchSearch =
      app.codigo.toLowerCase().includes(q) ||
      app.customer.nombre.toLowerCase().includes(q) ||
      app.customer.celular.includes(q) ||
      app.service.nombre.toLowerCase().includes(q);

    const matchStatus =
      statusFilter === "all" ? true : app.estado === statusFilter;
    const matchOrigin =
      originFilter === "all" ? true : app.origen === originFilter;

    return matchSearch && matchStatus && matchOrigin;
  });

  const exportCsv = () => {
    const headers = [
      "Codigo",
      "Cliente",
      "Celular",
      "Servicio",
      "Manicurista",
      "Fecha",
      "Hora",
      "Precio",
      "Estado",
      "Origen",
    ];
    const rows = filteredAppointments.map((a) => [
      a.codigo,
      `"${a.customer.nombre}"`,
      a.customer.celular,
      `"${a.service.nombre}"`,
      `"${a.staff.nombre}"`,
      format(new Date(a.startAt), "yyyy-MM-dd"),
      format(new Date(a.startAt), "HH:mm"),
      a.precio,
      a.estado,
      a.origen,
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `citas_nails_express_${format(new Date(), "yyyyMMdd")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Archivo CSV descargado.");
  };

  return (
    <div className="space-y-4">
      {/* Search and Filters Bar */}
      <div className="bg-white p-4 rounded-[16px] border border-[#ECECEC] flex flex-wrap items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por cliente, código o celular..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-primary"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary bg-white font-medium"
          >
            <option value="all">Todos los estados</option>
            <option value="CONFIRMADA">Confirmadas</option>
            <option value="COMPLETADA">Completadas</option>
            <option value="CANCELADA">Canceladas</option>
            <option value="NO_ASISTIO">No asistió</option>
          </select>

          {/* Origin Filter */}
          <select
            value={originFilter}
            onChange={(e) => setOriginFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-primary bg-white font-medium"
          >
            <option value="all">Todos los orígenes</option>
            <option value="WEB">Web pública</option>
            <option value="ADMIN">Panel Admin</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="TELEFONO">Teléfono</option>
          </select>

          {/* Export Button */}
          <button
            onClick={exportCsv}
            className="btn-outline text-xs py-2 px-3 inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-[16px] border border-[#ECECEC] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 border-b border-gray-100 text-[#8E8E8E] uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Cliente</th>
                <th className="py-3 px-4">Servicio</th>
                <th className="py-3 px-4">Fecha y Hora</th>
                <th className="py-3 px-4">Manicurista</th>
                <th className="py-3 px-4">Precio</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-mono font-bold text-primary">
                    {app.codigo}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-bold text-[#1A1A1A]">
                      {app.customer.nombre}
                    </p>
                    <p className="text-[0.7rem] text-gray-500">
                      {app.customer.celular}
                    </p>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#1A1A1A]">
                    {app.service.nombre}
                  </td>
                  <td className="py-3.5 px-4">
                    <p className="font-medium text-[#1A1A1A] capitalize">
                      {format(new Date(app.startAt), "d 'de' MMM, yyyy", {
                        locale: es,
                      })}
                    </p>
                    <p className="text-[0.7rem] text-gray-500">
                      {format(new Date(app.startAt), "HH:mm")} -{" "}
                      {format(new Date(app.endAt), "HH:mm")}
                    </p>
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className="px-2 py-0.5 rounded-full text-[0.65rem] font-bold"
                      style={{
                        backgroundColor: `${app.staff.color}20`,
                        color: app.staff.color,
                      }}
                    >
                      {app.staff.nombre}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-[#E8707A]">
                    S/ {app.precio.toFixed(0)}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[0.65rem] font-bold ${
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
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <a
                      href={`https://wa.me/${app.customer.celular.replace(
                        /[^\d]/g,
                        ""
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="p-1.5 text-gray-400 hover:text-green-600 inline-block"
                      title="Contactar WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-xs">
            No se encontraron citas con los filtros seleccionados.
          </div>
        )}
      </div>
    </div>
  );
}
