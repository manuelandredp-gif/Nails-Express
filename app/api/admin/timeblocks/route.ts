import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { withSession, withManager, readJson } from "@/lib/http/api";

export const dynamic = "force-dynamic";

const blockCreate = z.object({
  staffId: z.string().nullable().optional(),
  startAt: z.string(),
  endAt: z.string(),
  motivo: z.string().trim().min(1).max(200),
});

// Cualquier usuario logueado puede VER los bloqueos (los necesita la agenda).
export const GET = withSession(async () => {
  const timeBlocks = await prisma.timeBlock.findMany({
    include: { staff: true },
    orderBy: { startAt: "asc" },
  });
  return NextResponse.json({ timeBlocks });
});

// Solo la administración puede crear bloqueos.
export const POST = withManager(async (req) => {
  const { staffId, startAt, endAt, motivo } = await readJson(req, blockCreate);
  const timeBlock = await prisma.timeBlock.create({
    data: {
      staffId: staffId || null,
      startAt: new Date(startAt),
      endAt: new Date(endAt),
      motivo,
    },
  });
  return NextResponse.json({ success: true, timeBlock }, { status: 201 });
});
