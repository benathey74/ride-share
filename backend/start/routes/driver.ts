import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const driverStack = [middleware.devIdentity(), middleware.suspended(), middleware.driver()]

export function registerDriverRoutes() {
  router
    .group(() => {
      router.get('/dashboard', [controllers.DriverDashboard, 'index'])
      router.post('/route-templates', [controllers.DriverRouteTemplates, 'store'])
      router.get('/route-templates', [controllers.DriverRouteTemplates, 'index'])
      router.get('/trip-instances/:id/requests', [controllers.DriverTripRequests, 'listForTrip'])
      router.post('/trip-requests/:id/accept', [controllers.DriverTripRequests, 'accept'])
      router.post('/trip-requests/:id/decline', [controllers.DriverTripRequests, 'decline'])
      router.post('/trip-passengers/:id/cancel', [controllers.DriverTripPassengers, 'cancel'])
    })
    .prefix('/api/v1/driver')
    .use(driverStack)
}
