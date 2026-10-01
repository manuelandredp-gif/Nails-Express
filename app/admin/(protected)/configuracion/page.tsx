import React from "react";
import { prisma } from "@/lib/db";
import { requireManager } from "@/lib/auth";
import SettingsManager from "@/components/admin/SettingsManager";
import MaintenanceCard from "@/components/admin/MaintenanceCard";

export const dynamic = "force-dynamic";

export default async function AdminConfiguracionPage() {
  await requireManager();
  const settings = await prisma.settings.findUnique({
    where: { id: "default" },
  });

  return (
    <>
      <SettingsManager initialSettings={settings as any} />
      <MaintenanceCard />
    </>
  );
}
