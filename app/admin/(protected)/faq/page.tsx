import React from "react";
import { prisma } from "@/lib/db";
import FaqManager from "@/components/admin/FaqManager";

export const dynamic = "force-dynamic";

export default async function AdminFaqPage() {
  const faqs = await prisma.faq.findMany({
    orderBy: { orden: "asc" },
  });

  return <FaqManager initialFaqs={faqs} />;
}
