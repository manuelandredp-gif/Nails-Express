import { writeFile, mkdir } from "fs/promises";
import path from "path";

/**
 * Sube un archivo y devuelve su URL pública.
 * - Si hay credenciales de Supabase Storage, sube al bucket (persistente en la nube).
 * - Si no, guarda en /public/uploads (solo para desarrollo local).
 */
export async function saveUpload(
  buffer: Buffer,
  filename: string,
  contentType: string
): Promise<string> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const bucket = process.env.SUPABASE_STORAGE_BUCKET || "uploads";

  if (supabaseUrl && serviceKey) {
    const { createClient } = await import("@supabase/supabase-js");
    const supabase = createClient(supabaseUrl, serviceKey, {
      auth: { persistSession: false },
    });
    const { error } = await supabase.storage
      .from(bucket)
      .upload(filename, buffer, { contentType, upsert: false });
    if (error) {
      throw new Error(`Supabase Storage: ${error.message}`);
    }
    const { data } = supabase.storage.from(bucket).getPublicUrl(filename);
    return data.publicUrl;
  }

  // Fallback local (efímero en serverless; válido solo en desarrollo).
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, filename), buffer);
  return `/uploads/${filename}`;
}
