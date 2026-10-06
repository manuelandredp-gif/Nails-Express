"use client";

import React, { useEffect, useState } from "react";

export interface HoursDay {
  diaSemana: number; // 0=Domingo ... 6=Sábado
  horaApertura: string; // "09:00"
  horaCierre: string; // "20:00"
  cerrado: boolean;
}

const TZ = "America/Lima";
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function toMin(hhmm: string): number {
  const [h, m] = (hhmm || "").split(":").map((n) => parseInt(n, 10));
  if (Number.isNaN(h)) return NaN;
  return h * 60 + (m || 0);
}

/** Hora actual en la zona del salón (día de la semana y minutos del día). */
function ahoraEnLima(): { dia: number; min: number } {
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ,
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  const parts = fmt.formatToParts(new Date());
  const wd = parts.find((p) => p.type === "weekday")?.value || "Sun";
  const hour = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
  const minute = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
  const map: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
  return { dia: map[wd] ?? 0, min: (hour % 24) * 60 + minute };
}

interface Estado {
  abierto: boolean;
  texto: string;
}

function calcularEstado(hours: HoursDay[]): Estado {
  const abiertos = hours.filter((h) => !h.cerrado);
  if (!abiertos.length) return { abierto: false, texto: "Cerrado" };

  const { dia, min } = ahoraEnLima();
  const hoy = abiertos.filter((h) => h.diaSemana === dia);

  for (const h of hoy) {
    const a = toMin(h.horaApertura);
    const c = toMin(h.horaCierre);
    if (!Number.isNaN(a) && !Number.isNaN(c) && min >= a && min < c) {
      return { abierto: true, texto: `Abierto ahora · cierra ${h.horaCierre}` };
    }
  }

  // Cerrado: buscar la próxima apertura (hoy más tarde o el siguiente día disponible).
  for (let offset = 0; offset < 7; offset++) {
    const d = (dia + offset) % 7;
    const delDia = abiertos
      .filter((h) => h.diaSemana === d)
      .sort((x, y) => toMin(x.horaApertura) - toMin(y.horaApertura));
    for (const h of delDia) {
      const a = toMin(h.horaApertura);
      if (offset === 0 && min >= a) continue; // ya pasó hoy
      const cuando = offset === 0 ? `hoy ${h.horaApertura}` : `${DIAS[d]} ${h.horaApertura}`;
      return { abierto: false, texto: `Cerrado · abre ${cuando}` };
    }
  }
  return { abierto: false, texto: "Cerrado" };
}

export default function OpenStatus({
  hours,
  className = "",
}: {
  hours: HoursDay[];
  className?: string;
}) {
  // Se calcula en el cliente para usar la hora real del visitante/salón.
  const [estado, setEstado] = useState<Estado | null>(null);

  useEffect(() => {
    const actualizar = () => setEstado(calcularEstado(hours));
    actualizar();
    const id = setInterval(actualizar, 60_000); // refresca cada minuto
    return () => clearInterval(id);
  }, [hours]);

  if (!hours?.length || !estado) return null;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
        estado.abierto
          ? "bg-[#E6F6F4] text-[#128C4B]"
          : "bg-gray-100 text-[#6B6B6B]"
      } ${className}`}
    >
      <span className="relative flex h-2 w-2">
        {estado.abierto && (
          <span className="absolute inline-flex h-full w-full rounded-full bg-[#20BA59] opacity-75 motion-safe:animate-ping" />
        )}
        <span
          className={`relative inline-flex h-2 w-2 rounded-full ${
            estado.abierto ? "bg-[#20BA59]" : "bg-[#B0B0B0]"
          }`}
        />
      </span>
      {estado.texto}
    </span>
  );
}
