/*
|--------------------------------------------------------------------------
| Environment variables service
|--------------------------------------------------------------------------
|
| The `Env.create` method creates an instance of the Env service. The
| service validates the environment variables and also cast values
| to JavaScript data types.
|
*/

import { Env } from '@adonisjs/core/env'

/**
 * Adonis only writes .env values into `process.env` when the key is unset. Some parent
 * processes (e.g. IDE sandboxes) export RFC 5737 TEST-NET hosts for `DB_HOST`, which
 * overrides `backend/.env` and causes ECONNREFUSED to a non-existent database.
 */
if (/^(192\.0\.2\.|198\.51\.100\.|203\.0\.113\.)/.test(process.env.DB_HOST ?? '')) {
  delete process.env.DB_HOST
}

export default await Env.create(new URL('../', import.meta.url), {
  // Node
  NODE_ENV: Env.schema.enum(['development', 'production', 'test'] as const),
  PORT: Env.schema.number(),
  HOST: Env.schema.string({ format: 'host' }),
  LOG_LEVEL: Env.schema.string(),

  // App
  APP_KEY: Env.schema.secret(),
  APP_URL: Env.schema.string({ format: 'url', tld: false }),

  // Session
  SESSION_DRIVER: Env.schema.enum(['cookie', 'memory', 'database'] as const),

  // Database (PostgreSQL)
  DB_HOST: Env.schema.string({ format: 'host' }),
  DB_PORT: Env.schema.number(),
  DB_USER: Env.schema.string(),
  DB_PASSWORD: Env.schema.string.optional(),
  DB_DATABASE: Env.schema.string(),
  /*
   * Set DB_SSL=true when connecting to managed Postgres (e.g. Neon, RDS).
   */
  DB_SSL: Env.schema.boolean.optional(),

  /**
   * Optional server key for Google Directions API — used when creating route templates to store
   * `route_polyline` + distance/duration. Not required for API startup; templates work without it.
   */
  GOOGLE_MAPS_SERVER_API_KEY: Env.schema.string.optional(),

  /**
   * When true (default in development if unset), `X-User-Id` impersonation is allowed when no session.
   * Set false to require real login for all API routes (recommended for staging closer to prod).
   */
  ALLOW_DEV_IDENTITY_HEADERS: Env.schema.boolean.optional(),
})
