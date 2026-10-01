import { NextRequest, NextResponse } from "next/server";
import path from "path";
import { getAdminSession } from "@/lib/auth";
import { saveUpload } from "@/lib/infrastructure/storage";

export const dynamic = "force-dynamic";

// SVG excluido a propósito: puede contener scripts (vector de XSS).
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const formData = await request.formData();
    const file = formData.get("file");
    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "No se recibió archivo." }, { status: 400 });
    }
    if (!ALLOWED.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato no permitido. Usa JPG, PNG, WEBP o GIF." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: "La imagen supera 8 MB." }, { status: 400 });
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
    const url = await saveUpload(buffer, name, file.type);

    return NextResponse.json({ url });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json({ error: "Error al subir la imagen." }, { status: 500 });
  }
}
