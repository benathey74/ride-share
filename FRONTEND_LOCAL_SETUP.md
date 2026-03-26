# Frontend local setup (Next.js + Adonis)

## Where `.env.local` lives

Put **`.env.local` in the frontend project root** — the same directory as this file, `package.json`, and `next.config.ts` / `next.config.js` (the ride-share repo root for this app).

Next.js loads `NEXT_PUBLIC_*` variables from there automatically when you run `npm run dev` or `npm run build`. They are inlined at **dev server start** or **build time**, so changes require a restart.

## One-time setup

1. Copy the example file:

   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and set at minimum:

   | Variable | Example | Purpose |
   |----------|---------|---------|
   | `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:3333` | Adonis API origin (no trailing slash). The app sends **`credentials: "include"`** on API calls so the **session cookie** from login is stored and replayed. |
   | `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | *(optional but needed for place search & map previews)* | Google Maps **browser** key for driver route creation (`/routes/new`) and passenger/driver map tiles |

3. **Optional dev impersonation:** set `NEXT_PUBLIC_ALLOW_DEV_IDENTITY_HEADERS=true` to send **`X-User-Id`** when you are **not** signed in (see **Dev** menu). Omit this for “real product” testing with login only.

4. **Restart** the Next dev server after editing env vars:

   ```bash
   npm run dev
   ```

## Sign in and register

- **`/login`** — email + password → `POST /api/v1/auth/login` establishes a **server session** (cookie).
- **`/register`** — email, password, confirm password, and **intended role**:
  - **Passenger** — `can_ride` only; onboarding covers rider setup.
  - **Driver** — `can_drive` only; driver profile is **pending** until an admin approves.
  - **Both** — passenger + driver; driver side pending until approved.
- After registration you are signed in and sent to **`/onboarding`** (welcome).
- **Sign out:** Profile → **Sign out**, or **Sign out (clear server session)** on the login page.

Use **`http://localhost:3000`** for the Next app and **`http://localhost:3333`** for the API (same host, different port — the session cookie is still sent on cross-port requests to `localhost` in major browsers).

## Provisioned admin (internal testing)

After `node ace migration:fresh --seed` or `node ace ensure:alpha-users` from `backend/`:

| Email | Password |
|-------|----------|
| **admin@rides.local** | **Admin123!** |

This user is **`is_admin`** and can open **`/admin`** immediately after signing in.

### Other seeded accounts (optional)

| Email | Password |
|-------|----------|
| host@rides.local | Host123! |
| rider-a@rides.local | RiderA123! |
| rider-b@rides.local | RiderB123! |

## Seeded users without a full reseed

From `backend/` run:

```bash
node ace ensure:alpha-users
```

Idempotent upsert for the four alpha personas, passwords as above, roles, onboarding, public + passenger profiles, approved driver for host.

## Backend must be running

The UI calls `NEXT_PUBLIC_API_BASE_URL`. With the default example, start Adonis on **port 3333** (see `backend/.env` / `PORT`).

Optional check: open `http://localhost:3333/health` — JSON like `{ "ok": true, "service": "ride-share-api" }`. The frontend `checkApiHealth()` helper uses the same endpoint.

**CORS:** In development, `backend/config/cors.ts` allows cross-origin requests with **`credentials: true`**, so the session cookie can be set and read from the Next origin.

## Verify configuration

1. `.env.local` exists next to `package.json`.
2. `NEXT_PUBLIC_API_BASE_URL` is set (no trailing `/`).
3. Dev server restarted after edits.
4. Backend up on the same host/port as the URL.
5. Open **`/login`**, sign in as **admin@rides.local** / **Admin123!**, then **`/admin`** should load (not “admin access required” for the wrong reason).

6. **`/`** redirects to **`/home`**. Protected routes require a session; without API URL, behavior is unchanged for unconfigured setups.

7. In development, with **`NEXT_PUBLIC_ALLOW_DEV_IDENTITY_HEADERS=true`**, a **Dev** dropdown can still set **`X-User-Id`** when **no** session exists.

## Google Maps (driver create route)

Driver **New route** (`/routes/new`) uses the [Maps JavaScript API](https://developers.google.com/maps/documentation/javascript) with the **Places** library for autocomplete.

1. In [Google Cloud Console](https://console.cloud.google.com/), enable **Maps JavaScript API** and **Places API**.
2. Create an **API key** restricted to **HTTP referrers**, e.g. `http://localhost:3000/*`.
3. Set in `.env.local`:

   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
   ```

4. Restart `npm run dev`.

## Internal alpha (quick pointer)

For migrations, personas, and a longer checklist, see **`MVP_READY_CHECKLIST.md`** and **`ALPHA_TEST_CHECKLIST.md`**.

**Road-following polylines** for legacy templates: set `GOOGLE_MAPS_SERVER_API_KEY` in `backend/.env`, then `node ace backfill:route-geometry` from `backend/`.

### Suggested E2E flow

1. Sign in as **admin@rides.local** / **Admin123!** — confirm **`/admin`**.
2. Sign out; **`/register`** as **passenger** — complete onboarding; exercise search / trips as a new user.
3. Sign out; **`/register`** as **driver** — complete onboarding; confirm driver **pending** state.
4. Sign in as admin — **approve** the new driver.
5. Sign in as that driver — create a route / run the seat request loop with a second passenger account.
