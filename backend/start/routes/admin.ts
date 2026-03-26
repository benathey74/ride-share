import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const adminStack = [middleware.devIdentity(), middleware.suspended(), middleware.admin()]

export function registerAdminRoutes() {
  router
    .group(() => {
      router.get('/dashboard', [controllers.AdminModeration, 'dashboard'])
      router.get('/users', [controllers.AdminModeration, 'users'])
      router.get('/reports', [controllers.AdminModeration, 'reports'])
      router.post('/users/:id/suspend', [controllers.AdminModeration, 'suspendUser'])
      router.post('/users/:id/revoke-driver', [controllers.AdminModeration, 'revokeDriver'])
      router.post('/users/:id/approve-driver', [controllers.AdminModeration, 'approveDriver'])
      router.post('/users/:id/reject-driver', [controllers.AdminModeration, 'rejectDriver'])
    })
    .prefix('/api/v1/admin')
    .use(adminStack)
}
