import { revalidatePath } from "next/cache";
import { logError } from "./infrastructure/logger";

/**
 * Invalida la caché ISR de toda la web pública para que los cambios
 * hechos desde el admin se vean de inmediato (sin esperar los 60s).
 */
export function revalidatePublicSite() {
  try {
    revalidatePath("/", "layout");
  } catch (err) {
    logError("revalidate_failed", err);
  }
}
