# Ride-share API — backend structure

## Folders

| Path | Role |
|------|------|
| `app/controllers/` | Thin HTTP handlers; delegate to services and validators. |
| `app/services/` | Business logic and DTO shaping (including privacy rules). |
| `app/models/` | Lucid models and relationships. |
| `app/validators/` | Vine validators for POST/PATCH bodies. |
| `app/auth/` | `resolveRequestActor` — session guard (`web`) first, then optional dev **`X-User-Id`** when `ALLOW_DEV_IDENTITY_HEADERS` allows it. |
| `app/middleware/` | `DevIdentityMiddleware` (calls `resolveRequestActor`), suspension, admin, driver gates. |
| `app/constants/trip.ts` | Shared string enums for statuses and moderation. |
| `app/modules/*/` | Barrel exports grouped by domain (passenger, driver, profile, admin, trips). |
| `database/migrations/` | PostgreSQL schema (snake_case columns). |
| `database/seeders/` | Sample users, profiles, templates, trips, requests, messages. |
| `start/routes/` | Route registration split by domain (`passenger.ts`, `driver.ts`, `profile.ts`, `admin.ts`, `chat.ts`, `trips.ts`). |
| `providers/api_provider.ts` | `HttpContext.serialize()` + `currentUser` typing. |

## Module boundaries

- **Passenger** — home aggregation, route suggestions, trip detail for riders, creating trip requests. Services: `PassengerRouteSuggestionService`, `PassengerTripRequestService`.
- **Driver** — dashboard, route templates CRUD, trip-instance request queue, accept/decline, passenger cancel. Services: `DriverDashboardService`, `DriverRouteTemplateService`, `DriverTripRequestService`. New templates use `hydrateRouteTemplateGeometry` (Directions or synthetic). For **existing** rows with null `route_polyline`, run **`node ace backfill:route-geometry`** (`commands/backfill_route_geometry.ts`) — Directions only via `fetchDrivingRouteGeometry`, no synthetic. See **`ALPHA_TEST_CHECKLIST.md`**.
- **Profile** — `/api/v1/me/*` account + public alias/avatar. Service: `ProfileService`.
- **Trips** — domain constants; HTTP trip routes can grow in `start/routes/trips.ts`.
- **Admin** — dashboard stats, user list, reports list, suspend user, revoke driver. Service: `AdminModerationService`.

Cross-cutting **privacy** logic lives in **`PrivacyViewService`** only. Passenger- and driver-facing controllers should not hand-roll alias/pickup JSON.

## Privacy enforcement

1. **Public identity** — Outside `/api/v1/me/profile`, list/search/trip payloads expose only what `PrivacyViewService.formatPublicProfile` returns: `alias`, `avatar`, and a transitional `avatarEmoji` mirror. `users.real_name` is never included in those payloads.
2. **Pickup** — `PrivacyViewService.approximatePickupLabel` formats copy for approximate pins. Exact coordinates/labels on **trip requests** are included only when `PrivacyViewService.canSeeExactPassengerPickup` is true: request status is `accepted` **and** the viewer is the rider or the trip driver.
3. **Trip instances** — `trip_instances.exact_pickup_unlocked` is set when a driver accepts a request (operational flag); visibility of exact pickup for a given user still follows trip-request status + role rules above.
4. **Admin** — `GET /api/v1/admin/users` intentionally includes `realName` / `email` for moderation; keep these endpoints behind `is_admin` + `DevIdentityMiddleware` (later: real auth).

## Route templates vs trip instances

- **`route_templates`** describe a recurring (or typed) corridor: origin/destination labels and coordinates, default seats, detour tolerance, `schedule_type`, template `departure_time`, and `status`. Child rows in **`route_template_schedules`** encode which weekdays the template runs (`day_of_week`, `is_active`). They are **patterns**, not a specific calendar occurrence.
- **`trip_instances`** are **concrete runs** on a `trip_date` at `departure_time`, with `seats_total`, `seats_remaining`, `route_status`, optional `route_polyline` / distance / duration, and `driver_user_id`. They may reference a `route_template_id` but carry their own seat counts and lifecycle (scheduled → completed/cancelled). Materializing instances from templates (cron/job) is a future step; the schema keeps the separation clear.

## Authentication

- **`POST /api/v1/auth/register`**, **`POST /api/v1/auth/login`**, **`POST /api/v1/auth/logout`**, **`GET /api/v1/auth/me`** — session cookie (Adonis `web` guard); passwords hashed with **scrypt** via `@adonisjs/auth` mixins on **`User`**.
- Protected **`/api/v1/*`** routes use **`DevIdentityMiddleware`**, which sets **`ctx.currentUser`** from the session user, or from **`X-User-Id`** only when dev headers are allowed (not in production by default).
- Run **`node ace migration:fresh --seed`** (or **`node ace ensure:alpha-users`**) for local personas with known passwords — see **`FRONTEND_LOCAL_SETUP.md`**.

For future SSO / production hardening, see **`AUTH_TRANSITION_PLAN.md`** at the monorepo root.
