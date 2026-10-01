import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Sube un archivo y devuelve su URL pública.
 * - Si hay credenciales de Supabase Storage, sube al bucket (persistente en la nube).
 * - Si no, guarda en /public/uploads (solo para desarrollo local).
 *
 * En producción (Vercel) el disco es de solo lectura, así que SIEMPRE se necesita
 * Supabase Storage: las variables NEXT_PUBLIC_SUPABASE_URL y
 * SUPABASE_SERVICE_ROLE_KEY deben estar configuradas y el bucket debe existir.
 */
export async function saveUpload(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
  const esProduccion = process.env.NODE_ENV === "production";

  if (supabaseUrl && serviceKey) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });

    const subir = () =>
      supabase.storage.from(bucket).upload(filename, buffer, { contentType, upsert: false });

    let { error } = await subir();

    // Autocuración: si el bucket no existe, se crea (público) y se reintenta,
    // para que la dueña no tenga que configurar nada manualmente en Supabase.
    if (error && /bucket not found/i.test((error as any)?.message || "")) {
      const { error: createErr } = await supabase.storage.createBucket(bucket, {
        public: true,
      });
      if (createErr && !/already exists/i.test(createErr.message)) {
        throw new Error(`No se pudo crear el bucket "${bucket}": ${createErr.message}`);
      }
      ({ error } = await subir());
    }

    if (error) {
      throw new Error(`Supabase Storage: ${(error as any)?.message || String(error)}`);
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
    return data.publicUrl;
  }

  // En producción no hay disco persistente: exigir Supabase Storage configurado.
  if (esProduccion) {
    throw new Error(
      "Falta configurar Supabase Storage. En Vercel agrega NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY, y crea un bucket público llamado \"uploads\"."
    );
  }

  // Fallback local (solo desarrollo).
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${filename}`;
}
