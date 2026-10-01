import { NextResponse } from "next/server";
import sharp from "sharp";
import { saveUpload } from "@/lib/infrastructure/storage";
import { withManager, HttpError } from "@/lib/http/api";

export const dynamic = "force-dynamic";

// SVG excluido a propósito: puede contener scripts (vector de XSS).
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024;

export const POST = withManager(async (req) => {
  const formData = await req.formData();
  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    throw new HttpError(400, "No se recibió archivo.");
  }
  if (!ALLOWED.includes(file.type)) {
    throw new HttpError(400, "Formato no permitido. Usa JPG, PNG, WEBP o GIF.");
  }
  if (file.size > MAX_BYTES) {
    throw new HttpError(400, "La imagen supera 8 MB.");
  }

  const base =
    file.name
      .replace(/\.[^.]+$/, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "imagen";

  const original = Buffer.from(await file.arrayBuffer());

  // Procesa con sharp: valida que sea una imagen real (si no, lanza), auto-orienta
  // y ELIMINA metadatos EXIF (incluida ubicación GPS), redimensiona si es enorme y
  // convierte a WebP (mucho más liviano). Cubre validación de contenido + privacidad.
  let webp: Buffer;
  try {
    webp = await sharp(original)
      .rotate()
      .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 80 })
      .toBuffer();
  } catch {
    throw new HttpError(400, "El archivo no es una imagen válida.");
  }

  const name = `${Date.now()}-${base}.webp`;
  try {
    const url = await saveUpload(webp, name, "image/webp");
    return NextResponse.json({ url });
  } catch (err: any) {
    // El error de almacenamiento es informativo para la administración (no sensible).
    throw new HttpError(500, err?.message || "No se pudo guardar la imagen.");
  }
});
