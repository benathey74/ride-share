/* eslint-disable prettier/prettier */
/// <reference path="../manifest.d.ts" />

import type { ExtractBody, ExtractErrorResponse, ExtractQuery, ExtractQueryForGet, ExtractResponse } from '@tuyau/core/types'
import type { InferInput, SimpleError } from '@vinejs/vine/types'

export type ParamValue = string | number | bigint | boolean

export interface Registry {
  'auth_registers.store': {
    methods: ["POST"]
    pattern: '/api/v1/auth/register'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth_register_validator').authRegisterValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth_register_validator').authRegisterValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_registers_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_registers_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth_sessions.login': {
    methods: ["POST"]
    pattern: '/api/v1/auth/login'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/auth_login_validator').authLoginValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/auth_login_validator').authLoginValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_sessions_controller').default['login']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_sessions_controller').default['login']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'auth_sessions.logout': {
    methods: ["POST"]
    pattern: '/api/v1/auth/logout'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_sessions_controller').default['logout']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_sessions_controller').default['logout']>>>
    }
  }
  'auth_sessions.me': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/auth/me'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/auth_sessions_controller').default['me']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/auth_sessions_controller').default['me']>>>
    }
  }
  'passenger_home.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/passenger/home'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/passenger_home_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/passenger_home_controller').default['index']>>>
    }
  }
  'passenger_my_trips.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/passenger/my-trips'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/passenger_my_trips_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/passenger_my_trips_controller').default['index']>>>
    }
  }
  'passenger_route_suggestions.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/passenger/routes/suggestions'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/passenger_route_suggestions_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/passenger_route_suggestions_controller').default['index']>>>
    }
  }
  'passenger_trips.browse': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/passenger/public-trips/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/passenger_trips_controller').default['browse']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/passenger_trips_controller').default['browse']>>>
    }
  }
  'passenger_trips.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/passenger/trips/:id'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/passenger_trips_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/passenger_trips_controller').default['show']>>>
    }
  }
  'trip_requests.store': {
    methods: ["POST"]
    pattern: '/api/v1/passenger/trip-requests'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/passenger_trip_request_validator').createTripRequestValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/passenger_trip_request_validator').createTripRequestValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/trip_requests_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/trip_requests_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'passenger_corridor_interests.store': {
    methods: ["POST"]
    pattern: '/api/v1/passenger/route-templates/:routeTemplateId/corridor-interest'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/corridor_interest_validator').expressCorridorInterestValidator)>>
      paramsTuple: [ParamValue]
      params: { routeTemplateId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/corridor_interest_validator').expressCorridorInterestValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/passenger_corridor_interests_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/passenger_corridor_interests_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'driver_dashboard.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/driver/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/driver_dashboard_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/driver_dashboard_controller').default['index']>>>
    }
  }
  'driver_route_templates.store': {
    methods: ["POST"]
    pattern: '/api/v1/driver/route-templates'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/create_route_template_validator').createRouteTemplateValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/create_route_template_validator').createRouteTemplateValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/driver_route_templates_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/driver_route_templates_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'driver_route_templates.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/driver/route-templates'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/driver_route_templates_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/driver_route_templates_controller').default['index']>>>
    }
  }
  'driver_trip_requests.list_for_trip': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/driver/trip-instances/:id/requests'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/driver_trip_requests_controller').default['listForTrip']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/driver_trip_requests_controller').default['listForTrip']>>>
    }
  }
  'driver_trip_requests.accept': {
    methods: ["POST"]
    pattern: '/api/v1/driver/trip-requests/:id/accept'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/driver_trip_requests_controller').default['accept']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/driver_trip_requests_controller').default['accept']>>>
    }
  }
  'driver_trip_requests.decline': {
    methods: ["POST"]
    pattern: '/api/v1/driver/trip-requests/:id/decline'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/driver_trip_requests_controller').default['decline']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/driver_trip_requests_controller').default['decline']>>>
    }
  }
  'driver_trip_passengers.cancel': {
    methods: ["POST"]
    pattern: '/api/v1/driver/trip-passengers/:id/cancel'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/driver_trip_passengers_controller').default['cancel']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/driver_trip_passengers_controller').default['cancel']>>>
    }
  }
  'profile.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/me/profile'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['show']>>>
    }
  }
  'profile.update': {
    methods: ["PATCH"]
    pattern: '/api/v1/me/profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/me_profile_validators').patchMeProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/me_profile_validators').patchMeProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['update']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['update']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.update_public': {
    methods: ["PATCH"]
    pattern: '/api/v1/me/public-profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/me_profile_validators').patchMePublicProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/me_profile_validators').patchMePublicProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['updatePublic']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['updatePublic']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'onboarding.show': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/me/onboarding'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/onboarding_controller').default['show']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/onboarding_controller').default['show']>>>
    }
  }
  'onboarding.saved_places_index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/me/saved-places'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/onboarding_controller').default['savedPlacesIndex']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/onboarding_controller').default['savedPlacesIndex']>>>
    }
  }
  'onboarding.saved_places_replace': {
    methods: ["PUT"]
    pattern: '/api/v1/me/saved-places'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/me_onboarding_validators').putMeSavedPlacesValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/me_onboarding_validators').putMeSavedPlacesValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/onboarding_controller').default['savedPlacesReplace']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/onboarding_controller').default['savedPlacesReplace']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.put_passenger': {
    methods: ["PUT"]
    pattern: '/api/v1/me/passenger-profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/me_onboarding_validators').putMePassengerProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/me_onboarding_validators').putMePassengerProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['putPassenger']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['putPassenger']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'profile.put_driver': {
    methods: ["PUT"]
    pattern: '/api/v1/me/driver-profile'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/me_onboarding_validators').putMeDriverProfileValidator)>>
      paramsTuple: []
      params: {}
      query: ExtractQuery<InferInput<(typeof import('#validators/me_onboarding_validators').putMeDriverProfileValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['putDriver']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/profile_controller').default['putDriver']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_moderation.dashboard': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/dashboard'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_moderation_controller').default['dashboard']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_moderation_controller').default['dashboard']>>>
    }
  }
  'admin_moderation.users': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/users'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_moderation_controller').default['users']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_moderation_controller').default['users']>>>
    }
  }
  'admin_moderation.reports': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/admin/reports'
    types: {
      body: {}
      paramsTuple: []
      params: {}
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_moderation_controller').default['reports']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_moderation_controller').default['reports']>>>
    }
  }
  'admin_moderation.suspend_user': {
    methods: ["POST"]
    pattern: '/api/v1/admin/users/:id/suspend'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_optional_reason_validator').adminOptionalReasonValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_optional_reason_validator').adminOptionalReasonValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_moderation_controller').default['suspendUser']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_moderation_controller').default['suspendUser']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_moderation.revoke_driver': {
    methods: ["POST"]
    pattern: '/api/v1/admin/users/:id/revoke-driver'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_optional_reason_validator').adminOptionalReasonValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_optional_reason_validator').adminOptionalReasonValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_moderation_controller').default['revokeDriver']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_moderation_controller').default['revokeDriver']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_moderation.approve_driver': {
    methods: ["POST"]
    pattern: '/api/v1/admin/users/:id/approve-driver'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_optional_reason_validator').adminOptionalReasonValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_optional_reason_validator').adminOptionalReasonValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_moderation_controller').default['approveDriver']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_moderation_controller').default['approveDriver']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'admin_moderation.reject_driver': {
    methods: ["POST"]
    pattern: '/api/v1/admin/users/:id/reject-driver'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/admin_optional_reason_validator').adminOptionalReasonValidator)>>
      paramsTuple: [ParamValue]
      params: { id: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/admin_optional_reason_validator').adminOptionalReasonValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/admin_moderation_controller').default['rejectDriver']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/admin_moderation_controller').default['rejectDriver']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
  'chat_messages.index': {
    methods: ["GET","HEAD"]
    pattern: '/api/v1/chat/trips/:tripId/messages'
    types: {
      body: {}
      paramsTuple: [ParamValue]
      params: { tripId: ParamValue }
      query: {}
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['index']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['index']>>>
    }
  }
  'chat_messages.store': {
    methods: ["POST"]
    pattern: '/api/v1/chat/trips/:tripId/messages'
    types: {
      body: ExtractBody<InferInput<(typeof import('#validators/chat_message_validator').createChatMessageValidator)>>
      paramsTuple: [ParamValue]
      params: { tripId: ParamValue }
      query: ExtractQuery<InferInput<(typeof import('#validators/chat_message_validator').createChatMessageValidator)>>
      response: ExtractResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['store']>>>
      errorResponse: ExtractErrorResponse<Awaited<ReturnType<import('#controllers/chat_messages_controller').default['store']>>> | { status: 422; response: { errors: SimpleError[] } }
    }
  }
}
