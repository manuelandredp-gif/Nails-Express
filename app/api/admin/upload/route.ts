import { NextResponse } from "next/server";
import path from "path";
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

  const ext = (path.extname(file.name) || "." + file.type.split("/")[1]).toLowerCase();
  const base =
    path
      .basename(file.name, path.extname(file.name))
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 40) || "imagen";
  const name = `${Date.now()}-${base}${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  try {
    const url = await saveUpload(buffer, name, file.type);
    return NextResponse.json({ url });
  } catch (err: any) {
    // El error de almacenamiento es informativo para la administración (no sensible).
    throw new HttpError(500, err?.message || "No se pudo guardar la imagen.");
  }
});
