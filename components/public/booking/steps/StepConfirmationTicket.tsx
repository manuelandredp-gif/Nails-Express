import React, { useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  CheckCircle,
  Calendar,
  Clock,
  User,
  Scissors,
  MapPin,
  Sparkles,
  QrCode,
  Copy,
  Check,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";

interface StepConfirmationTicketProps {
  booking: any;
  currency: string;
}

export default function StepConfirmationTicket({
  booking,
  currency,
}: StepConfirmationTicketProps) {
  const [copied, setCopied] = useState(false);

  if (!booking) return null;

  const handleCopyCode = () => {
    if (booking.codigo) {
      navigator.clipboard.writeText(booking.codigo);
      setCopied(true);
      toast.success("Código copiado al portapapeles.");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const bookingCode = booking.codigo || "NX-PENDIENTE";
  const myBookingUrl = `/mis-citas?code=${bookingCode}`;
  const qrTargetUrl = typeof window !== "undefined"
    ? `${window.location.origin}${myBookingUrl}`
    : `https://nailsexpress.pe${myBookingUrl}`;
  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
    qrTargetUrl
  )}&color=0E0E0E&bgcolor=FFFFFF&margin=6`;

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-extrabold text-[#1A1A1A]">
          ¡Tu cita está 100% confirmada!
        </h2>
        <p className="text-xs sm:text-sm text-[#6B6B6B] max-w-md mx-auto">
          Hemos reservado tu turno exclusivamente para ti sin solapamientos. Presenta este pase digital en recepción al llegar.
        </p>
      </div>

      {/* Boutique Digital Ticket Pass */}
      <div className="max-w-md mx-auto bg-gradient-to-b from-white to-[#FAFDFD] rounded-[24px] border-2 border-primary/30 shadow-xl overflow-hidden relative">
        {/* Ticket Header */}
        <div className="bg-[#1A1A1A] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-primary">
              Nails Express Boutique
            </span>
          </div>
          <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-full text-gray-300">
            PASE DIGITAL
          </span>
        </div>

        {/* Ticket Body */}
        <div className="p-6 space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-gray-100">
            <div>
              <span className="text-[10px] uppercase font-bold text-gray-400">
                Código de Reserva
              </span>
              <div className="text-2xl font-black text-primary font-mono tracking-wider flex items-center gap-2">
                <span>{bookingCode}</span>
                <button
                  type="button"
                  onClick={handleCopyCode}
                  className="p-1 rounded-md text-gray-400 hover:text-primary transition-colors"
                  title="Copiar código"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Live Scannable QR Code */}
            <div className="p-1 bg-white border border-gray-200 rounded-xl shadow-xs shrink-0 text-center">
              <img
                src={qrImageUrl}
                alt={`QR ${bookingCode}`}
                className="w-20 h-20 rounded-lg object-contain"
              />
              <span className="text-[9px] font-bold text-gray-400 block mt-0.5">
                Escanear en salón
              </span>
            </div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Scissors className="w-3.5 h-3.5 text-primary" />
                <span>Tratamiento:</span>
              </span>
              <span className="font-bold text-[#1A1A1A]">
                {booking.servicio}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-primary" />
                <span>Fecha:</span>
              </span>
              <span className="font-bold text-[#1A1A1A] capitalize">
                {format(new Date(booking.startAt), "EEEE d 'de' MMMM", {
                  locale: es,
                })}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>Hora:</span>
              </span>
              <span className="font-bold text-primary text-sm">
                {format(new Date(booking.startAt), "HH:mm")} hrs
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-primary" />
                <span>Especialista asignada:</span>
              </span>
              <span className="font-bold text-[#1A1A1A]">
                {booking.manicurista}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-gray-50">
              <span className="text-gray-500 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-primary" />
                <span>Ubicación:</span>
              </span>
              <span className="font-bold text-[#1A1A1A]">
                Calle San Martín 620, Tacna
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs font-bold text-gray-700">Total a pagar en salón:</span>
              <span className="text-lg font-black text-[#E8707A]">
                {currency} {booking.precio?.toFixed(0) || "0"}
              </span>
            </div>
          </div>
        </div>

        {/* Ticket Footer Action */}
        <div className="bg-gray-50 p-4 border-t border-gray-100 flex items-center justify-between gap-3">
          <Link
            href={myBookingUrl}
            className="text-xs font-bold text-primary hover:text-primary-dark underline inline-flex items-center gap-1"
          >
            <span>Ver mi pase digital completo</span>
            <ArrowRight className="w-3 h-3" />
          </Link>

          <a
            href={`https://wa.me/51952123456?text=${encodeURIComponent(
              `Hola Nails Express, tengo la reserva ${bookingCode} para el ${format(
                new Date(booking.startAt),
                "dd/MM HH:mm"
              )} y deseo hacer una consulta.`
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#25D366] text-white px-3 py-1.5 rounded-full hover:bg-[#20ba59] transition-colors"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
