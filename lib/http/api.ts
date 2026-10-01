import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession, AdminSession } from "@/lib/auth";
import { Rol, MANAGER_ROLES } from "@/lib/domain/constants";
import { logError } from "@/lib/infrastructure/logger";

/**
 * Infraestructura HTTP compartida para las rutas del panel. Reemplaza el
 * copy-paste de `getAdminSession()` + verificación de rol que estaba repetido en
 * ~24 rutas (una sola fuente de verdad para los permisos de la API) y centraliza
 * la traducción de errores a respuestas HTTP.
 */

/** Error con código HTTP para cortar un handler y responder de forma controlada. */
export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "HttpError";
  }
}

type Handler = (
  req: NextRequest,
  ctx: { params: Record<string, string> },
  session: AdminSession
) => Promise<NextResponse> | NextResponse;

/**
 * Envuelve un handler exigiendo sesión y (opcionalmente) un rol permitido.
 * Traduce HttpError → su código, y cualquier error inesperado → 500 con log.
 */
export function withRole(roles: readonly Rol[] | null, handler: Handler) {
  return async (
    req: NextRequest,
    ctx: { params?: Record<string, string> } = {}
  ): Promise<NextResponse> => {
    try {
      const session = await getAdminSession();
      if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
      }
      if (roles && !roles.includes(session.rol as Rol)) {
        return NextResponse.json(
          { error: "No tienes permiso para esta acción." },
          { status: 403 }
        );
      }
      return await handler(req, { params: ctx.params ?? {} }, session);
    } catch (err: any) {
      if (err instanceof HttpError) {
        return NextResponse.json({ error: err.message }, { status: err.status });
      }
      logError("api_unhandled", err, { path: req.nextUrl?.pathname });
      return NextResponse.json(
        { error: "Ocurrió un error. Inténtalo de nuevo." },
        { status: 500 }
      );
    }
  };
}

/** Handler para cualquier usuario logueado (incluye trabajadoras). */
export const withSession = (handler: Handler) => withRole(null, handler);
/** Handler solo para dueña/administración. */
export const withManager = (handler: Handler) => withRole(MANAGER_ROLES, handler);

/**
 * Lee y valida el cuerpo JSON con un esquema zod. Lanza HttpError(400) con un
 * mensaje claro si el cuerpo no cumple el esquema.
 */
export async function readJson<S extends z.ZodTypeAny>(
  req: NextRequest,
  schema: S
): Promise<z.infer<S>> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    throw new HttpError(400, "El cuerpo de la solicitud no es válido.");
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    throw new HttpError(400, first?.message || "Datos inválidos.");
  }
  return parsed.data;
}
