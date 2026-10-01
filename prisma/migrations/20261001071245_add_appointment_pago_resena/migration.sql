-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "pagado" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "resenaEstrellas" INTEGER,
ADD COLUMN     "resenaTexto" TEXT;
