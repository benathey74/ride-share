# Authentication / identity transition plan

This document describes how the ride-share app moves from **development impersonation** (`X-User-Id` / `NEXT_PUBLIC_DEV_USER_ID`) to **real authentication** without rewriting onboarding, role gating, or the privacy model.

---

## Design goals

1. **Same product primitives** — After auth, a request still resolves to one row in **`users`** (`ctx.currentUser` on the API). Passenger/driver/both, onboarding completion, driver approval, suspension, and admin flags stay on that row and related tables.
2. **Public identity unchanged** — Riders and drivers continue to see **alias + avatar** (and related privacy rules); `real_name` / `email` remain restricted to admin and account-owner flows as today.
3. **Minimal controller churn** — HTTP handlers keep using `ctx.currentUser`; only **identity middleware** and **request header construction** change.
4. **MVP keeps working** — Local dev continues to use `NEXT_PUBLIC_DEV_USER_ID` → `X-User-Id` until you explicitly gate it off.

---

## Recommended future auth approach

Pick **one** primary pattern (both are compatible with this codebase):

| Approach | Fits when | Notes |
|----------|-----------|--------|
| **Session cookie** (e.g. Adonis session + login routes) | First-party web app only, same API origin or trusted BFF | Server sets cookie; browser sends it automatically; CSRF strategy required for mutating routes. |
| **Bearer JWT** (access token) | SPA + mobile, or API behind API gateway | Frontend stores token (memory + refresh strategy); sends `Authorization: Bearer …`. |

**Mapping to `users`:** whichever you choose, the token/session payload should resolve to **`users.id`** (integer PK you already use everywhere). If you add an external IdP (Auth0, Clerk, etc.), add a stable column such as `auth_subject` (unique) and resolve `sub` → `User` on first login, then issue your own session/JWT containing `userId`.

**Do not** scatter header parsing in controllers — keep resolution in **`resolveRequestActor`** (backend) and **`applyApiAuthHeaders`** (frontend).

---

## Current dev auth flow

### Backend

1. Protected route stacks use **`DevIdentityMiddleware`** (`start/kernel.ts` named `devIdentity`).
2. Middleware calls **`resolveRequestActor`** (`app/auth/resolve_request_actor.ts`), which:
   - Reads `X-User-Id` (optional; missing → impersonate user id **`1`**).
   - Loads `User` via `User.find(id)`.
   - Returns `400` / `401` for invalid or unknown ids.
3. Sets **`ctx.currentUser`** then runs **`suspended`**, **`admin`**, **`driver`** as today.

### Frontend

1. **`lib/api/dev-identity.ts`** — `getDevUserIdHeader()` reads `NEXT_PUBLIC_DEV_USER_ID` (default `"1"`).
2. **`lib/api/auth-headers.ts`** — `applyApiAuthHeaders()` sets `X-User-Id` on every `apiFetch` call.
3. **`lib/api/client.ts`** — all JSON API traffic goes through `apiFetch`, so impersonation is centralized.

Other UI (onboarding wizard, role-based navigation, admin “don’t approve yourself” checks) may **read** `getDevUserIdHeader()` for dev-only messaging; replace those checks with “current session user id” when auth exists.

---

## Future real auth flow (target)

### Backend

1. **New or composed middleware** (e.g. `AuthenticatedMiddleware`) runs on the same route stacks **instead of** or **before** dev impersonation:
   - Validate session or JWT.
   - Load `User` from DB; set `ctx.currentUser`.
2. **`resolveRequestActor`** gains additional branches (or you chain resolvers):
   - If valid auth → user from token/session.
   - Else if `ALLOW_DEV_IDENTITY_HEADERS=true` and environment is non-production → existing `X-User-Id` behavior for local/staging.
   - Else → `401 Unauthorized`.
3. **Registration / first login** creates or links a `users` row, sets `can_ride` / `can_drive` per product rules, then user goes through existing **onboarding** and **driver approval** flows.

### Frontend

1. After login, store **session** or **access token** (exact storage is a security/product choice).
2. **`applyApiAuthHeaders`**:
   - Sends `Authorization: Bearer <token>` and/or relies on **same-origin cookies** (no header).
   - **Stops** sending `X-User-Id` in production builds (keep behind `NODE_ENV === 'development'` or an explicit flag).
3. **React Query / route guards** continue to use API responses (`/me`, onboarding snapshot); no need to encode user id in the URL.

---

## How authenticated identity maps to the existing `users` table

- **`users.id`** remains the **application user id** for all foreign keys (`driver_profiles`, `trip_requests`, etc.).
- Auth provider identifiers live in **new columns** or a small **`auth_identities`** table if you support multiple providers — still pointing at **`users.id`**.
- **`public_profiles`** (alias, avatar) stay the rider/driver-facing identity; auth email/real name on `users` are not exposed in passenger/driver payloads except where they already are (e.g. owner profile, admin).

---

## Migration considerations

1. **Data** — Existing seeded users remain valid. Production users are created on first sign-in or invite.
2. **Admin app** — Replace “you cannot approve your own dev user” checks that compare to `NEXT_PUBLIC_DEV_USER_ID` with **session user id** from `/me` or auth context.
3. **E2E / API tests** — Today tests may send `X-User-Id`; keep that for CI with `ALLOW_DEV_IDENTITY_HEADERS`, or mint test tokens.
4. **CORS / cookies** — If using cookies, configure Adonis + Next origins explicitly; JWT avoids cross-origin cookie complexity but shifts token handling to the client.
5. **`@adonisjs/auth`** — Already a dependency; when you adopt it, wire **user provider** to your `User` model and reuse the same Lucid row.

---

## Risks to avoid

| Risk | Mitigation |
|------|------------|
| Trusting `X-User-Id` in production | Reject the header unless an explicit env flag is set; prefer JWT/session only in prod. |
| Duplicating identity logic in controllers | Only **`resolveRequestActor`** (and one middleware) should decide `currentUser`. |
| Leaking PII into passenger/driver JSON | Keep using **`PrivacyViewService`** and existing serializers; auth does not change those contracts. |
| Breaking onboarding | Onboarding stays driven by **`users.onboarding_completed_at`** and driver **`approval_status`**; auth only ensures `currentUser` is correct. |
| Two sources of truth for “who am I” | Frontend should treat **server** (`/me`, snapshot) as authoritative after auth ships. |

---

## Code map (quick reference)

| Layer | File(s) |
|-------|---------|
| Backend resolution | `backend/app/auth/resolve_request_actor.ts` |
| Backend middleware | `backend/app/middleware/dev_identity_middleware.ts`, `backend/start/kernel.ts` |
| Backend typing | `backend/providers/api_provider.ts` (`ctx.currentUser`) |
| Frontend headers | `lib/api/auth-headers.ts`, `lib/api/dev-identity.ts`, `lib/api/client.ts` |
| Env | `.env.example`, `FRONTEND_LOCAL_SETUP.md` |

---

## Summary

- **Today:** `resolveRequestActor` + `DevIdentityMiddleware` + `applyApiAuthHeaders` implement dev impersonation against **`users.id`**.
- **Tomorrow:** authenticate first, set **`ctx.currentUser`** from the same table, retire `X-User-Id` in production, and keep **onboarding / roles / privacy** exactly as they are at the data model level.
