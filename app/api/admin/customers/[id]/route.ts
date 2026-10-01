import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withManager, readJson } from "@/lib/http/api";

export const dynamic = "force-dynamic";

const schema = z.object({ notasInternas: z.string().max(2000).nullable().optional() }).strict();

export const PATCH = withManager(async (req, { params }) => {
  const { notasInternas } = await readJson(req, schema);
  const customer = await prisma.customer.update({
    where: { id: params.id },
    data: { notasInternas: notasInternas ?? null },
  });
  return NextResponse.json({ success: true, customer });
});
