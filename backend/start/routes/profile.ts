import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const profileStack = [middleware.devIdentity(), middleware.suspended()]

export function registerProfileRoutes() {
  router
    .group(() => {
      router.get('/profile', [controllers.Profile, 'show'])
      router.patch('/profile', [controllers.Profile, 'update'])
      router.patch('/public-profile', [controllers.Profile, 'updatePublic'])
      router.get('/onboarding', [controllers.Onboarding, 'show'])
      router.get('/saved-places', [controllers.Onboarding, 'savedPlacesIndex'])
      router.put('/saved-places', [controllers.Onboarding, 'savedPlacesReplace'])
      router.put('/passenger-profile', [controllers.Profile, 'putPassenger'])
      router.put('/driver-profile', [controllers.Profile, 'putDriver'])
    })
    .prefix('/api/v1/me')
    .use(profileStack)
}
