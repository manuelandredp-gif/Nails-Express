import React from "react";
import { prisma } from "@/lib/db";
import { requireManager } from "@/lib/auth";
import FaqManager from "@/components/admin/FaqManager";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  await requireManager();
  const faqs = await prisma.faq.findMany({
    orderBy: { orden: "asc" },
  });

  return <FaqManager initialFaqs={faqs} />;
}
