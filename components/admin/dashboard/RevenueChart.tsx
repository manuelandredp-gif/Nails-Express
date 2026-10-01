import React from "react";
import { TrendingUp } from "lucide-react";

export interface RevenuePoint {
  label: string; // "Lun"
  monto: number;
}

export default function RevenueChart({
  data,
  currency,
}: {
  data: RevenuePoint[];
  currency: string;
}) {
  const max = Math.max(1, ...data.map((d) => d.monto));
  const total = data.reduce((a, b) => a + b.monto, 0);

  return (
    <div className="bg-white rounded-[18px] border border-[#ECECEC] shadow-2xs p-5">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h2 className="text-sm font-bold text-[#1A1A1A] flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
            Ingresos de la semana
          </h2>
          <p className="text-xs text-[#8E8E8E] mt-1 ml-9">
            Últimos 7 días · Total {currency} {total.toFixed(0)}
          </p>
        </div>
      </div>

      <div className="flex items-end justify-between gap-2 h-40">
        {data.map((d, i) => {
          const h = Math.round((d.monto / max) * 100);
          const isMax = d.monto === max && d.monto > 0;
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
              <span className="text-[0.6rem] font-semibold text-[#6B6B6B] tabular-nums">
                {d.monto > 0 ? d.monto.toFixed(0) : ""}
              </span>
              <div
                className={`w-full rounded-t-lg transition-all ${
                  isMax
                    ? "bg-gradient-to-t from-[#E86B86] to-[#F3A6BC]"
                    : "bg-gradient-to-t from-[#5CC6BF] to-[#9FE0D9]"
                }`}
                style={{ height: `${Math.max(4, h)}%` }}
                title={`${currency} ${d.monto.toFixed(0)}`}
              />
              <span className="text-[0.65rem] text-[#8E8E8E] font-medium">{d.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
