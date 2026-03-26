-- Fix: relation "saved_places" does not exist (migration 1784000000013 not applied).
-- Run this against your `ride_share` database in TablePlus, pgAdmin, Neon SQL editor, etc.
-- Safe to run more than once (idempotent where supported).

-- --- users ---
ALTER TABLE users ADD COLUMN IF NOT EXISTS department_team varchar(120);
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_name varchar(120);
ALTER TABLE users ADD COLUMN IF NOT EXISTS emergency_contact_phone varchar(32);
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz;

-- --- passenger_profiles ---
ALTER TABLE passenger_profiles ADD COLUMN IF NOT EXISTS usual_commute_days text;
ALTER TABLE passenger_profiles ADD COLUMN IF NOT EXISTS preferred_morning_time varchar(8);
ALTER TABLE passenger_profiles ADD COLUMN IF NOT EXISTS preferred_evening_time varchar(8);
ALTER TABLE passenger_profiles ADD COLUMN IF NOT EXISTS ride_preferences text;

-- --- driver_profiles ---
ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS pickup_radius_meters integer;
ALTER TABLE driver_profiles ADD COLUMN IF NOT EXISTS commute_notes text;

-- --- saved_places ---
CREATE TABLE IF NOT EXISTS saved_places (
  id serial PRIMARY KEY NOT NULL,
  user_id integer NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  kind varchar(32) NOT NULL,
  label varchar(255) NOT NULL,
  place_id varchar(255) NOT NULL,
  lat varchar(32) NOT NULL,
  lng varchar(32) NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL,
  updated_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS saved_places_user_id_kind_index ON saved_places (user_id, kind);

-- Optional: record migration so future `node ace migration:run` skips this file.
-- Only run if table `adonis_schema` already exists and this migration name is not present.
-- INSERT INTO adonis_schema (name, batch)
-- SELECT 'database/migrations/1784000000013_onboarding_saved_places_and_profile_fields',
--        COALESCE((SELECT MAX(batch) FROM adonis_schema), 0) + 1
-- WHERE NOT EXISTS (
--   SELECT 1 FROM adonis_schema
--   WHERE name = 'database/migrations/1784000000013_onboarding_saved_places_and_profile_fields'
-- );
