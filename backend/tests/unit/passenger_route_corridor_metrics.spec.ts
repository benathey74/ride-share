import { test } from '@japa/runner'
import type RouteTemplate from '#models/route_template'
import {
  computePassengerRouteCorridorMetrics,
  derivePassengerRouteMatchHints,
} from '#services/passenger_route_corridor_metrics'
import { templateMatchesPassengerSearch } from '#services/passenger_route_search_filter'
import { buildSyntheticDrivingRouteGeometry } from '#services/synthetic_route_geometry'
import {
  ANCHOR_DEST_LAT,
  ANCHOR_DEST_LNG,
  ANCHOR_ORIGIN_LAT,
  ANCHOR_ORIGIN_LNG,
  makeRouteTemplate,
  makeSearch,
  offsetNorthMeters,
} from './helpers/passenger_route_ranking_fixtures.js'

test.group('passenger_route_corridor_metrics', () => {
  test('polyline: pickup far along corridor still matches via corridor distance', ({ assert }) => {
    const geom = buildSyntheticDrivingRouteGeometry(
      ANCHOR_ORIGIN_LAT,
      ANCHOR_ORIGIN_LNG,
      ANCHOR_DEST_LAT,
      ANCHOR_DEST_LNG
    )
    const template = {
      ...makeRouteTemplate(),
      routePolyline: geom.encodedPolyline,
    } as RouteTemplate

    const alongCorridorPickup = offsetNorthMeters(ANCHOR_ORIGIN_LAT, 2800)
    const search = makeSearch({
      pickupLat: alongCorridorPickup,
      pickupLng: ANCHOR_ORIGIN_LNG,
      destLat: ANCHOR_DEST_LAT,
      destLng: ANCHOR_DEST_LNG,
    })

    const withoutPoly = makeRouteTemplate()
    assert.isFalse(templateMatchesPassengerSearch(withoutPoly, search))
    assert.isTrue(templateMatchesPassengerSearch(template, search))

    const m = computePassengerRouteCorridorMetrics(template, search)
    assert.isBelow(m.pickupEffectiveM, m.pickupDistOriginM)
    assert.isTrue(m.hasPolyline)
  })

  test('no polyline: falls back to origin/destination distances only', ({ assert }) => {
    const template = makeRouteTemplate()
    const search = makeSearch()
    const m = computePassengerRouteCorridorMetrics(template, search)
    assert.isFalse(m.hasPolyline)
    assert.equal(m.pickupEffectiveM, m.pickupDistOriginM)
    assert.equal(m.destEffectiveM, m.destDistAnchorM)
  })

  test('derivePassengerRouteMatchHints: corridor_pickup when line beats origin', ({ assert }) => {
    const geom = buildSyntheticDrivingRouteGeometry(
      ANCHOR_ORIGIN_LAT,
      ANCHOR_ORIGIN_LNG,
      ANCHOR_DEST_LAT,
      ANCHOR_DEST_LNG
    )
    const template = {
      ...makeRouteTemplate(),
      routePolyline: geom.encodedPolyline,
    } as RouteTemplate
    const alongCorridorPickup = offsetNorthMeters(ANCHOR_ORIGIN_LAT, 2000)
    const search = makeSearch({
      pickupLat: alongCorridorPickup,
      pickupLng: ANCHOR_ORIGIN_LNG,
    })
    const m = computePassengerRouteCorridorMetrics(template, search)
    const hints = derivePassengerRouteMatchHints(m, 400)
    assert.includeMembers(hints, ['corridor_pickup'])
  })
})
