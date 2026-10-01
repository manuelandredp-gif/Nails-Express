import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { revalidatePublicSite } from "@/lib/revalidate";

export const dynamic = "force-dynamic";

const STRING_FIELDS = [
  "nombreNegocio", "logo", "telefono", "whatsapp", "email", "direccion", "linkMapa",
  "horarioVisible", "moneda",
  "heroKicker", "heroTitulo", "heroTituloItalico", "heroSubtitulo", "heroBoton",
  "heroImagen", "heroImagenAlt", "heroCaligrafia",
  "heroBadge1Titulo", "heroBadge1Texto", "heroBadge2Titulo", "heroBadge2Texto",
  "heroBadge3Titulo", "heroBadge3Texto",
  "nosotrosTitulo", "nosotrosTexto", "nosotrosBoton", "nosotrosImagen", "nosotrosImagenAlt",
  "metricasClientes", "metricasCalificacion", "metricasAnos",
  "metricasClientesLabel", "metricasCalificacionLabel", "metricasAnosLabel",
  "instagramUrl", "tiktokUrl", "facebookUrl",
  "logoTextoPrincipal", "logoTextoSecundario", "menuLinks", "headerBoton",
  "serviciosTitulo", "serviciosSubtitulo", "serviciosBotonTodos",
  "reservaRapidaTitulo", "reservaRapidaSubtitulo", "reservaRapidaBoton",
  "galeriaTitulo", "galeriaSubtitulo", "blogTitulo", "blogSubtitulo",
  "faqTitulo", "faqSubtitulo",
  "contactoTitulo", "contactoSubtitulo", "contactoImagen", "contactoImagenAlt",
  "contactoBotonWhatsapp", "mapaEmbedUrl", "whatsappMensaje", "whatsappBotonTexto",
  "footerDescripcion", "footerCopyright", "footerFrase", "footerLinks",
  "seoTitulo", "seoDescripcion", "seoKeywords",
  "ciudad", "pais", "codigoPostal", "latitud", "longitud", "rangoPrecios", "metodosPago",
  "blogCtaTitulo", "blogCtaTexto", "blogCtaBoton", "servicioRating", "servicioRatingTexto",
  "dashBadgeCitasHoy", "dashSubCitasHoy", "dashBadgeSemana", "dashBadgeIngresos",
  "dashBadgeInasistencia",
  "sellosPremio", "sellosTitulo", "sellosSubtitulo",
  "beneficios", "testimoniosTitulo", "testimoniosSubtitulo",
  "coloresTitulo", "coloresSubtitulo", "coloresLista",
  "antesDespuesTitulo", "antesImagen", "despuesImagen", "instagramUsuario",
] as const;

const INT_FIELDS = [
  "anticipacionMinimaHoras",
  "maximoDiasAdelante",
  "intervaloSlotsMinutos",
  "horasLimiteCancelacion",
  "sellosMeta",
  "sellosExpiraDias",
] as const;

const BOOL_FIELDS = [
  "mostrarMapa",
  "sellosActivo",
  "beneficiosActivo",
  "testimoniosActivo",
  "coloresActivo",
  "antesDespuesActivo",
  "instagramActivo",
] as const;

export async function GET() {
  try {
    const settings = await prisma.settings.findUnique({ where: { id: "default" } });
    return NextResponse.json({ settings });
  } catch {
    return NextResponse.json({ error: "Error al obtener configuración." }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session || (session.rol !== "OWNER" && session.rol !== "ADMIN")) {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const body = await request.json();
    const data: Record<string, string | number | boolean | null> = {};

    for (const key of STRING_FIELDS) {
      if (key in body && body[key] !== undefined) {
        const v = body[key];
        data[key] = v === null ? null : String(v);
      }
    }
    // "logo" es opcional: cadena vacía => null
    if (data.logo === "") data.logo = null;

    for (const key of INT_FIELDS) {
      if (key in body && body[key] !== undefined && body[key] !== "") {
        const n = parseInt(String(body[key]), 10);
        if (!Number.isNaN(n)) data[key] = n;
      }
    }

    for (const key of BOOL_FIELDS) {
      if (key in body && body[key] !== undefined) {
        data[key] = Boolean(body[key]);
      }
    }

    const updated = await prisma.settings.upsert({
      where: { id: "default" },
      update: data,
      create: { id: "default", ...data },
    });

    revalidatePublicSite();

    return NextResponse.json({ success: true, settings: updated });
  } catch (err) {
    console.error("Settings PATCH error:", err);
    return NextResponse.json({ error: "Error al actualizar configuración." }, { status: 500 });
  }
}
