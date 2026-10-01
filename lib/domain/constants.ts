/**
 * Fuente única de verdad para los conceptos del dominio que antes vivían como
 * strings sueltos repartidos por el código (roles, estados de cita, métodos de
 * pago, orígenes). Centralizarlos aquí da seguridad de tipos en compilación:
 * un typo como "MANICURSITA" deja de compilar.
 */

// ---------- Roles ----------
export const ROLES = ["OWNER", "ADMIN", "RECEPCION", "MANICURISTA"] as const;
export type Rol = (typeof ROLES)[number];

/** Roles con acceso total (caja, edición, configuración, equipo). */
export const MANAGER_ROLES = ["OWNER", "ADMIN"] as const;

/** Roles que una administradora puede asignar a una empleada. */
export const ROLES_ASIGNABLES = ["MANICURISTA", "RECEPCION", "ADMIN"] as const;

export const ROL_LABEL: Record<Rol, string> = {
  OWNER: "Dueña",
  ADMIN: "Administradora",
  RECEPCION: "Recepción",
  MANICURISTA: "Manicurista",
};

export function isManagerRol(rol?: string | null): boolean {
  return rol === "OWNER" || rol === "ADMIN";
}

/** Una manicurista vinculada a un staff solo ve/gestiona sus propias citas. */
export function soloVeSusCitas(rol?: string | null): boolean {
  return rol === "MANICURISTA";
}

// ---------- Estados de cita ----------
export const ESTADOS_CITA = [
  "PENDIENTE",
  "CONFIRMADA",
  "COMPLETADA",
  "CANCELADA",
  "NO_ASISTIO",
] as const;
export type EstadoCita = (typeof ESTADOS_CITA)[number];

/** Estados que ocupan un horario (bloquean el slot). */
export const ESTADOS_ACTIVOS: readonly EstadoCita[] = ["PENDIENTE", "CONFIRMADA"];

// ---------- Métodos de pago ----------
export const METODOS_PAGO = ["EFECTIVO", "YAPE", "PLIN", "TARJETA"] as const;
export type MetodoPago = (typeof METODOS_PAGO)[number];

export const METODO_PAGO_LABEL: Record<MetodoPago, string> = {
  EFECTIVO: "Efectivo",
  YAPE: "Yape",
  PLIN: "Plin",
  TARJETA: "Tarjeta",
};

// ---------- Orígenes de la reserva ----------
export const ORIGENES = ["WEB", "ADMIN", "WHATSAPP", "TELEFONO"] as const;
export type Origen = (typeof ORIGENES)[number];
