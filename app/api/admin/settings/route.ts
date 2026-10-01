import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { revalidatePublicSite } from "@/lib/revalidate";
import { withManager } from "@/lib/http/api";
import {
  SETTINGS_STRING_FIELDS,
  SETTINGS_INT_FIELDS,
  SETTINGS_BOOL_FIELDS,
} from "@/lib/domain/settings-fields";

export const dynamic = "force-dynamic";

export const GET = withManager(async () => {
  const settings = await prisma.settings.findUnique({ where: { id: "default" } });
  return NextResponse.json({ settings });
});

export const PATCH = withManager(async (req) => {
  const body = await req.json().catch(() => ({}));
  const data: Record<string, string | number | boolean | null> = {};

  for (const key of SETTINGS_STRING_FIELDS) {
    if (key in body && body[key] !== undefined) {
      const v = body[key];
      data[key] = v === null ? null : String(v);
    }
  }
  // "logo" es opcional: cadena vacía => null
  if (data.logo === "") data.logo = null;

  for (const key of SETTINGS_INT_FIELDS) {
    if (key in body && body[key] !== undefined && body[key] !== "") {
      const n = parseInt(String(body[key]), 10);
      if (!Number.isNaN(n)) data[key] = n;
    }
  }

  for (const key of SETTINGS_BOOL_FIELDS) {
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
});
