# Internal alpha — manual E2E checklist

Use this for a **full manual pass** over onboarding, admin, driver, and passenger flows (dev identity). Not a production runbook.

---

## Prerequisites

### Environment

| Location | Variables |
|----------|-----------|
| **Frontend** `.env.local` | `NEXT_PUBLIC_API_BASE_URL` (session cookies via `credentials: "include"`), optional `NEXT_PUBLIC_ALLOW_DEV_IDENTITY_HEADERS` + `NEXT_PUBLIC_DEV_USER_ID` for dev-only `X-User-Id`, `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (recommended) |
| **Backend** `backend/.env` | DB, `APP_KEY`, `APP_URL`, etc. — see `backend/.env.example` |
| **Optional** | `GOOGLE_MAPS_SERVER_API_KEY` — road-following polylines; without it, templates still get **synthetic** geometry on create/seed |

### Database

```bash
cd backend
node ace migration:run
node ace migration:fresh --seed   # clean slate + demo data
```

**If the API returns 500 and Postgres says `relation "saved_places" does not exist`:** migrations are behind the code.

1. **Preferred:** from `backend/` run `node ace migration:run` (Postgres running, `DB_*` correct in `backend/.env`). Check `node ace migration:status`.
2. **Without terminal:** open `backend/database/scripts/fix_0013_saved_places.sql`, copy all SQL, run it in **TablePlus / pgAdmin / Neon / any SQL client** connected to your `ride_share` database. Then restart the Adonis API.

### Start servers

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2 (repo root)
npm run dev
```

Smoke: `GET /health` on the API. Open `/` — should **redirect to `/home`** always (seeded users see the full home dashboard; incomplete users see **Get started**; missing **`NEXT_PUBLIC_API_BASE_URL`** shows the **API not configured** card on **`/home`**).

---

## Test users (after `migration:fresh --seed`)

Switch persona: **Sign out** (Profile or login page), then sign in as another user. Optional: enable **`NEXT_PUBLIC_ALLOW_DEV_IDENTITY_HEADERS`** and use the **Dev** menu for `X-User-Id` when not signed in.

| ID | Email (reference) | Role |
|----|-------------------|------|
| **1** | admin@rides.local | Admin (`is_admin`), passenger only |
| **2** | host@rides.local | **Approved driver** + rider; owns seeded templates & trips |
| **3** | rider-a@rides.local | Rider; **pending** seat request on Ortigas → BGC trip |
| **4** | rider-b@rides.local | Rider; **accepted** on Makati → QC trip (exact pickup visible) |

**Not seeded:** drivers stuck in **pending / rejected / revoked** — cover via onboarding wizard + admin actions.

---

## Seeded corridors & trips (what to expect)

| Template | Corridor | Notes |
|----------|----------|--------|
| A | **Ortigas** → **BGC High Street** | Recurring Mon; trip **today** (UTC); rider **3** has pending request |
| B | **Makati Ave** → **Quezon City Hub** | Recurring Tue; trip **today**; rider **4** accepted + passenger row |

**Search tip (passenger):** In Google Places, choose pickup/destination **near Metro Manila** along those corridors (e.g. Ortigas / BGC) so the matcher returns cards with **Request seat** enabled.

**Geometry:** After seed, templates have polyline (Directions if server key set, else synthetic). Legacy DBs: `node ace backfill:route-geometry` (Directions only, null polylines only).

---

## End-to-end flows (step-by-step)

### A. Quick sanity (all roles)

1. Open **`/login`**, sign in with `rider-a@rides.local` / **`RiderA123!`** (after seed or `ensure:alpha-users`), then **`/`** → **`/home`**.
2. Bottom nav: **Home**, **Search**, **Trips**, **Profile** load without white screen.
3. Set user **2**, open **`/dashboard`** → hero + **Today’s trips** lists both seeded runs (trip date = **today**).
4. Same user: **Pending seat requests** shows rider **3**’s request → tap → **`/trips/{id}/requests`** → Accept or Decline.

### B. Passenger (user **3**)

| Step | Where | Expect |
|------|--------|--------|
| 1 | `/home` | Hero, nearby route cards, **Next pickup** card with link to trip detail when applicable |
| 2 | `/search` | Before search: dashed “No search yet”; submit valid Places → loading → results or **No matching routes** |
| 3 | Results | Map fallback if no key; **Request seat** only when `nextTripInstanceId` present; errors → toast + dev hint |
| 4 | `/trips` | My trips lists (or empty states) |
| 5 | `/trips/{id}` | Trip you’re on: map, pickup copy; exact pin only if accepted |

### C. Driver (user **2**)

| Step | Where | Expect |
|------|--------|--------|
| 1 | `/dashboard` | Status chip, summary text, **Pending seat requests** (if any), **Today’s trips** |
| 2 | `/trips/{id}/requests` | Accept / Decline; toasts; list badges |
| 3 | `/routes` | Templates + maps; status presentation |
| 4 | `/routes/new` | Without browser Maps key: disabled fields + explanation; with key: select Places → submit → success |

### D. Admin (user **1**)

| Step | Where | Expect |
|------|--------|--------|
| 1 | `/admin` | Stats + users + reports (or error card + **Retry** if API down) |
| 2 | Driver approval | Approve / reject pending drivers (avoid acting on **your own** dev user id if UI blocks it) |
| 3 | Non-admin | If you open `/admin` as user **2** or **3**, expect API **403**-style failure in UI — **expected** |

### E. Onboarding (optional second track)

Use a **fresh user** (new DB row or temporary user) with **`onboarding_completed_at` null** to walk:

1. Open **`/`** → **`/home`** shows **Get started**; optional **`/onboarding`** for the full welcome screen. Completing flow: role → profile → places → passenger or driver → **Finish** / driver gate. Direct visits to **`/search`** or **`/trips`** before completion should bounce to **`/home`** (Get started).
2. **Driver path:** after submit, finish screen shows **pending approval** until admin approves.
3. **`/onboarding/driver/pending`** redirects to **`/onboarding/finish`** (legacy URL).

---

## UI states to spot-check

| Area | Loading | Empty | Error | Success |
|------|---------|-------|-------|---------|
| `/` (root) | “Opening home…” | — | — | Always redirect to **`/home`** |
| `/home` (incomplete) | Skeleton then Get started | — | Retry + Open setup (snapshot error) | Get started CTAs → onboarding profile |
| `/home` (no API URL) | — | — | — | **API not configured** card + link to **`/onboarding`** |
| `/search` / `/trips` (incomplete or no API / bad snapshot) | “Checking setup…” / “Opening home…” | — | Redirect to **`/home`** | Full UI when API + snapshot OK and `onboarding_completed_at` set |
| `/admin` (same gates) | “Checking setup…” | — | Redirect to **`/home`** | Then usual admin UI + API 403 for non-admins |
| Passenger home | Skeleton | No routes card | Error card + Retry | Lists + maps |
| Search | Skeleton / “Searching…” | No search / no results copy | Results error card | Results + toast on request |
| Trip detail | Skeleton | — | Error + Retry | Map + pickup per privacy |
| Driver dashboard | Skeleton | No pending / no trips sections | Error + Retry | Pending row + today’s trips |
| Trip requests | Skeleton | No requests | Error + Retry | Accept/decline |
| Admin | Section skeletons | — | Retry per section | Actions + toasts |

---

## Known limitations

- **Internal auth** — email/password + session cookie; optional dev **`X-User-Id`** when env flags allow (`FRONTEND_LOCAL_SETUP.md`, `AUTH_TRANSITION_PLAN.md`).
- **Admin tab** visible to everyone in the shared shell; only user **1** gets full API access.
- **In-app chat** not wired; trip detail says to coordinate off-app.
- **Trip request queue** has no map (by design for this alpha).
- **Timezone:** “Today” for driver trips is **UTC** date — edge cases near midnight UTC.
- **Workspace vs passenger layout:** `/home` uses passenger shell; **Drive** tab targets **`/home`** when the API URL is missing, otherwise snapshot-driven dashboard / finish gates / **`/home`** for incomplete onboarding. **`/profile`** and **`/onboarding/*`** stay reachable without the passenger gate; **`/admin`** requires API + snapshot + completed onboarding before the admin UI loads (role checks unchanged).

---

## Optional: full onboarding → approval → new route → request

1. Create or use a user with **no** `onboarding_completed_at` (not covered by default seed).
2. Complete wizard as **driver**; finish on **pending** gate.
3. As **admin (1)**, approve that driver.
4. As that driver, **`/routes/new`** → create corridor (browser Maps key required).
5. Ensure a **trip instance** exists for that template (seed/job — today’s product may require manual DB or future materialization).
6. As passenger, **search** and **request seat**; as driver, **accept** on **`/dashboard`** → queue.

---

## Related docs

- `FRONTEND_LOCAL_SETUP.md` — env details.
- `backend/.env.example` — server env.
- `AUTH_TRANSITION_PLAN.md` — future auth.

---

## Blockers addressed in repo (recent)

- Seeded users now have **`onboarding_completed_at` set** so `/` → `/home` works for IDs 1–4.
- Seeded **`trip_date` is today (UTC)** so **Today’s trips** is populated.
- Driver **dashboard** now lists **pending seat requests** with deep links to the per-trip queue.
- Root **`/`** redirects to **`/home`** (or **`/onboarding`** if the API URL is unset); **`/home`** handles snapshot errors with **Retry** + **Open setup**.

**Remaining gaps for a “perfect” loop:** materializing trip instances from new templates automatically; non-admin `/admin` UX could hide the tab (not done — known limitation).
