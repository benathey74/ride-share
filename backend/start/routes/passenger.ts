import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const passengerStack = [middleware.devIdentity(), middleware.suspended()]

export function registerPassengerRoutes() {
  router
    .group(() => {
      router.get('/home', [controllers.PassengerHome, 'index'])
      router.get('/my-trips', [controllers.PassengerMyTrips, 'index'])
      router.get('/routes/suggestions', [controllers.PassengerRouteSuggestions, 'index'])
      router.get('/trips/:id', [controllers.PassengerTrips, 'show'])
      router.post('/trip-requests', [controllers.TripRequests, 'store'])
    })
    .prefix('/api/v1/passenger')
    .use(passengerStack)
}
