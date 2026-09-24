-- PostgreSQL / Supabase Exclusion Constraint to guarantee zero overlap at the database engine level
-- Run this in your Supabase SQL editor or as a migration on PostgreSQL

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- Drop if exists to allow clean re-runs
ALTER TABLE "Appointment" DROP CONSTRAINT IF EXISTS no_overlap_per_staff;

-- Exclude overlapping time intervals for the same staff member
ALTER TABLE "Appointment"
  ADD CONSTRAINT no_overlap_per_staff
  EXCLUDE USING gist (
    "staffId" WITH =,
    tstzrange("startAt", "endAt", '[)') WITH &&
  ) WHERE (estado IN ('PENDIENTE','CONFIRMADA'));
