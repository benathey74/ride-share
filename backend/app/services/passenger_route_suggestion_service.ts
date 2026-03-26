import { DateTime } from 'luxon'
import { RouteTemplateStatus, TripInstanceStatus, TripRequestStatus } from '#constants/trip'
import PassengerRouteCorridorInterest from '#models/passenger_route_corridor_interest'
import RouteTemplate from '#models/route_template'
import TripInstance from '#models/trip_instance'
import {
  computePassengerRouteCorridorMetrics,
  derivePassengerRouteMatchHints,
} from '#services/passenger_route_corridor_metrics'
import {
  DESTINATION_MATCH_M,
  MIN_PICKUP_MATCH_M,
  type PassengerRouteSearchCoords,
} from '#services/passenger_route_search_filter'
import {
  compareRankedSuggestions,
  scorePassengerRouteSuggestion,
} from '#services/passenger_route_suggestion_ranking'
import PrivacyViewService from '#services/privacy_view_service'

const privacy = new PrivacyViewService()

const HOME_COPY = {
  hero: {
    eyebrow: 'Internal rides',
    titleLine1: 'Need a lift?',
    titleLine2: 'Start here.',
    subtitle:
      'Ride as a passenger with privacy-first matching. Driving is separate — publish a route only when you are ready to host.',
  },
  searchSectionDescription:
    'Looking for a ride? Search matches your pickup and destination to driver corridors. Exact pickup stays hidden until you are accepted.',
  nextPickupSectionTitle: 'Your trip status',
  routesSectionDescription: 'Corridors published near you — browse below, or search when you know your trip.',
  privacyFootnote: 'Exact pin unlocks after a driver accepts you.',
} as const

export default class PassengerRouteSuggestionService {
  /**
   * When `search` is set (all four coordinates in query), returns templates whose corridor
   * endpoints are within pickup/destination distance thresholds. When `search` is null,
   * returns every active template (legacy behavior).
   */
  async listSuggestions(
    search: PassengerRouteSearchCoords | null = null,
    viewerUserId?: number
  ) {
    let templates = await RouteTemplate.query()
      .where('status', RouteTemplateStatus.ACTIVE)
      .preload('driver', (q) => q.preload('publicProfile'))
      .preload('schedules')

    const corridorMetricsByTemplateId = new Map<
      number,
      ReturnType<typeof computePassengerRouteCorridorMetrics>
    >()

    if (search) {
      const kept: RouteTemplate[] = []
      for (const t of templates) {
        const m = computePassengerRouteCorridorMetrics(t, search)
        const pickupAllowM = Math.max(privacy.templatePickupRadiusMeters(t), MIN_PICKUP_MATCH_M)
        if (m.pickupEffectiveM <= pickupAllowM && m.destEffectiveM <= DESTINATION_MATCH_M) {
          corridorMetricsByTemplateId.set(t.id, m)
          kept.push(t)
        }
      }
      templates = kept
    }

    const corridorInterestByTemplateId = new Map<
      number,
      { message: string | null; updatedAt: string }
    >()
    if (viewerUserId && templates.length > 0) {
      const templateIds = templates.map((t) => t.id)
      const rows = await PassengerRouteCorridorInterest.query()
        .where('rider_user_id', viewerUserId)
        .whereIn('route_template_id', templateIds)
        .orderBy('updated_at', 'desc')
      for (const row of rows) {
        if (corridorInterestByTemplateId.has(row.routeTemplateId)) continue
        const updated = row.updatedAt ?? row.createdAt
        corridorInterestByTemplateId.set(row.routeTemplateId, {
          message: row.message,
          updatedAt: updated.toISO() ?? '',
        })
      }
    }

    const today = DateTime.utc().startOf('day').toISODate()!
    const now = DateTime.utc()

    const ranked = await Promise.all(
      templates.map(async (template) => {
        const nextTrip = await TripInstance.query()
          .where('route_template_id', template.id)
          .whereNotIn('route_status', [TripInstanceStatus.COMPLETED, TripInstanceStatus.CANCELLED])
          .where('seats_remaining', '>', 0)
          .where('trip_date', '>=', today)
          .orderBy('trip_date', 'asc')
          .orderBy('departure_time', 'asc')
          .first()

        const corridorPickupR = privacy.templatePickupRadiusMeters(template)
        const pickupAllowM = Math.max(corridorPickupR, MIN_PICKUP_MATCH_M)
        const corridorMetrics = search
          ? (corridorMetricsByTemplateId.get(template.id) ?? null)
          : null
        const score = scorePassengerRouteSuggestion({
          template,
          search,
          nextTrip,
          now,
          pickupAllowMeters: pickupAllowM,
          destinationMatchMaxMeters: DESTINATION_MATCH_M,
          corridorPickupRadiusMeters: corridorPickupR,
          corridorMetrics,
        })

        const matchHints =
          search && corridorMetrics
            ? derivePassengerRouteMatchHints(corridorMetrics, corridorPickupR)
            : []

        const departureWindowLabel = privacy.templateDepartureWindowLabel(
          template.scheduleType,
          template.departureTime
        )
        const row = {
          ...privacy.shapeRouteSuggestionRow({
            templateId: template.id,
            originLabel: template.originLabel,
            destinationLabel: template.destinationLabel,
            originLat: template.originLat,
            originLng: template.originLng,
            destinationLat: template.destinationLat,
            destinationLng: template.destinationLng,
            departureWindowLabel,
            driverPublicProfile: template.driver.publicProfile ?? null,
            pickupRadiusMeters: privacy.templatePickupRadiusMeters(template),
            routePolyline: template.routePolyline,
            totalDistanceMeters: template.totalDistanceMeters,
            totalDurationSeconds: template.totalDurationSeconds,
            matchHints: matchHints.length > 0 ? matchHints : undefined,
          }),
          schedules: template.schedules.map((s) => ({
            id: s.id,
            dayOfWeek: s.dayOfWeek,
            isActive: s.isActive,
          })),
          nextTripInstanceId: nextTrip ? String(nextTrip.id) : null,
          corridorInterest: corridorInterestByTemplateId.has(template.id)
            ? {
                hasContacted: true,
                message: corridorInterestByTemplateId.get(template.id)?.message ?? null,
                updatedAt: corridorInterestByTemplateId.get(template.id)?.updatedAt ?? '',
              }
            : null,
        }
        return { row, score, templateId: template.id }
      })
    )

    ranked.sort(compareRankedSuggestions)
    return ranked.map((r) => r.row)
  }

  async buildHome(passengerUserId: number) {
    const nearbyRoutes = await this.listSuggestions()

    const nextTrip = await TripInstance.query()
      .whereNotIn('route_status', [TripInstanceStatus.COMPLETED, TripInstanceStatus.CANCELLED])
      .where((q) => {
        q.whereHas('tripRequests', (tr) => {
          tr.where('rider_user_id', passengerUserId).whereIn('status', [
            TripRequestStatus.PENDING,
            TripRequestStatus.ACCEPTED,
          ])
        }).orWhereHas('passengers', (tp) => {
          tp.where('rider_user_id', passengerUserId).where('status', 'confirmed')
        })
      })
      .preload('routeTemplate')
      .orderBy('trip_date', 'asc')
      .orderBy('departure_time', 'asc')
      .first()

    let nextPickup: {
      tripInstanceId: string
      statusLabel: string
      pickupAreaLabel: string
      pickupFuzzRadiusM: number
      privacyFootnote: string
    }

    if (!nextTrip) {
      nextPickup = {
        tripInstanceId: '',
        statusLabel: 'No upcoming trips',
        pickupAreaLabel: '—',
        pickupFuzzRadiusM: privacy.templatePickupRadiusMeters(null),
        privacyFootnote: HOME_COPY.privacyFootnote,
      }
    } else {
      const myRequest = await nextTrip
        .related('tripRequests')
        .query()
        .where('rider_user_id', passengerUserId)
        .orderBy('created_at', 'desc')
        .first()

      const pickupLabel =
        myRequest?.approxPickupLabel ?? nextTrip.routeTemplate?.originLabel ?? 'Pickup area'
      const radius =
        myRequest?.approxPickupRadiusMeters ??
        privacy.templatePickupRadiusMeters(nextTrip.routeTemplate ?? null)

      nextPickup = {
        tripInstanceId: String(nextTrip.id),
        statusLabel: this.humanizeTripStatus(nextTrip.routeStatus, myRequest?.status),
        pickupAreaLabel: pickupLabel,
        pickupFuzzRadiusM: radius,
        privacyFootnote: HOME_COPY.privacyFootnote,
      }
    }

    return {
      ...HOME_COPY,
      nextPickup,
      nearbyRoutes,
    }
  }

  private humanizeTripStatus(routeStatus: string, requestStatus?: string) {
    if (requestStatus === TripRequestStatus.PENDING) {
      return 'Request pending'
    }
    if (requestStatus === TripRequestStatus.ACCEPTED) {
      return 'Seat confirmed'
    }
    return routeStatus.replace(/_/g, ' ')
  }
}
