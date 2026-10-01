-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "selloOtorgado" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Customer" ADD COLUMN     "sellos" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "sellosTotal" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "sellosActivo" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "sellosExpiraDias" INTEGER NOT NULL DEFAULT 180,
ADD COLUMN     "sellosMeta" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN     "sellosPremio" TEXT NOT NULL DEFAULT '50% de descuento en tu próximo servicio',
ADD COLUMN     "sellosSubtitulo" TEXT NOT NULL DEFAULT 'Junta un sello con cada visita y gana un premio',
ADD COLUMN     "sellosTitulo" TEXT NOT NULL DEFAULT 'Tu tarjeta de sellos';

-- CreateTable
CREATE TABLE "Reward" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "premio" TEXT NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'DISPONIBLE',
    "ganadoEn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "canjeadoEn" TIMESTAMP(3),
    "expiraEn" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Reward_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Reward_codigo_key" ON "Reward"("codigo");

-- CreateIndex
CREATE INDEX "Reward_customerId_idx" ON "Reward"("customerId");

-- CreateIndex
CREATE INDEX "Reward_estado_idx" ON "Reward"("estado");

-- AddForeignKey
ALTER TABLE "Reward" ADD CONSTRAINT "Reward_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE CASCADE ON UPDATE CASCADE;
