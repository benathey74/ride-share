/* eslint-disable prettier/prettier */
import type { AdonisEndpoint } from '@tuyau/core/types'
import type { Registry } from './schema.d.ts'
import type { ApiDefinition } from './tree.d.ts'

const placeholder: any = {}

const routes = {
  'auth_registers.store': {
    methods: ["POST"],
    pattern: '/api/v1/auth/register',
    tokens: [{"old":"/api/v1/auth/register","type":0,"val":"api","end":""},{"old":"/api/v1/auth/register","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/register","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/register","type":0,"val":"register","end":""}],
    types: placeholder as Registry['auth_registers.store']['types'],
  },
  'auth_sessions.login': {
    methods: ["POST"],
    pattern: '/api/v1/auth/login',
    tokens: [{"old":"/api/v1/auth/login","type":0,"val":"api","end":""},{"old":"/api/v1/auth/login","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/login","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/login","type":0,"val":"login","end":""}],
    types: placeholder as Registry['auth_sessions.login']['types'],
  },
  'auth_sessions.logout': {
    methods: ["POST"],
    pattern: '/api/v1/auth/logout',
    tokens: [{"old":"/api/v1/auth/logout","type":0,"val":"api","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/logout","type":0,"val":"logout","end":""}],
    types: placeholder as Registry['auth_sessions.logout']['types'],
  },
  'auth_sessions.me': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/auth/me',
    tokens: [{"old":"/api/v1/auth/me","type":0,"val":"api","end":""},{"old":"/api/v1/auth/me","type":0,"val":"v1","end":""},{"old":"/api/v1/auth/me","type":0,"val":"auth","end":""},{"old":"/api/v1/auth/me","type":0,"val":"me","end":""}],
    types: placeholder as Registry['auth_sessions.me']['types'],
  },
  'passenger_home.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/passenger/home',
    tokens: [{"old":"/api/v1/passenger/home","type":0,"val":"api","end":""},{"old":"/api/v1/passenger/home","type":0,"val":"v1","end":""},{"old":"/api/v1/passenger/home","type":0,"val":"passenger","end":""},{"old":"/api/v1/passenger/home","type":0,"val":"home","end":""}],
    types: placeholder as Registry['passenger_home.index']['types'],
  },
  'passenger_my_trips.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/passenger/my-trips',
    tokens: [{"old":"/api/v1/passenger/my-trips","type":0,"val":"api","end":""},{"old":"/api/v1/passenger/my-trips","type":0,"val":"v1","end":""},{"old":"/api/v1/passenger/my-trips","type":0,"val":"passenger","end":""},{"old":"/api/v1/passenger/my-trips","type":0,"val":"my-trips","end":""}],
    types: placeholder as Registry['passenger_my_trips.index']['types'],
  },
  'passenger_route_suggestions.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/passenger/routes/suggestions',
    tokens: [{"old":"/api/v1/passenger/routes/suggestions","type":0,"val":"api","end":""},{"old":"/api/v1/passenger/routes/suggestions","type":0,"val":"v1","end":""},{"old":"/api/v1/passenger/routes/suggestions","type":0,"val":"passenger","end":""},{"old":"/api/v1/passenger/routes/suggestions","type":0,"val":"routes","end":""},{"old":"/api/v1/passenger/routes/suggestions","type":0,"val":"suggestions","end":""}],
    types: placeholder as Registry['passenger_route_suggestions.index']['types'],
  },
  'passenger_trips.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/passenger/trips/:id',
    tokens: [{"old":"/api/v1/passenger/trips/:id","type":0,"val":"api","end":""},{"old":"/api/v1/passenger/trips/:id","type":0,"val":"v1","end":""},{"old":"/api/v1/passenger/trips/:id","type":0,"val":"passenger","end":""},{"old":"/api/v1/passenger/trips/:id","type":0,"val":"trips","end":""},{"old":"/api/v1/passenger/trips/:id","type":1,"val":"id","end":""}],
    types: placeholder as Registry['passenger_trips.show']['types'],
  },
  'trip_requests.store': {
    methods: ["POST"],
    pattern: '/api/v1/passenger/trip-requests',
    tokens: [{"old":"/api/v1/passenger/trip-requests","type":0,"val":"api","end":""},{"old":"/api/v1/passenger/trip-requests","type":0,"val":"v1","end":""},{"old":"/api/v1/passenger/trip-requests","type":0,"val":"passenger","end":""},{"old":"/api/v1/passenger/trip-requests","type":0,"val":"trip-requests","end":""}],
    types: placeholder as Registry['trip_requests.store']['types'],
  },
  'driver_dashboard.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/driver/dashboard',
    tokens: [{"old":"/api/v1/driver/dashboard","type":0,"val":"api","end":""},{"old":"/api/v1/driver/dashboard","type":0,"val":"v1","end":""},{"old":"/api/v1/driver/dashboard","type":0,"val":"driver","end":""},{"old":"/api/v1/driver/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['driver_dashboard.index']['types'],
  },
  'driver_route_templates.store': {
    methods: ["POST"],
    pattern: '/api/v1/driver/route-templates',
    tokens: [{"old":"/api/v1/driver/route-templates","type":0,"val":"api","end":""},{"old":"/api/v1/driver/route-templates","type":0,"val":"v1","end":""},{"old":"/api/v1/driver/route-templates","type":0,"val":"driver","end":""},{"old":"/api/v1/driver/route-templates","type":0,"val":"route-templates","end":""}],
    types: placeholder as Registry['driver_route_templates.store']['types'],
  },
  'driver_route_templates.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/driver/route-templates',
    tokens: [{"old":"/api/v1/driver/route-templates","type":0,"val":"api","end":""},{"old":"/api/v1/driver/route-templates","type":0,"val":"v1","end":""},{"old":"/api/v1/driver/route-templates","type":0,"val":"driver","end":""},{"old":"/api/v1/driver/route-templates","type":0,"val":"route-templates","end":""}],
    types: placeholder as Registry['driver_route_templates.index']['types'],
  },
  'driver_trip_requests.list_for_trip': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/driver/trip-instances/:id/requests',
    tokens: [{"old":"/api/v1/driver/trip-instances/:id/requests","type":0,"val":"api","end":""},{"old":"/api/v1/driver/trip-instances/:id/requests","type":0,"val":"v1","end":""},{"old":"/api/v1/driver/trip-instances/:id/requests","type":0,"val":"driver","end":""},{"old":"/api/v1/driver/trip-instances/:id/requests","type":0,"val":"trip-instances","end":""},{"old":"/api/v1/driver/trip-instances/:id/requests","type":1,"val":"id","end":""},{"old":"/api/v1/driver/trip-instances/:id/requests","type":0,"val":"requests","end":""}],
    types: placeholder as Registry['driver_trip_requests.list_for_trip']['types'],
  },
  'driver_trip_requests.accept': {
    methods: ["POST"],
    pattern: '/api/v1/driver/trip-requests/:id/accept',
    tokens: [{"old":"/api/v1/driver/trip-requests/:id/accept","type":0,"val":"api","end":""},{"old":"/api/v1/driver/trip-requests/:id/accept","type":0,"val":"v1","end":""},{"old":"/api/v1/driver/trip-requests/:id/accept","type":0,"val":"driver","end":""},{"old":"/api/v1/driver/trip-requests/:id/accept","type":0,"val":"trip-requests","end":""},{"old":"/api/v1/driver/trip-requests/:id/accept","type":1,"val":"id","end":""},{"old":"/api/v1/driver/trip-requests/:id/accept","type":0,"val":"accept","end":""}],
    types: placeholder as Registry['driver_trip_requests.accept']['types'],
  },
  'driver_trip_requests.decline': {
    methods: ["POST"],
    pattern: '/api/v1/driver/trip-requests/:id/decline',
    tokens: [{"old":"/api/v1/driver/trip-requests/:id/decline","type":0,"val":"api","end":""},{"old":"/api/v1/driver/trip-requests/:id/decline","type":0,"val":"v1","end":""},{"old":"/api/v1/driver/trip-requests/:id/decline","type":0,"val":"driver","end":""},{"old":"/api/v1/driver/trip-requests/:id/decline","type":0,"val":"trip-requests","end":""},{"old":"/api/v1/driver/trip-requests/:id/decline","type":1,"val":"id","end":""},{"old":"/api/v1/driver/trip-requests/:id/decline","type":0,"val":"decline","end":""}],
    types: placeholder as Registry['driver_trip_requests.decline']['types'],
  },
  'driver_trip_passengers.cancel': {
    methods: ["POST"],
    pattern: '/api/v1/driver/trip-passengers/:id/cancel',
    tokens: [{"old":"/api/v1/driver/trip-passengers/:id/cancel","type":0,"val":"api","end":""},{"old":"/api/v1/driver/trip-passengers/:id/cancel","type":0,"val":"v1","end":""},{"old":"/api/v1/driver/trip-passengers/:id/cancel","type":0,"val":"driver","end":""},{"old":"/api/v1/driver/trip-passengers/:id/cancel","type":0,"val":"trip-passengers","end":""},{"old":"/api/v1/driver/trip-passengers/:id/cancel","type":1,"val":"id","end":""},{"old":"/api/v1/driver/trip-passengers/:id/cancel","type":0,"val":"cancel","end":""}],
    types: placeholder as Registry['driver_trip_passengers.cancel']['types'],
  },
  'profile.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/me/profile',
    tokens: [{"old":"/api/v1/me/profile","type":0,"val":"api","end":""},{"old":"/api/v1/me/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/me/profile","type":0,"val":"me","end":""},{"old":"/api/v1/me/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.show']['types'],
  },
  'profile.update': {
    methods: ["PATCH"],
    pattern: '/api/v1/me/profile',
    tokens: [{"old":"/api/v1/me/profile","type":0,"val":"api","end":""},{"old":"/api/v1/me/profile","type":0,"val":"v1","end":""},{"old":"/api/v1/me/profile","type":0,"val":"me","end":""},{"old":"/api/v1/me/profile","type":0,"val":"profile","end":""}],
    types: placeholder as Registry['profile.update']['types'],
  },
  'profile.update_public': {
    methods: ["PATCH"],
    pattern: '/api/v1/me/public-profile',
    tokens: [{"old":"/api/v1/me/public-profile","type":0,"val":"api","end":""},{"old":"/api/v1/me/public-profile","type":0,"val":"v1","end":""},{"old":"/api/v1/me/public-profile","type":0,"val":"me","end":""},{"old":"/api/v1/me/public-profile","type":0,"val":"public-profile","end":""}],
    types: placeholder as Registry['profile.update_public']['types'],
  },
  'onboarding.show': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/me/onboarding',
    tokens: [{"old":"/api/v1/me/onboarding","type":0,"val":"api","end":""},{"old":"/api/v1/me/onboarding","type":0,"val":"v1","end":""},{"old":"/api/v1/me/onboarding","type":0,"val":"me","end":""},{"old":"/api/v1/me/onboarding","type":0,"val":"onboarding","end":""}],
    types: placeholder as Registry['onboarding.show']['types'],
  },
  'onboarding.saved_places_index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/me/saved-places',
    tokens: [{"old":"/api/v1/me/saved-places","type":0,"val":"api","end":""},{"old":"/api/v1/me/saved-places","type":0,"val":"v1","end":""},{"old":"/api/v1/me/saved-places","type":0,"val":"me","end":""},{"old":"/api/v1/me/saved-places","type":0,"val":"saved-places","end":""}],
    types: placeholder as Registry['onboarding.saved_places_index']['types'],
  },
  'onboarding.saved_places_replace': {
    methods: ["PUT"],
    pattern: '/api/v1/me/saved-places',
    tokens: [{"old":"/api/v1/me/saved-places","type":0,"val":"api","end":""},{"old":"/api/v1/me/saved-places","type":0,"val":"v1","end":""},{"old":"/api/v1/me/saved-places","type":0,"val":"me","end":""},{"old":"/api/v1/me/saved-places","type":0,"val":"saved-places","end":""}],
    types: placeholder as Registry['onboarding.saved_places_replace']['types'],
  },
  'profile.put_passenger': {
    methods: ["PUT"],
    pattern: '/api/v1/me/passenger-profile',
    tokens: [{"old":"/api/v1/me/passenger-profile","type":0,"val":"api","end":""},{"old":"/api/v1/me/passenger-profile","type":0,"val":"v1","end":""},{"old":"/api/v1/me/passenger-profile","type":0,"val":"me","end":""},{"old":"/api/v1/me/passenger-profile","type":0,"val":"passenger-profile","end":""}],
    types: placeholder as Registry['profile.put_passenger']['types'],
  },
  'profile.put_driver': {
    methods: ["PUT"],
    pattern: '/api/v1/me/driver-profile',
    tokens: [{"old":"/api/v1/me/driver-profile","type":0,"val":"api","end":""},{"old":"/api/v1/me/driver-profile","type":0,"val":"v1","end":""},{"old":"/api/v1/me/driver-profile","type":0,"val":"me","end":""},{"old":"/api/v1/me/driver-profile","type":0,"val":"driver-profile","end":""}],
    types: placeholder as Registry['profile.put_driver']['types'],
  },
  'admin_moderation.dashboard': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/dashboard',
    tokens: [{"old":"/api/v1/admin/dashboard","type":0,"val":"api","end":""},{"old":"/api/v1/admin/dashboard","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/dashboard","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/dashboard","type":0,"val":"dashboard","end":""}],
    types: placeholder as Registry['admin_moderation.dashboard']['types'],
  },
  'admin_moderation.users': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/users',
    tokens: [{"old":"/api/v1/admin/users","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users","type":0,"val":"users","end":""}],
    types: placeholder as Registry['admin_moderation.users']['types'],
  },
  'admin_moderation.reports': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/admin/reports',
    tokens: [{"old":"/api/v1/admin/reports","type":0,"val":"api","end":""},{"old":"/api/v1/admin/reports","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/reports","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/reports","type":0,"val":"reports","end":""}],
    types: placeholder as Registry['admin_moderation.reports']['types'],
  },
  'admin_moderation.suspend_user': {
    methods: ["POST"],
    pattern: '/api/v1/admin/users/:id/suspend',
    tokens: [{"old":"/api/v1/admin/users/:id/suspend","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users/:id/suspend","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users/:id/suspend","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users/:id/suspend","type":0,"val":"users","end":""},{"old":"/api/v1/admin/users/:id/suspend","type":1,"val":"id","end":""},{"old":"/api/v1/admin/users/:id/suspend","type":0,"val":"suspend","end":""}],
    types: placeholder as Registry['admin_moderation.suspend_user']['types'],
  },
  'admin_moderation.revoke_driver': {
    methods: ["POST"],
    pattern: '/api/v1/admin/users/:id/revoke-driver',
    tokens: [{"old":"/api/v1/admin/users/:id/revoke-driver","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users/:id/revoke-driver","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users/:id/revoke-driver","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users/:id/revoke-driver","type":0,"val":"users","end":""},{"old":"/api/v1/admin/users/:id/revoke-driver","type":1,"val":"id","end":""},{"old":"/api/v1/admin/users/:id/revoke-driver","type":0,"val":"revoke-driver","end":""}],
    types: placeholder as Registry['admin_moderation.revoke_driver']['types'],
  },
  'admin_moderation.approve_driver': {
    methods: ["POST"],
    pattern: '/api/v1/admin/users/:id/approve-driver',
    tokens: [{"old":"/api/v1/admin/users/:id/approve-driver","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users/:id/approve-driver","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users/:id/approve-driver","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users/:id/approve-driver","type":0,"val":"users","end":""},{"old":"/api/v1/admin/users/:id/approve-driver","type":1,"val":"id","end":""},{"old":"/api/v1/admin/users/:id/approve-driver","type":0,"val":"approve-driver","end":""}],
    types: placeholder as Registry['admin_moderation.approve_driver']['types'],
  },
  'admin_moderation.reject_driver': {
    methods: ["POST"],
    pattern: '/api/v1/admin/users/:id/reject-driver',
    tokens: [{"old":"/api/v1/admin/users/:id/reject-driver","type":0,"val":"api","end":""},{"old":"/api/v1/admin/users/:id/reject-driver","type":0,"val":"v1","end":""},{"old":"/api/v1/admin/users/:id/reject-driver","type":0,"val":"admin","end":""},{"old":"/api/v1/admin/users/:id/reject-driver","type":0,"val":"users","end":""},{"old":"/api/v1/admin/users/:id/reject-driver","type":1,"val":"id","end":""},{"old":"/api/v1/admin/users/:id/reject-driver","type":0,"val":"reject-driver","end":""}],
    types: placeholder as Registry['admin_moderation.reject_driver']['types'],
  },
  'chat_messages.index': {
    methods: ["GET","HEAD"],
    pattern: '/api/v1/chat/trips/:tripId/messages',
    tokens: [{"old":"/api/v1/chat/trips/:tripId/messages","type":0,"val":"api","end":""},{"old":"/api/v1/chat/trips/:tripId/messages","type":0,"val":"v1","end":""},{"old":"/api/v1/chat/trips/:tripId/messages","type":0,"val":"chat","end":""},{"old":"/api/v1/chat/trips/:tripId/messages","type":0,"val":"trips","end":""},{"old":"/api/v1/chat/trips/:tripId/messages","type":1,"val":"tripId","end":""},{"old":"/api/v1/chat/trips/:tripId/messages","type":0,"val":"messages","end":""}],
    types: placeholder as Registry['chat_messages.index']['types'],
  },
  'chat_messages.store': {
    methods: ["POST"],
    pattern: '/api/v1/chat/trips/:tripId/messages',
    tokens: [{"old":"/api/v1/chat/trips/:tripId/messages","type":0,"val":"api","end":""},{"old":"/api/v1/chat/trips/:tripId/messages","type":0,"val":"v1","end":""},{"old":"/api/v1/chat/trips/:tripId/messages","type":0,"val":"chat","end":""},{"old":"/api/v1/chat/trips/:tripId/messages","type":0,"val":"trips","end":""},{"old":"/api/v1/chat/trips/:tripId/messages","type":1,"val":"tripId","end":""},{"old":"/api/v1/chat/trips/:tripId/messages","type":0,"val":"messages","end":""}],
    types: placeholder as Registry['chat_messages.store']['types'],
  },
} as const satisfies Record<string, AdonisEndpoint>

export { routes }

export const registry = {
  routes,
  $tree: {} as ApiDefinition,
}

declare module '@tuyau/core/types' {
  export interface UserRegistry {
    routes: typeof routes
    $tree: ApiDefinition
  }
}
