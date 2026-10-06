export interface Cuenta {
  userId: string;
  email: string;
  rol: string;
  activo: boolean;
}

export interface Empleada {
  staffId: string;
  nombre: string;
  foto: string;
  color: string;
  activo: boolean;
  dni: string | null;
  telefono: string | null;
  email: string | null;
  direccion: string | null;
  cuenta: Cuenta | null;
}

export interface Manager {
  id: string;
  nombre: string;
  email: string;
  rol: string;
}

export interface FichaDraft {
  staffId?: string;
  nombre: string;
  dni: string;
  telefono: string;
  email: string;
  direccion: string;
  color: string;
}

export const FICHA_VACIA: FichaDraft = {
  nombre: "",
  dni: "",
  telefono: "",
  email: "",
  direccion: "",
  color: "#3EA59E",
};

export const ROLES = [
  { id: "MANICURISTA", label: "Manicurista", desc: "Solo ve y atiende sus propias citas. Sin caja ni edición." },
  { id: "RECEPCION", label: "Recepción", desc: "Ve y atiende todas las citas. Sin caja ni edición." },
  { id: "ADMIN", label: "Administradora", desc: "Acceso total: caja, clientas, configuración y equipo." },
];

export const ROL_CHIP: Record<string, string> = {
  OWNER: "bg-primary/15 text-primary",
  ADMIN: "bg-purple-100 text-purple-700",
  RECEPCION: "bg-blue-100 text-blue-700",
  MANICURISTA: "bg-[#E6F6F4] text-[#2AA79C]",
};

export const ROL_NOMBRE: Record<string, string> = {
  OWNER: "Dueña",
  ADMIN: "Administradora",
  RECEPCION: "Recepción",
  MANICURISTA: "Manicurista",
};

export const inputCls =
  "mt-1 w-full rounded-lg border border-[#E1F4F1] px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#9FE0D9]";
