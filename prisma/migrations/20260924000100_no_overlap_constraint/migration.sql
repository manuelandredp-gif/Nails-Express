-- Garantiza a nivel de motor que dos citas de la misma manicurista nunca se solapen.
-- Requiere la extensión btree_gist (disponible en Supabase/PostgreSQL).
CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE "Appointment" DROP CONSTRAINT IF EXISTS no_overlap_per_staff;

ALTER TABLE "Appointment"
  ADD CONSTRAINT no_overlap_per_staff
  EXCLUDE USING gist (
    "staffId" WITH =,
    tsrange("startAt", "endAt", '[)') WITH &&
  ) WHERE (estado IN ('PENDIENTE','CONFIRMADA'));
