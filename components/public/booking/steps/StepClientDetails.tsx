import React from "react";
import { User, Phone, Mail, FileText } from "lucide-react";
import { ServiceItem } from "../types";

interface StepClientDetailsProps {
  nombre: string;
  onChangeNombre: (v: string) => void;
  celular: string;
  onChangeCelular: (v: string) => void;
  email: string;
  onChangeEmail: (v: string) => void;
  notasCliente: string;
  onChangeNotas: (v: string) => void;
  selectedService: ServiceItem | null;
  selectedSlot: string | null;
  currency: string;
}

export default function StepClientDetails({
  nombre,
  onChangeNombre,
  celular,
  onChangeCelular,
  email,
  onChangeEmail,
  notasCliente,
  onChangeNotas,
  selectedService,
  selectedSlot,
  currency,
}: StepClientDetailsProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-[#1A1A1A]">
          3. Datos de contacto para tu reserva
        </h2>
        <p className="text-xs text-[#8E8E8E] mt-1">
          Te enviaremos los detalles y recordatorio de tu cita a este número.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Full Name */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Nombre y Apellidos *
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="text"
              required
              placeholder="Ej. Gabriela Flores"
              value={nombre}
              onChange={(e) => onChangeNombre(e.target.value)}
              className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {/* WhatsApp / Cellphone */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            WhatsApp / Celular *
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="tel"
              required
              placeholder="Ej. 952 123 456"
              value={celular}
              onChange={(e) => onChangeCelular(e.target.value)}
              className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
          <span className="text-[10px] text-gray-400 mt-1 block">
            Te notificaremos por WhatsApp antes de tu turno.
          </span>
        </div>

        {/* Email */}
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">
            Correo Electrónico (Opcional)
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <input
              type="email"
              placeholder="ejemplo@correo.com"
              value={email}
              onChange={(e) => onChangeEmail(e.target.value)}
              className="w-full text-sm pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>

        {/* Notes */}
        <div className="sm:col-span-2">
          <label className="block text-xs font-bold text-gray-700 mb-1">
            ¿Algún diseño especial o detalle previo? (Opcional)
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            <textarea
              rows={2}
              placeholder="Ej. Deseo retiro de acrílico previo, o llevar un diseño con pedrería..."
              value={notasCliente}
              onChange={(e) => onChangeNotas(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-gray-200 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
            />
          </div>
        </div>
      </div>

      <p className="text-[0.65rem] text-gray-400 leading-relaxed px-1">
        🔒 Usamos tus datos solo para gestionar tu cita y recordártela por WhatsApp.
        No los compartimos con terceros. Puedes pedir su eliminación cuando quieras.
      </p>
    </div>
  );
}
