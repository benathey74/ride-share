/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
*/

import router from '@adonisjs/core/services/router'
import { registerAuthRoutes } from '#start/routes/auth'
import { registerAdminRoutes } from '#start/routes/admin'
import { registerChatRoutes } from '#start/routes/chat'
import { registerDriverRoutes } from '#start/routes/driver'
import { registerPassengerRoutes } from '#start/routes/passenger'
import { registerProfileRoutes } from '#start/routes/profile'
import { registerTripsRoutes } from '#start/routes/trips'

/** Liveness probe for frontends / load balancers (no auth, no `data` wrapper). */
router.get('/health', () => {
  return { ok: true, service: 'ride-share-api' }
})

router.get('/', () => {
  return {
    name: 'ride-share-api',
    version: '1',
    identity: 'Sign in via POST /api/v1/auth/login (session cookie). Dev-only X-User-Id when allowed.',
  }
})

registerAuthRoutes()
registerPassengerRoutes()
registerDriverRoutes()
registerProfileRoutes()
registerAdminRoutes()
registerChatRoutes()
registerTripsRoutes()
