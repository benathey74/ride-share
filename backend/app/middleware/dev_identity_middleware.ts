import { resolveRequestActor } from '#auth/resolve_request_actor'
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'

/**
 * Sets `ctx.currentUser` using `resolveRequestActor` (today: `X-User-Id`, default user `1`).
 *
 * When real auth ships, either:
 * - replace this named middleware with an `authenticated` middleware that still ends by setting
 *   `ctx.currentUser` from the same `users` table, or
 * - run session/JWT verification first, then fall back to dev header only behind an explicit env flag.
 *
 * Downstream middleware (`suspended`, `admin`, `driver`) and controllers stay unchanged.
 */
export default class DevIdentityMiddleware {
  async handle(ctx: HttpContext, next: NextFn) {
    const result = await resolveRequestActor(ctx)
    if (!result.ok) {
      const { status, message } = result.failure
      if (status === 400) {
        return ctx.response.badRequest({ message })
      }
      return ctx.response.unauthorized({ message })
    }

    ctx.currentUser = result.user
    return next()
  }
}
