import { z } from "zod";
import {
  ROLES_ASIGNABLES,
  ESTADOS_CITA,
  METODOS_PAGO,
} from "@/lib/domain/constants";

/**
 * Esquemas de validación de entrada por recurso. Reemplazan la validación
 * artesanal (`String(body.x || "").trim()`) repetida en cada ruta y eliminan los
 * `any` de los cuerpos de petición: zod infiere el tipo y rechaza lo inválido en
 * la frontera, antes de que toque la base de datos.
 */

const textoCorto = z.string().trim().min(1).max(200);
const textoLargo = z.string().trim().max(5000);
const email = z.string().trim().toLowerCase().email("Correo no válido");
const password = z.string().min(8, "La contraseña debe tener al menos 8 caracteres");

// ---------- Cita (PATCH) ----------
export const appointmentPatchSchema = z
  .object({
    estado: z.enum(ESTADOS_CITA).optional(),
    startAt: z.string().datetime().optional(),
    endAt: z.string().datetime().optional(),
    staffId: z.string().optional(),
    notasInternas: z.string().max(5000).nullable().optional(),
    motivoCancelacion: z.string().max(500).optional(),
    pagado: z.boolean().optional(),
    metodoPago: z.enum(METODOS_PAGO).nullable().optional(),
    resenaEstrellas: z.number().int().min(1).max(5).nullable().optional(),
    resenaTexto: z.string().max(2000).nullable().optional(),
  })
  .strict();

// ---------- Usuario / acceso ----------
export const userCreateSchema = z.object({
  nombre: textoCorto,
  email,
  password,
  staffId: z.string().nullable().optional(),
  rol: z.enum(ROLES_ASIGNABLES).optional(),
});

export const userPatchSchema = z
  .object({
    nombre: textoCorto.optional(),
    activo: z.boolean().optional(),
    staffId: z.string().nullable().optional(),
    rol: z.enum(ROLES_ASIGNABLES).optional(),
    password: password.optional(),
  })
  .strict();

// ---------- Empleada (Staff) ----------
export const staffCreateSchema = z.object({
  nombre: textoCorto,
  foto: z.string().optional(),
  color: z.string().optional(),
  bio: z.string().max(1000).optional(),
  dni: z.string().trim().max(20).nullable().optional(),
  telefono: z.string().trim().max(30).nullable().optional(),
  email: email.nullable().optional().or(z.literal("")),
  direccion: z.string().trim().max(200).nullable().optional(),
});

export const staffPatchSchema = staffCreateSchema.partial().extend({
  activo: z.boolean().optional(),
});

// ---------- Clienta ----------
export const customerCreateSchema = z.object({
  nombre: textoCorto,
  celular: z.string().trim().min(6, "Celular no válido").max(30),
  email: email.nullable().optional().or(z.literal("")),
  notasInternas: z.string().max(2000).nullable().optional(),
});

// ---------- Testimonio ----------
export const testimonialCreateSchema = z.object({
  nombre: textoCorto,
  texto: textoLargo.min(1),
  estrellas: z.coerce.number().int().min(1).max(5).optional(),
  servicio: z.string().trim().max(120).nullable().optional(),
  avatar: z.string().trim().max(500).nullable().optional(),
  visible: z.boolean().optional(),
});

export const testimonialPatchSchema = z
  .object({
    nombre: textoCorto.optional(),
    texto: textoLargo.min(1).optional(),
    estrellas: z.coerce.number().int().min(1).max(5).optional(),
    servicio: z.string().trim().max(120).nullable().optional(),
    avatar: z.string().trim().max(500).nullable().optional(),
    visible: z.boolean().optional(),
    orden: z.coerce.number().int().optional(),
  })
  .strict();

// ---------- Cambio de contraseña propia ----------
export const changePasswordSchema = z.object({
  actual: z.string().min(1, "Ingresa tu contraseña actual"),
  nueva: password,
});

// ---------- Mantenimiento ----------
export const maintenanceSchema = z.object({
  confirmar: z.literal("BORRAR PRUEBAS"),
  incluirManicuristas: z.boolean().optional(),
});
