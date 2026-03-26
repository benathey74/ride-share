import { test } from '@japa/runner'
import { DateTime } from 'luxon'
import { TripInstanceStatus } from '#constants/trip'
import {
  compareRankedSuggestions,
  scorePassengerRouteSuggestion,
} from '#services/passenger_route_suggestion_ranking'
import {
  ANCHOR_DEST_LAT,
  ANCHOR_DEST_LNG,
  ANCHOR_ORIGIN_LAT,
  buildRankInput,
  makeRouteTemplate,
  makeSearch,
  makeTripInstance,
  offsetNorthMeters,
} from './helpers/passenger_route_ranking_fixtures.js'

test.group('passenger_route_suggestion_ranking', () => {
  test('pickup distance: closer pickup scores higher when other factors match', ({ assert }) => {
    const template = makeRouteTemplate()
    const nearPickup = makeSearch({
      pickupLat: offsetNorthMeters(ANCHOR_ORIGIN_LAT, 40),
    })
    const farPickup = makeSearch({
      pickupLat: offsetNorthMeters(ANCHOR_ORIGIN_LAT, 900),
    })
    const base = buildRankInput({ template })
    const sNear = scorePassengerRouteSuggestion({ ...base, search: nearPickup })
    const sFar = scorePassengerRouteSuggestion({ ...base, search: farPickup })
    assert.isAbove(sNear, sFar)
  })

  test('destination distance: closer destination scores higher when other factors match', ({
    assert,
  }) => {
    const template = makeRouteTemplate()
    const alignedDest = makeSearch({
      destLat: ANCHOR_DEST_LAT,
      destLng: ANCHOR_DEST_LNG,
    })
    const offsetDest = makeSearch({
      destLat: offsetNorthMeters(ANCHOR_DEST_LAT, 2500),
      destLng: ANCHOR_DEST_LNG,
    })
    const base = buildRankInput({ template })
    const sClose = scorePassengerRouteSuggestion({ ...base, search: alignedDest })
    const sFar = scorePassengerRouteSuggestion({ ...base, search: offsetDest })
    assert.isAbove(sClose, sFar)
  })

  test('corridor fuzz bonus: inside published radius beats outside at same pickup point', ({
    assert,
  }) => {
    const template = makeRouteTemplate()
    const search = makeSearch({
      pickupLat: offsetNorthMeters(ANCHOR_ORIGIN_LAT, 100),
    })
    const base = buildRankInput({ template, search })
    const insideCorridor = scorePassengerRouteSuggestion({
      ...base,
      corridorPickupRadiusMeters: 250,
    })
    const outsideCorridor = scorePassengerRouteSuggestion({
      ...base,
      corridorPickupRadiusMeters: 80,
    })
    assert.isAbove(insideCorridor, outsideCorridor)
  })

  test('seat availability: more seats remaining scores higher when geo and trip match', ({
    assert,
  }) => {
    const fewSeats = makeTripInstance({ seatsTotal: 4, seatsRemaining: 1 })
    const manySeats = makeTripInstance({ seatsTotal: 4, seatsRemaining: 4 })
    const base = buildRankInput({ search: null })
    const sLow = scorePassengerRouteSuggestion({ ...base, nextTrip: fewSeats })
    const sHigh = scorePassengerRouteSuggestion({ ...base, nextTrip: manySeats })
    assert.isAbove(sHigh, sLow)
  })

  test('departure proximity: sooner departure scores higher when template and trip match', ({
    assert,
  }) => {
    const now = DateTime.fromObject({ year: 2026, month: 1, day: 6, hour: 12 }, { zone: 'utc' })
    const soon = makeTripInstance({
      tripDate: DateTime.fromObject({ year: 2026, month: 1, day: 7 }, { zone: 'utc' }),
      departureTime: '08:00:00',
    })
    const later = makeTripInstance({
      tripDate: DateTime.fromObject({ year: 2026, month: 1, day: 20 }, { zone: 'utc' }),
      departureTime: '08:00:00',
    })
    const base = buildRankInput({ now, search: null })
    const sSoon = scorePassengerRouteSuggestion({ ...base, nextTrip: soon })
    const sLater = scorePassengerRouteSuggestion({ ...base, nextTrip: later })
    assert.isAbove(sSoon, sLater)
  })

  test('recurring coverage: more active weekdays adds a small boost when "today" matches neither', ({
    assert,
  }) => {
    const now = DateTime.fromObject({ year: 2026, month: 1, day: 4 }, { zone: 'utc' })
    assert.equal(now.weekday, 7)
    const narrow = makeRouteTemplate({
      id: 1,
      scheduleType: 'recurring',
      schedules: [{ dayOfWeek: 1, isActive: true }],
    })
    const broad = makeRouteTemplate({
      id: 2,
      scheduleType: 'recurring',
      schedules: [1, 2, 3, 4, 5, 6].map((dayOfWeek) => ({ dayOfWeek, isActive: true })),
    })
    const base = buildRankInput({ now, search: null })
    const sNarrow = scorePassengerRouteSuggestion({ ...base, template: narrow })
    const sBroad = scorePassengerRouteSuggestion({ ...base, template: broad })
    assert.isAbove(sBroad, sNarrow)
  })

  test('recurring runs today: active schedule for current weekday adds expected boost', ({
    assert,
  }) => {
    const now = DateTime.fromObject({ year: 2026, month: 1, day: 5 }, { zone: 'utc' })
    assert.equal(now.weekday, 1)
    const runsToday = makeRouteTemplate({
      scheduleType: 'recurring',
      schedules: [{ dayOfWeek: 1, isActive: true }],
    })
    const notToday = makeRouteTemplate({
      scheduleType: 'recurring',
      schedules: [{ dayOfWeek: 3, isActive: true }],
    })
    const base = buildRankInput({ now, search: null })
    const sHit = scorePassengerRouteSuggestion({ ...base, template: runsToday })
    const sMiss = scorePassengerRouteSuggestion({ ...base, template: notToday })
    assert.isAbove(sHit, sMiss)
  })

  test('bookability: scheduled trip with next instance beats no trip', ({ assert }) => {
    const withTrip = buildRankInput({ search: null, nextTrip: makeTripInstance() })
    const withoutTrip = buildRankInput({ search: null, nextTrip: null })
    assert.isAbove(
      scorePassengerRouteSuggestion(withTrip),
      scorePassengerRouteSuggestion(withoutTrip)
    )
  })

  test('route status: scheduled beats in_progress when seats and departure match', ({ assert }) => {
    const scheduled = makeTripInstance({ routeStatus: TripInstanceStatus.SCHEDULED })
    const inProgress = makeTripInstance({ routeStatus: TripInstanceStatus.IN_PROGRESS })
    const base = buildRankInput({ search: null })
    const sSched = scorePassengerRouteSuggestion({ ...base, nextTrip: scheduled })
    const sProg = scorePassengerRouteSuggestion({ ...base, nextTrip: inProgress })
    assert.isAbove(sSched, sProg)
  })

  test('compareRankedSuggestions: equal scores order by ascending routeTemplateId', ({
    assert,
  }) => {
    const rows = [
      { score: 100, templateId: 3 },
      { score: 100, templateId: 1 },
      { score: 99, templateId: 2 },
    ]
    const sorted = [...rows].sort(compareRankedSuggestions)
    assert.deepEqual(
      sorted.map((r) => r.templateId),
      [1, 3, 2]
    )
    assert.equal(
      compareRankedSuggestions(rows[0], rows[1]),
      rows[0].templateId - rows[1].templateId
    )
  })

  test('compareRankedSuggestions: higher score sorts before lower regardless of id', ({
    assert,
  }) => {
    const lower = { score: 50, templateId: 1 }
    const higher = { score: 200, templateId: 99 }
    assert.isAbove(compareRankedSuggestions(lower, higher), 0)
    assert.deepEqual([lower, higher].sort(compareRankedSuggestions), [higher, lower])
  })
})
