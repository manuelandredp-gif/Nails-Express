import React from "react";
import { Filter } from "lucide-react";

interface StaffItem {
  id: string;
  nombre: string;
  color: string;
}

interface AgendaStaffFilterProps {
  staffList: StaffItem[];
  selectedStaff: string;
  onSelectStaff: (id: string) => void;
}

export default function AgendaStaffFilter({
  staffList,
  selectedStaff,
  onSelectStaff,
}: AgendaStaffFilterProps) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 mr-1">
        <Filter className="w-3.5 h-3.5 text-gray-400" />
        <span>Filtrar por:</span>
      </div>

      <button
        type="button"
        onClick={() => onSelectStaff("all")}
        className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
          selectedStaff === "all"
            ? "bg-primary text-white shadow-xs"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        <span className="w-2 h-2 rounded-full bg-white/80" />
        <span>Todas</span>
      </button>

      {staffList.map((st) => {
        const isSelected = selectedStaff === st.id;
        return (
          <button
            key={st.id}
            type="button"
            onClick={() => onSelectStaff(st.id)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-2 border ${
              isSelected
                ? "border-current shadow-xs"
                : "border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
            }`}
            style={
              isSelected
                ? {
                    backgroundColor: `${st.color}15`,
                    color: st.color,
                    borderColor: st.color,
                  }
                : {}
            }
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: st.color }}
            />
            <span>{st.nombre}</span>
          </button>
        );
      })}
    </div>
  );
}
