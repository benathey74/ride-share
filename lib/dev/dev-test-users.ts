/**
 * Seeded personas from `backend/database/seeders/main_seeder.ts` (`migration:fresh --seed`).
 * Pending/rejected drivers are not in the default seed — add DB rows to test those states.
 */
export type DevTestUserPreset = {
  id: string;
  label: string;
  email: string;
};

export const DEV_TEST_USER_PRESETS: DevTestUserPreset[] = [
  { id: "1", label: "Admin", email: "admin@rides.local" },
  { id: "2", label: "Driver (approved)", email: "host@rides.local" },
  { id: "3", label: "Passenger A", email: "rider-a@rides.local" },
  { id: "4", label: "Passenger B", email: "rider-b@rides.local" },
];
