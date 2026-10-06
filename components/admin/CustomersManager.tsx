"use client";

import React, { useState } from "react";
import {
  Search,
  User,
  Phone,
  Mail,
  Calendar,
  DollarSign,
  AlertTriangle,
  History,
  Save,
  MessageCircle,
  X,
  FileText,
} from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { toast } from "sonner";

interface CustomerWithDetails {
  id: string;
  nombre: string;
  celular: string;
  email: string | null;
  notasInternas: string | null;
  totalCitas: number;
  inasistencias: number;
  sellos?: number;
  sellosTotal?: number;
  nivel?: string;
  ultimaVisita: string | null;
  citas: {
    id: string;
    codigo: string;
    startAt: string;
    precio: number;
    estado: string;
    service: { nombre: string };
    staff: { nombre: string };
  }[];
}

interface CustomersManagerProps {
  initialCustomers: CustomerWithDetails[];
}

export default function CustomersManager({
  initialCustomers,
}: CustomersManagerProps) {
  const [customers, setCustomers] =
    useState<CustomerWithDetails[]>(initialCustomers);
  const [search, setSearch] = useState("");
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerWithDetails | null>(null);
  const [editNotes, setEditNotes] = useState("");
  const [savingNotes, setSavingNotes] = useState(false);
  // Alta de clienta nueva
  const [showNew, setShowNew] = useState(false);
  const [nuevo, setNuevo] = useState({ nombre: "", celular: "", email: "", notasInternas: "" });
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!nuevo.nombre.trim() || !nuevo.celular.trim()) {
      toast.error("El nombre y el celular son obligatorios.");
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/admin/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(nuevo),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al registrar");
      setCustomers((prev) => [
        {
          ...data.customer,
          ultimaVisita: null,
          citas: [],
        },
        ...prev,
      ]);
      setNuevo({ nombre: "", celular: "", email: "", notasInternas: "" });
      setShowNew(false);
      toast.success("Clienta registrada en la base de datos.");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setCreating(false);
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.nombre.toLowerCase().includes(search.toLowerCase()) ||
      c.celular.includes(search) ||
      (c.email && c.email.toLowerCase().includes(search.toLowerCase()))
  );

  const openCustomer = (customer: CustomerWithDetails) => {
    setSelectedCustomer(customer);
    setEditNotes(customer.notasInternas || "");
  };

  const handleSaveNotes = async () => {
    if (!selectedCustomer) return;
    setSavingNotes(true);
    try {
      const res = await fetch(`/api/admin/customers/${selectedCustomer.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notasInternas: editNotes }),
      });

      if (!res.ok) {
        toast.error("Error al actualizar notas.");
      } else {
        toast.success("Ficha del cliente actualizada.");
        setCustomers(
          customers.map((c) =>
            c.id === selectedCustomer.id ? { ...c, notasInternas: editNotes } : c
          )
        );
        setSelectedCustomer({ ...selectedCustomer, notasInternas: editNotes });
      }
    } catch (err) {
      toast.error("Error al guardar.");
    } finally {
      setSavingNotes(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <div className="bg-white p-4 rounded-[16px] border border-[#ECECEC] flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nombre, celular o correo..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-gray-200 rounded-lg outline-none focus:border-primary"
          />
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500 font-medium hidden sm:inline">
            {filteredCustomers.length} clientes registrados
          </span>
          <button
            onClick={() => setShowNew(true)}
            className="btn-primary text-xs py-2 px-4 inline-flex items-center gap-1.5 shrink-0"
          >
            <User className="w-3.5 h-3.5" /> Nueva clienta
          </button>
        </div>
      </div>

      {/* Modal: registrar clienta nueva */}
      {showNew && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="px-5 py-4 border-b border-[#ECECEC] flex items-center justify-between">
              <h2 className="font-bold text-[#1A1A1A]">Nueva clienta</h2>
              <button onClick={() => setShowNew(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <label className="block">
                <span className="text-xs font-semibold text-[#6B6B6B]">Nombre *</span>
                <input
                  value={nuevo.nombre}
                  onChange={(e) => setNuevo({ ...nuevo, nombre: e.target.value })}
                  placeholder="Ej. María López"
                  className="mt-1 w-full rounded-lg border border-[#E1F4F1] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE0D9]"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-[#6B6B6B]">Celular *</span>
                <input
                  value={nuevo.celular}
                  onChange={(e) => setNuevo({ ...nuevo, celular: e.target.value })}
                  placeholder="+51 999 999 999"
                  className="mt-1 w-full rounded-lg border border-[#E1F4F1] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE0D9]"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-[#6B6B6B]">Correo (opcional)</span>
                <input
                  type="email"
                  value={nuevo.email}
                  onChange={(e) => setNuevo({ ...nuevo, email: e.target.value })}
                  placeholder="correo@ejemplo.com"
                  className="mt-1 w-full rounded-lg border border-[#E1F4F1] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE0D9]"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-[#6B6B6B]">Nota (opcional)</span>
                <textarea
                  rows={2}
                  value={nuevo.notasInternas}
                  onChange={(e) => setNuevo({ ...nuevo, notasInternas: e.target.value })}
                  placeholder="Ej. Prefiere tonos nude, alérgica a..."
                  className="mt-1 w-full rounded-lg border border-[#E1F4F1] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#9FE0D9] resize-none"
                />
              </label>
            </div>
            <div className="px-5 py-4 border-t border-[#ECECEC] flex justify-end gap-2">
              <button
                onClick={() => setShowNew(false)}
                className="text-sm py-2 px-4 rounded-lg border border-[#E1F4F1] text-[#6B6B6B] hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={creating}
                className="btn-primary text-sm py-2 px-4 inline-flex items-center gap-1.5 disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {creating ? "Guardando..." : "Registrar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid of Customer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCustomers.map((cust) => {
          const totalSpent = cust.citas
            .filter((c) => c.estado === "COMPLETADA" || c.estado === "CONFIRMADA")
            .reduce((sum, c) => sum + c.precio, 0);

          return (
            <div
              key={cust.id}
              onClick={() => openCustomer(cust)}
              className="bg-white p-5 rounded-[16px] border border-[#ECECEC] hover:shadow-hover hover:border-primary/40 transition-all cursor-pointer flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {cust.nombre.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-[#1A1A1A]">
                        {cust.nombre}
                      </h3>
                      <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-primary" />
                        <span>{cust.celular}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-gray-100 text-center">
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="block text-[0.65rem] text-gray-400 uppercase font-semibold">
                      Citas
                    </span>
                    <span className="font-extrabold text-sm text-[#1A1A1A]">
                      {cust.totalCitas}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="block text-[0.65rem] text-gray-400 uppercase font-semibold">
                      Gastado
                    </span>
                    <span className="font-extrabold text-sm text-[#3EA59E]">
                      S/ {totalSpent.toFixed(0)}
                    </span>
                  </div>
                  <div className="bg-gray-50 p-2 rounded-lg">
                    <span className="block text-[0.65rem] text-gray-400 uppercase font-semibold">
                      Faltas
                    </span>
                    <span
                      className={`font-extrabold text-sm ${
                        cust.inasistencias > 0 ? "text-red-600" : "text-gray-700"
                      }`}
                    >
                      {cust.inasistencias}
                    </span>
                  </div>
                </div>

                {cust.notasInternas && (
                  <p className="text-[0.7rem] text-gray-500 line-clamp-1 italic mt-2">
                    "{cust.notasInternas}"
                  </p>
                )}
              </div>

              <div className="pt-2 border-t border-gray-50 flex items-center justify-between text-xs text-primary font-semibold">
                <span>Ver historial completo</span>
                <span>→</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Customer Detail Modal / Slide-over */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[20px] max-w-xl w-full p-6 space-y-6 animate-in zoom-in-95 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-start justify-between border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-lg">
                  {selectedCustomer.nombre.charAt(0)}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#1A1A1A]">
                    {selectedCustomer.nombre}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                    <span>{selectedCustomer.celular}</span>
                    {selectedCustomer.email && (
                      <>
                        <span>•</span>
                        <span>{selectedCustomer.email}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-[#2AA79C] bg-[#E6F6F4] px-2 py-0.5 rounded-full">
                      💅 {selectedCustomer.sellos ?? 0} sellos
                    </span>
                    {selectedCustomer.nivel && selectedCustomer.nivel !== "Nueva" && (
                      <span className="inline-flex items-center gap-1 text-[0.7rem] font-bold text-[#B98F3E] bg-[#F8EFD9] px-2 py-0.5 rounded-full">
                        ★ {selectedCustomer.nivel}
                      </span>
                    )}
                    <span className="text-[0.7rem] text-gray-400">
                      {selectedCustomer.sellosTotal ?? 0} ganados en total
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick WhatsApp Action */}
            <a
              href={`https://wa.me/${selectedCustomer.celular.replace(
                /[^\d]/g,
                ""
              )}`}
              target="_blank"
              rel="noreferrer"
              className="btn-primary text-xs py-2 px-4 w-full justify-center"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contactar por WhatsApp</span>
            </a>

            {/* Internal Notes / Preferences / Allergies */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-primary" />
                <span>Notas Internas (Alergias, Gustos, Preferencias)</span>
              </h4>
              <textarea
                rows={3}
                value={editNotes}
                onChange={(e) => setEditNotes(e.target.value)}
                placeholder="Ej. Uñas sensibles, prefiere limado cuadrado, alérgica al látex..."
                className="w-full p-3 text-xs border rounded-lg outline-none focus:border-primary resize-none"
              />
              <button
                onClick={handleSaveNotes}
                disabled={savingNotes}
                className="btn-blush text-xs py-1.5 px-4 inline-flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingNotes ? "Guardando..." : "Guardar Ficha"}</span>
              </button>
            </div>

            {/* Appointment History */}
            <div className="space-y-3 pt-2 border-t">
              <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5 text-primary" />
                <span>Historial de Visitas ({selectedCustomer.citas.length})</span>
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedCustomer.citas.length === 0 ? (
                  <p className="text-xs text-gray-400">Sin citas previas.</p>
                ) : (
                  selectedCustomer.citas.map((cita) => (
                    <div
                      key={cita.id}
                      className="p-3 bg-gray-50 rounded-lg text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-gray-800">
                          {cita.service.nombre}
                        </span>
                        <span className="text-gray-500 block text-[0.7rem] capitalize">
                          {format(new Date(cita.startAt), "d 'de' MMMM yyyy", {
                            locale: es,
                          })}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-[#3EA59E] block">
                          S/ {cita.precio}
                        </span>
                        <span className="text-[0.65rem] px-2 py-0.5 rounded-full font-bold bg-green-100 text-green-700">
                          {cita.estado}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
