import React from "react";
import { prisma } from "@/lib/db";
import SettingsManager from "@/components/admin/SettingsManager";

export const dynamic = "force-dynamic";

export default async function AdminConfiguracionPage() {
  const settings = await prisma.settings.findUnique({
    where: { id: "default" },
  });

  return <SettingsManager initialSettings={settings as any} />;
}
