import '@adonisjs/core/types/http'

type ParamValue = string | number | bigint | boolean

export type ScannedRoutes = {
  ALL: {
    'auth_registers.store': { paramsTuple?: []; params?: {} }
    'auth_sessions.login': { paramsTuple?: []; params?: {} }
    'auth_sessions.logout': { paramsTuple?: []; params?: {} }
    'auth_sessions.me': { paramsTuple?: []; params?: {} }
    'passenger_home.index': { paramsTuple?: []; params?: {} }
    'passenger_my_trips.index': { paramsTuple?: []; params?: {} }
    'passenger_route_suggestions.index': { paramsTuple?: []; params?: {} }
    'passenger_trips.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'trip_requests.store': { paramsTuple?: []; params?: {} }
    'driver_dashboard.index': { paramsTuple?: []; params?: {} }
    'driver_route_templates.store': { paramsTuple?: []; params?: {} }
    'driver_route_templates.index': { paramsTuple?: []; params?: {} }
    'driver_trip_requests.list_for_trip': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'driver_trip_requests.accept': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'driver_trip_requests.decline': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'driver_trip_passengers.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'profile.update': { paramsTuple?: []; params?: {} }
    'profile.update_public': { paramsTuple?: []; params?: {} }
    'onboarding.show': { paramsTuple?: []; params?: {} }
    'onboarding.saved_places_index': { paramsTuple?: []; params?: {} }
    'onboarding.saved_places_replace': { paramsTuple?: []; params?: {} }
    'profile.put_passenger': { paramsTuple?: []; params?: {} }
    'profile.put_driver': { paramsTuple?: []; params?: {} }
    'admin_moderation.dashboard': { paramsTuple?: []; params?: {} }
    'admin_moderation.users': { paramsTuple?: []; params?: {} }
    'admin_moderation.reports': { paramsTuple?: []; params?: {} }
    'admin_moderation.suspend_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_moderation.revoke_driver': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_moderation.approve_driver': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_moderation.reject_driver': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'chat_messages.index': { paramsTuple: [ParamValue]; params: {'tripId': ParamValue} }
    'chat_messages.store': { paramsTuple: [ParamValue]; params: {'tripId': ParamValue} }
  }
  GET: {
    'auth_sessions.me': { paramsTuple?: []; params?: {} }
    'passenger_home.index': { paramsTuple?: []; params?: {} }
    'passenger_my_trips.index': { paramsTuple?: []; params?: {} }
    'passenger_route_suggestions.index': { paramsTuple?: []; params?: {} }
    'passenger_trips.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'driver_dashboard.index': { paramsTuple?: []; params?: {} }
    'driver_route_templates.index': { paramsTuple?: []; params?: {} }
    'driver_trip_requests.list_for_trip': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'onboarding.show': { paramsTuple?: []; params?: {} }
    'onboarding.saved_places_index': { paramsTuple?: []; params?: {} }
    'admin_moderation.dashboard': { paramsTuple?: []; params?: {} }
    'admin_moderation.users': { paramsTuple?: []; params?: {} }
    'admin_moderation.reports': { paramsTuple?: []; params?: {} }
    'chat_messages.index': { paramsTuple: [ParamValue]; params: {'tripId': ParamValue} }
  }
  HEAD: {
    'auth_sessions.me': { paramsTuple?: []; params?: {} }
    'passenger_home.index': { paramsTuple?: []; params?: {} }
    'passenger_my_trips.index': { paramsTuple?: []; params?: {} }
    'passenger_route_suggestions.index': { paramsTuple?: []; params?: {} }
    'passenger_trips.show': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'driver_dashboard.index': { paramsTuple?: []; params?: {} }
    'driver_route_templates.index': { paramsTuple?: []; params?: {} }
    'driver_trip_requests.list_for_trip': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'profile.show': { paramsTuple?: []; params?: {} }
    'onboarding.show': { paramsTuple?: []; params?: {} }
    'onboarding.saved_places_index': { paramsTuple?: []; params?: {} }
    'admin_moderation.dashboard': { paramsTuple?: []; params?: {} }
    'admin_moderation.users': { paramsTuple?: []; params?: {} }
    'admin_moderation.reports': { paramsTuple?: []; params?: {} }
    'chat_messages.index': { paramsTuple: [ParamValue]; params: {'tripId': ParamValue} }
  }
  POST: {
    'auth_registers.store': { paramsTuple?: []; params?: {} }
    'auth_sessions.login': { paramsTuple?: []; params?: {} }
    'auth_sessions.logout': { paramsTuple?: []; params?: {} }
    'trip_requests.store': { paramsTuple?: []; params?: {} }
    'driver_route_templates.store': { paramsTuple?: []; params?: {} }
    'driver_trip_requests.accept': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'driver_trip_requests.decline': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'driver_trip_passengers.cancel': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_moderation.suspend_user': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_moderation.revoke_driver': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_moderation.approve_driver': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'admin_moderation.reject_driver': { paramsTuple: [ParamValue]; params: {'id': ParamValue} }
    'chat_messages.store': { paramsTuple: [ParamValue]; params: {'tripId': ParamValue} }
  }
  PATCH: {
    'profile.update': { paramsTuple?: []; params?: {} }
    'profile.update_public': { paramsTuple?: []; params?: {} }
  }
  PUT: {
    'onboarding.saved_places_replace': { paramsTuple?: []; params?: {} }
    'profile.put_passenger': { paramsTuple?: []; params?: {} }
    'profile.put_driver': { paramsTuple?: []; params?: {} }
  }
}
declare module '@adonisjs/core/types/http' {
  export interface RoutesList extends ScannedRoutes {}
}