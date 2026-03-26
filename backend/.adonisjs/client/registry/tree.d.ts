/* eslint-disable prettier/prettier */
import type { routes } from './index.ts'

export interface ApiDefinition {
  authRegisters: {
    store: typeof routes['auth_registers.store']
  }
  authSessions: {
    login: typeof routes['auth_sessions.login']
    logout: typeof routes['auth_sessions.logout']
    me: typeof routes['auth_sessions.me']
  }
  passengerHome: {
    index: typeof routes['passenger_home.index']
  }
  passengerMyTrips: {
    index: typeof routes['passenger_my_trips.index']
  }
  passengerRouteSuggestions: {
    index: typeof routes['passenger_route_suggestions.index']
  }
  passengerTrips: {
    browse: typeof routes['passenger_trips.browse']
    show: typeof routes['passenger_trips.show']
  }
  tripRequests: {
    store: typeof routes['trip_requests.store']
  }
  passengerCorridorInterests: {
    store: typeof routes['passenger_corridor_interests.store']
  }
  driverDashboard: {
    index: typeof routes['driver_dashboard.index']
  }
  driverRouteTemplates: {
    store: typeof routes['driver_route_templates.store']
    index: typeof routes['driver_route_templates.index']
  }
  driverTripRequests: {
    listForTrip: typeof routes['driver_trip_requests.list_for_trip']
    accept: typeof routes['driver_trip_requests.accept']
    decline: typeof routes['driver_trip_requests.decline']
  }
  driverTripPassengers: {
    cancel: typeof routes['driver_trip_passengers.cancel']
  }
  profile: {
    show: typeof routes['profile.show']
    update: typeof routes['profile.update']
    updatePublic: typeof routes['profile.update_public']
    putPassenger: typeof routes['profile.put_passenger']
    putDriver: typeof routes['profile.put_driver']
  }
  onboarding: {
    show: typeof routes['onboarding.show']
    savedPlacesIndex: typeof routes['onboarding.saved_places_index']
    savedPlacesReplace: typeof routes['onboarding.saved_places_replace']
  }
  adminModeration: {
    dashboard: typeof routes['admin_moderation.dashboard']
    users: typeof routes['admin_moderation.users']
    reports: typeof routes['admin_moderation.reports']
    suspendUser: typeof routes['admin_moderation.suspend_user']
    revokeDriver: typeof routes['admin_moderation.revoke_driver']
    approveDriver: typeof routes['admin_moderation.approve_driver']
    rejectDriver: typeof routes['admin_moderation.reject_driver']
  }
  chatMessages: {
    index: typeof routes['chat_messages.index']
    store: typeof routes['chat_messages.store']
  }
}
