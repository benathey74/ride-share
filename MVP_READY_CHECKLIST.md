# MVP / internal alpha readiness

Use this document to **stand up**, **smoke-test**, and **scope** the ride-share app for a small internal alpha. It complements `ALPHA_TEST_CHECKLIST.md` (detailed manual steps); this file is the **MVP entry point**.

**Auth:** Email + password with **session cookie** (`POST /api/v1/auth/login`, `GET /api/v1/auth/me`). Optional **`X-User-Id`** only when `NEXT_PUBLIC_ALLOW_DEV_IDENTITY_HEADERS=true` (and backend `ALLOW_DEV_IDENTITY_HEADERS` allows it).

---

## Required environment variables

### Frontend (repo root → `.env.local`)

| Variable | Required | Purpose |
|----------|----------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | **Yes** | Adonis API origin, e.g. `http://localhost:3333` (no trailing slash). All API calls use `credentials: "include"` for the session cookie. |
| `NEXT_PUBLIC_ALLOW_DEV_IDENTITY_HEADERS` | **Optional** | Set to `true` only for local **impersonation** via `X-User-Id` when not signed in. Omit in normal testing (real login only). |
| `NEXT_PUBLIC_DEV_USER_ID` | **Optional** | Used only when dev headers are enabled; default numeric id for `X-User-Id` if the Dev menu has no override. |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | **Strongly recommended** | Browser key: **Maps JavaScript API** + **Places API**, referrer-restricted to your dev origin. Needed for onboarding places, passenger search, driver route creation autocomplete, and map previews. |

### Backend (`backend/.env`)

| Area | Notes |
|------|--------|
| `APP_KEY` | Generate with `node ace generate:key` if missing. |
| `APP_URL` | URL clients use to reach the API (e.g. `http://localhost:3333`). |
| `SESSION_DRIVER` | `cookie` (default) — session stores auth for the web guard. |
| `ALLOW_DEV_IDENTITY_HEADERS` | Optional. When `false`, disables `X-User-Id` fallback (forces real session). Defaults to allowed in non-production. |
| `DB_*` | Postgres host, port, user, password, database name. |
| `GOOGLE_MAPS_SERVER_API_KEY` | Optional. When set, new route templates get **Directions** polylines; otherwise geometry may be synthetic. |

**Tooling note:** Some environments inject invalid `DB_HOST` values (e.g. RFC 5737 test nets). The app clears those so `backend/.env` can apply—if migrations still fail, run `DB_HOST=127.0.0.1 node ace migration:run` from `backend/`.

---

## Startup steps

1. **Postgres** running and database created (e.g. `ride_share`).
2. **Backend**
   ```bash
   cd backend && npm install && node ace migration:run && node ace ensure:alpha-users && npm run dev
   ```
   After the first clone, run migrations (adds `users.password`). `ensure:alpha-users` sets known passwords on seeded personas.
3. **Frontend** (repo root)
   ```bash
   npm install && npm run dev
   ```
4. Smoke: `GET {API}/health` → OK. Open `/` → always redirects to **`/home`**. **`/home`** shows the **API not configured** card if `NEXT_PUBLIC_API_BASE_URL` is missing, **Get started** until `onboarding_completed_at` is set, or the full dashboard when complete. **`/search`**, **`/trips`**, **`/trips/[id]`**, driver routes (**`/dashboard`**, **`/routes`**, **`/routes/new`**, trip request queues), and **`/admin`** redirect to **`/home`** when the API URL is missing, the onboarding snapshot cannot be used, or onboarding is incomplete (admin still enforces API role checks after the gate).

---

## Migrations and seed

```bash
cd backend
node ace migration:run
```

**Repair alpha personas** (existing DB, no SQL): `node ace ensure:alpha-users` — safe to repeat.

**Fresh database + demo data (destructive):**

```bash
cd backend
node ace migration:fresh --seed
```

After `--seed`, use the **test users** below. If `saved_places` or onboarding columns are missing, migrations are behind—see `ALPHA_TEST_CHECKLIST.md` or `backend/database/scripts/fix_0013_saved_places.sql`.

**Optional:** `node ace backfill:route-geometry` for older DBs with null template polylines (Directions only when server key is set).

---

## Test users and passwords (after seed or `ensure:alpha-users`)

Sign in at **`/login`** with **email + password** (session cookie). Provisioned **admin** (required for `/admin`):

| Email | Password | Role |
|-------|----------|------|
| **admin@rides.local** | **Admin123!** | Admin; use for `/admin`. |

Other seeded accounts (same command / `--seed`):

| Email | Password | Notes |
|-------|----------|--------|
| host@rides.local | Host123! | Approved driver + rider; seeded routes/trips. |
| rider-a@rides.local | RiderA123! | Rider; pending seat request on seeded trip. |
| rider-b@rides.local | RiderB123! | Rider; accepted on seeded trip. |

**New accounts:** **`/register`** — choose **Passenger**, **Driver**, or **Both**; then complete onboarding. Drivers start **pending** until an admin approves.

**Optional dev impersonation:** set `NEXT_PUBLIC_ALLOW_DEV_IDENTITY_HEADERS=true` and use the **Dev** menu (development only). The API still prefers a **valid session** over `X-User-Id`.

**Not in seed:** Drivers in **rejected / revoked** — exercise via admin after registering a driver test user.

---

## Exact flows to test (MVP bar)

### Onboarding (three paths)

1. **Find a ride (passenger)**  
   `/onboarding` → Welcome → Profile → Places → Passenger prefs → **Finish** → **Complete setup** → `/home`.  
   Expect: no 500 on first profile save (public profile row created); `can_ride` set when passenger prefs save.

2. **Offer a ride (driver)**  
   Welcome → Profile → Places → **Driver** vehicle form → **Finish** → **Complete setup**.  
   Expect: pending driver gate until admin approves; **Continue as passenger** / **Go to home** works; legacy `/onboarding/driver/pending` redirects to **Finish**.

3. **Both**  
   Welcome → Profile → Places → **Passenger** prefs → **Driver** form → **Finish** → **Complete setup**.  
   Expect: same driver gate rules; passenger side usable while approval pending.

**Avoid:** Clearing session mid-wizard loses `wizardRole` (stored in `sessionStorage`)—Finish may send you back to Welcome; server data is still saved.

**Skip wizard:** Welcome’s “Skip wizard” completes onboarding only—**still set a public alias via Profile** so drivers see a proper rider identity.

### Main product loop (approved driver + rider)

| Step | Actor | Where | Success criteria |
|------|--------|-------|------------------|
| 1 | Driver (**host@rides.local**) | `/routes/new` | Create template (Maps key); trip instance exists for today when schedule matches (see seed). |
| 2 | Rider (**rider-a** / **rider-b**) | `/search` | Search with real Places picks; see cards; **Request seat** when `nextTripInstanceId` present. |
| 3 | Driver (**host@rides.local**) | `/dashboard` → trip requests | Pending queue; **Accept** or **Decline**; toast; list updates. |
| 4 | Rider | `/trips`, `/trips/{id}` | After accept/decline, lists and trip detail refresh (cache invalidation + refocus). |

### Admin

**admin@rides.local** / **Admin123!** → **`/admin`** — stats, users, driver approval. Non-admin signed-in users see a clear “not an admin” message; others are prompted to sign in.

---

## Known limitations (alpha)

- **Internal auth only** — email/password + session cookie; no Google/SSO. With `ALLOW_DEV_IDENTITY_HEADERS` enabled in dev, `X-User-Id` is still a dev escape hatch (disabled in production by default).
- **Google Maps** — without `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`, place autocomplete and some maps are degraded or blocked; document keys for testers.
- **Driver approval** — new drivers cannot publish/manage approved-driver routes until an admin approves (by design).
- **Skip onboarding** — does not create public profile; complete **Profile** in-app before expecting full social/trust UX.
- **Timezones** — backend uses UTC (`TZ=UTC` in backend `.env.example`); trip “today” is UTC-relative unless you align seed/data.
- **Single-region demo** — seeded corridors are Metro Manila–oriented; search must use nearby Places for matches.

---

## What is “good enough” for internal alpha

- Onboarding **passenger / driver / both** completes without server errors for a new user with migrations applied.
- **Approved driver** can create a route (with Maps key) and see trips / seat requests.
- **Passenger** can search, request a seat, and see status on **My trips** and **Trip detail**.
- **Driver** accept/decline updates **passenger** views without a full page refresh (invalidation + optional window refocus).
- **Admin** can approve drivers and use moderation surfaces for basic governance.
- **Privacy rules** remain server-driven (alias / approximate pickup); no accidental exposure of real names in shared DTOs.

Anything outside this (payments, notifications, production auth, mobile apps) is **out of scope** for this alpha.

---

## Files changed in the latest hardening pass (reference)

- `features/driver/hooks.ts` — invalidate passenger queries after accept/decline seat requests.
- `features/driver/screens/dashboard-screen.tsx` — empty state when no trips or pending requests.
- `features/passenger/hooks.ts` — shorter stale time + refetch on window focus for trip detail and my trips.
- `features/onboarding/screens/welcome-screen.tsx` — clearer copy for “Skip wizard” regarding public alias.
- `backend/app/services/profile_service.ts` (earlier) — create `public_profiles` on first PATCH; set `canRide` on passenger profile upsert.
- `features/onboarding/screens/driver-onboarding-screen.tsx` (earlier) — passenger role mis-navigation goes to passenger step, not home.

---

## Related docs

- `ALPHA_TEST_CHECKLIST.md` — longer manual E2E checklist and UI state spot-checks.
- `backend/BACKEND_STRUCTURE.md` — API modules and conventions.
- `AUTH_TRANSITION_PLAN.md` — future real auth (not implemented here).
