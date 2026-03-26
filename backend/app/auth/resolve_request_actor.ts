import User from '#models/user'
import app from '@adonisjs/core/services/app'
import type { HttpContext } from '@adonisjs/core/http'
import env from '#start/env'

export type ResolveActorFailure = {
  status: 400 | 401
  message: string
}

export type ResolveActorResult =
  | { ok: true; user: User }
  | { ok: false; failure: ResolveActorFailure }

/**
 * Whether `X-User-Id` impersonation is allowed when the session guard has no user.
 * Disabled in production. In dev/test, defaults to allowed unless `ALLOW_DEV_IDENTITY_HEADERS=false`.
 */
function devHeadersAllowed(): boolean {
  if (app.inProduction) {
    return false
  }
  const flag = env.get('ALLOW_DEV_IDENTITY_HEADERS')
  if (flag === false) {
    return false
  }
  return true
}

/**
 * Resolves `ctx.currentUser` for `/api/v1/*` routes behind `devIdentity` middleware.
 *
 * 1. **Session (web guard)** — email/password login; primary identity for the app.
 * 2. **Dev fallback** — `X-User-Id` when allowed (local/staging), for tooling only.
 */
export async function resolveRequestActor(ctx: HttpContext): Promise<ResolveActorResult> {
  await ctx.auth.use('web').check()
  const guard = ctx.auth.use('web')
  if (guard.isAuthenticated && guard.user) {
    return { ok: true, user: guard.user as User }
  }

  if (!devHeadersAllowed()) {
    return {
      ok: false,
      failure: { status: 401, message: 'Sign in required' },
    }
  }

  const raw = ctx.request.header('x-user-id')
  const id = raw !== undefined && raw !== '' ? Number(raw) : 1
  if (!Number.isInteger(id) || id < 1) {
    return {
      ok: false,
      failure: { status: 400, message: 'Invalid X-User-Id header' },
    }
  }

  const user = await User.find(id)
  if (!user) {
    return {
      ok: false,
      failure: { status: 401, message: 'Unknown user id' },
    }
  }

  return { ok: true, user }
}
