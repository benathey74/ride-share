import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

/**
 * Email/password auth — no `devIdentity` middleware (session is established here).
 */
export function registerAuthRoutes() {
  router
    .group(() => {
      router.post('/register', [controllers.AuthRegisters, 'store'])
      router.post('/login', [controllers.AuthSessions, 'login'])
      router.post('/logout', [controllers.AuthSessions, 'logout'])
      router.get('/me', [controllers.AuthSessions, 'me'])
    })
    .prefix('/api/v1/auth')
}
