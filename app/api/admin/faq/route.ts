import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import { withManager, readJson } from "@/lib/http/api";

export const dynamic = "force-dynamic";

const faqCreate = z.object({
  pregunta: z.string().trim().min(1).max(500),
  respuesta: z.string().trim().min(1).max(5000),
});

export const GET = withManager(async () => {
  const faqs = await prisma.faq.findMany({ orderBy: { orden: "asc" } });
  return NextResponse.json({ faqs });
});

export const POST = withManager(async (req) => {
  const { pregunta, respuesta } = await readJson(req, faqCreate);
  const count = await prisma.faq.count();
  const faq = await prisma.faq.create({
    data: { pregunta, respuesta, orden: count + 1, visible: true },
  });
  revalidatePublicSite();
  return NextResponse.json({ success: true, faq }, { status: 201 });
});
