-- AlterTable
ALTER TABLE "User" ADD COLUMN     "tokenVersion" INTEGER NOT NULL DEFAULT 0;

-- CreateIndex
CREATE INDEX "Appointment_pagado_pagadoEn_idx" ON "Appointment"("pagado", "pagadoEn");
