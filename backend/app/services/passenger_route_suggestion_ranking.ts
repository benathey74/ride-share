import { DateTime } from 'luxon'
import { TripInstanceStatus } from '#constants/trip'
import type RouteTemplate from '#models/route_template'
import type TripInstance from '#models/trip_instance'
import {
  computePassengerRouteCorridorMetrics,
  type PassengerRouteCorridorMetrics,
} from '#services/passenger_route_corridor_metrics'
import type { PassengerRouteSearchCoords } from '#services/passenger_route_search_filter'

/**
 * ## Ranking pipeline (unchanged contract)
 * 1. **Threshold filter** (`templateMatchesPassengerSearch`) — drop templates outside pickup /
 *    destination caps (uses corridor + polyline tail when `route_polyline` exists).
 * 2. **Score** — `scorePassengerRouteSuggestion` returns a single number; higher = better.
 * 3. **Sort** — descending score; tie-break `routeTemplateId` ascending.
 *
 * Scores are **never** sent to clients; only sort order changes. DTOs stay privacy-safe.
 *
 * ---
 * ## Tunable weights (edit this object only)
 *
 * Geo scores use **effective** distances: pickup = min(origin, polyline corridor); destination =
 * min(template destination, polyline tail) when a stored polyline exists.
 *
 * | Key | Default | Role |
 * |-----|--------:|------|
 * | `pickupGeo` | 125 | Search: effective pickup distance vs expanded pickup allow radius. |
 * | `pickupInsideCorridorFuzz` | 42 | Search: extra credit when effective pickup lies inside published fuzz. |
 * | `destGeo` | 125 | Search: effective destination distance vs destination cap. |
 * | `corridorPickupVersusOrigin` | 34 | Polyline: pickup follows corridor better than raw origin anchor. |
 * | `corridorDestinationVersusAnchor` | 32 | Polyline: destination fits route tail better than label anchor. |
 * | `bookable` | 220 | Next trip exists with seats & not completed/cancelled. |
 * | `tripStatus` | 45 | `scheduled` full; `in_progress` partial; else 0. |
 * | `seats` | 58 | `sqrt(seatsRemaining / seatsTotal)` — diminishing returns when many seats. |
 * | `departure` | 92 | Quadratic decay over `departureHorizonHours` until next start. |
 * | `recurringType` | 18 | Recurring template > one-off > other. |
 * | `recurringRunsToday` | 14 | Recurring + active schedule row for **today’s** weekday. |
 * | `recurringCoverage` | 12 | Recurring: fraction of weekdays with **any** active schedule (0–7 → 0–max points). |
 *
 * **No search coords** (e.g. home): all search/geo terms are **0**.
 *
 * ---
 * ## Implementation notes
 * - Point-to-polyline distance uses a **local flat-earth** projection per segment (fine for <~200 km legs).
 * - Polyline tail = last ~32% of path **length** for destination matching (see `DESTINATION_TAIL_LENGTH_FRACTION`).
 */
export const PASSENGER_ROUTE_RANKING_WEIGHTS = {
  pickupGeo: 125,
  pickupInsideCorridorFuzz: 42,
  destGeo: 125,
  corridorPickupVersusOrigin: 34,
  corridorDestinationVersusAnchor: 32,
  bookable: 220,
  tripStatus: 45,
  seats: 58,
  departure: 92,
  recurringType: 18,
  recurringRunsToday: 14,
  recurringCoverage: 12,
  /** Normalizes “how soon” departure matters (full window in hours). */
  departureHorizonHours: 14 * 24,
} as const

const W = PASSENGER_ROUTE_RANKING_WEIGHTS

function clamp01(x: number): number {
  if (x <= 0) return 0
  if (x >= 1) return 1
  return x
}

/**
 * Luxon weekday Mon=1 … Sun=7 → template `dayOfWeek` 0=Sun … 6=Sat.
 */
function toTemplateDayOfWeek(now: DateTime): number {
  return now.weekday === 7 ? 0 : now.weekday
}

function tripStartDateTimeUtc(trip: TripInstance): DateTime | null {
  const dateStr = trip.tripDate?.toISODate?.() ?? trip.tripDate?.toFormat('yyyy-MM-dd')
  if (!dateStr) return null
  const t = String(trip.departureTime ?? '00:00').slice(0, 8)
  const iso = t.length >= 8 ? `${dateStr}T${t}` : `${dateStr}T${t}:00`
  const dt = DateTime.fromISO(iso, { zone: 'utc' })
  return dt.isValid ? dt : null
}

/**
 * Pickup geo (search): effective pickup distance vs allow radius (sqrt decay).
 */
function pickupGeoScore(metrics: PassengerRouteCorridorMetrics, pickupAllowMeters: number): number {
  if (pickupAllowMeters <= 0) {
    return 0
  }
  const ratio = clamp01(metrics.pickupEffectiveM / pickupAllowMeters)
  return W.pickupGeo * (1 - Math.sqrt(ratio))
}

/**
 * Inside published pickup fuzz on **effective** pickup distance (origin or corridor).
 */
function pickupInsideCorridorFuzzScore(
  metrics: PassengerRouteCorridorMetrics,
  corridorPickupRadiusMeters: number
): number {
  const r = Math.max(50, corridorPickupRadiusMeters)
  const m = metrics.pickupEffectiveM
  if (m > r) {
    return 0
  }
  return W.pickupInsideCorridorFuzz * clamp01(1 - m / r)
}

/** Polyline: pickup is materially closer to the line than to the template origin. */
function corridorPickupVersusOriginScore(
  metrics: PassengerRouteCorridorMetrics,
  pickupAllowMeters: number
): number {
  if (!metrics.hasPolyline || metrics.pickupDistCorridorM === null || pickupAllowMeters <= 0) {
    return 0
  }
  if (metrics.pickupDistCorridorM + 45 >= metrics.pickupDistOriginM) {
    return 0
  }
  const ratio = clamp01(metrics.pickupDistCorridorM / pickupAllowMeters)
  return W.corridorPickupVersusOrigin * (1 - Math.sqrt(ratio))
}

/**
 * Destination geo (search): effective destination distance vs cap.
 */
function destinationGeoScore(
  metrics: PassengerRouteCorridorMetrics,
  destMaxMeters: number
): number {
  if (destMaxMeters <= 0) {
    return 0
  }
  const ratio = clamp01(metrics.destEffectiveM / destMaxMeters)
  return W.destGeo * (1 - Math.sqrt(ratio))
}

/** Polyline: destination aligns better with corridor tail than template destination label. */
function corridorDestinationVersusAnchorScore(
  metrics: PassengerRouteCorridorMetrics,
  destMaxMeters: number
): number {
  if (!metrics.hasPolyline || metrics.destDistTailM === null || destMaxMeters <= 0) {
    return 0
  }
  if (metrics.destDistTailM + 90 >= metrics.destDistAnchorM) {
    return 0
  }
  const ratio = clamp01(metrics.destEffectiveM / destMaxMeters)
  return W.corridorDestinationVersusAnchor * (1 - Math.sqrt(ratio))
}

/**
 * Bookable trip + route status: `bookable` lump sum if next trip; status split scheduled vs in_progress.
 */
function bookableAndStatusScore(nextTrip: TripInstance | null): {
  bookable: number
  status: number
} {
  if (!nextTrip) {
    return { bookable: 0, status: 0 }
  }
  let statusPts = 0
  if (nextTrip.routeStatus === TripInstanceStatus.SCHEDULED) {
    statusPts = W.tripStatus
  } else if (nextTrip.routeStatus === TripInstanceStatus.IN_PROGRESS) {
    statusPts = W.tripStatus * 0.38
  }
  return { bookable: W.bookable, status: statusPts }
}

/**
 * Seats: `W.seats * sqrt(rem / total)` — rewards more capacity without dominating when total is large.
 */
function seatsScore(nextTrip: TripInstance | null): number {
  if (!nextTrip) return 0
  const total = Math.max(1, nextTrip.seatsTotal)
  const rem = Math.max(0, nextTrip.seatsRemaining)
  return W.seats * clamp01(Math.sqrt(rem / total))
}

/**
 * Departure proximity: let `h` = hours until start, `H` = `W.departureHorizonHours`.
 * For `h in [0, H]`: `W.departure * (1 - h/H)^2`. Past-start trips get a small residual; very old 0.
 */
function departureProximityScore(nextTrip: TripInstance | null, now: DateTime): number {
  if (!nextTrip) return 0
  const start = tripStartDateTimeUtc(nextTrip)
  if (!start) return 0
  const hoursUntil = start.diff(now, 'hours').hours
  if (hoursUntil < -48) {
    return 0
  }
  if (hoursUntil < 0) {
    return W.departure * 0.22
  }
  const t = clamp01(hoursUntil / W.departureHorizonHours)
  return W.departure * (1 - t) ** 2
}

/**
 * Recurring type + “runs today” + coverage of active weekdays (suitability signal).
 */
function recurringScores(
  template: RouteTemplate,
  now: DateTime
): { type: number; today: number; coverage: number } {
  const st = String(template.scheduleType ?? '').toLowerCase()
  let type = 0
  if (st === 'recurring') {
    type = W.recurringType
  } else if (st === 'one_off') {
    type = W.recurringType * 0.35
  }

  const schedules = Array.isArray(template.schedules) ? template.schedules : []
  const activeDays = schedules.filter((s) => s.isActive).map((s) => s.dayOfWeek)
  const uniqueActive = new Set(activeDays).size

  let today = 0
  if (st === 'recurring' && schedules.length > 0) {
    const dow = toTemplateDayOfWeek(now)
    const hit = schedules.some((s) => s.dayOfWeek === dow && s.isActive)
    if (hit) {
      today = W.recurringRunsToday
    }
  }

  let coverage = 0
  if (st === 'recurring' && uniqueActive > 0) {
    coverage = W.recurringCoverage * clamp01(uniqueActive / 7)
  }

  return { type, today, coverage }
}

export type RouteSuggestionRankInput = {
  template: RouteTemplate
  /** When null, all geo terms are 0. */
  search: PassengerRouteSearchCoords | null
  nextTrip: TripInstance | null
  now: DateTime
  /** Expanded pickup cap (same as threshold filter). */
  pickupAllowMeters: number
  /** Destination cap (same as threshold filter). */
  destinationMatchMaxMeters: number
  /**
   * Template-published pickup fuzz in meters (PrivacyViewService default ~400 if unset in DB).
   * Used only for the **inside corridor** bonus, not for thresholding.
   */
  corridorPickupRadiusMeters: number
  /**
   * Precomputed corridor metrics (avoids double decode). When omitted with `search` set, computed here.
   */
  corridorMetrics?: PassengerRouteCorridorMetrics | null
}

/**
 * Total score = sum of documented partials. Not exposed on API DTOs.
 */
export function scorePassengerRouteSuggestion(input: RouteSuggestionRankInput): number {
  const {
    template,
    search,
    nextTrip,
    now,
    pickupAllowMeters,
    destinationMatchMaxMeters,
    corridorPickupRadiusMeters,
    corridorMetrics: passedMetrics,
  } = input

  let total = 0

  if (search) {
    const metrics = passedMetrics ?? computePassengerRouteCorridorMetrics(template, search)

    total += pickupGeoScore(metrics, pickupAllowMeters)
    total += pickupInsideCorridorFuzzScore(metrics, corridorPickupRadiusMeters)
    total += destinationGeoScore(metrics, destinationMatchMaxMeters)
    total += corridorPickupVersusOriginScore(metrics, pickupAllowMeters)
    total += corridorDestinationVersusAnchorScore(metrics, destinationMatchMaxMeters)
  }

  const { bookable, status } = bookableAndStatusScore(nextTrip)
  total += bookable
  total += status
  total += seatsScore(nextTrip)
  total += departureProximityScore(nextTrip, now)

  const rec = recurringScores(template, now)
  total += rec.type
  total += rec.today
  total += rec.coverage

  return total
}

/** Stable tie-breaker: lower template id first when scores are equal. */
export function compareRankedSuggestions(
  a: { score: number; templateId: number },
  b: { score: number; templateId: number }
): number {
  if (b.score !== a.score) {
    return b.score - a.score
  }
  return a.templateId - b.templateId
}
