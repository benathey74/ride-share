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
      /** Public browse — distinct path so it never collides with `GET /trips/:id` (private detail). */
      router.get('/public-trips/:id', [controllers.PassengerTrips, 'browse'])
      router.get('/trips/:id', [controllers.PassengerTrips, 'show'])
      router.post('/trip-requests', [controllers.TripRequests, 'store'])
      router.post('/route-templates/:routeTemplateId/corridor-interest', [
        controllers.PassengerCorridorInterests,
        'store',
      ])
    })
    .prefix('/api/v1/passenger')
    .use(passengerStack)
}
