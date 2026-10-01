-- AlterTable
ALTER TABLE "Appointment" ADD COLUMN     "metodoPago" TEXT,
ADD COLUMN     "pagadoEn" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "Settings" ADD COLUMN     "ctaFinalBoton" TEXT NOT NULL DEFAULT 'Reservar mi cita',
ADD COLUMN     "ctaFinalSubtitulo" TEXT NOT NULL DEFAULT 'Elige tu servicio, tu manicurista y tu horario. Tu cita queda confirmada al momento.',
ADD COLUMN     "ctaFinalTitulo" TEXT NOT NULL DEFAULT '¿Lista para estrenar uñas?',
ADD COLUMN     "heroNota" TEXT NOT NULL DEFAULT 'Reserva online en 1 minuto · Confirmación al instante';
