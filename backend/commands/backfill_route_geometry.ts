import { BaseCommand } from '@adonisjs/core/ace'
import RouteTemplate from '#models/route_template'
import { fetchDrivingRouteGeometry } from '#services/google_directions_route_service'

function parseEndpointCoords(template: RouteTemplate): {
  originLat: number
  originLng: number
  destinationLat: number
  destinationLng: number
} | null {
  const oLat = Number.parseFloat(String(template.originLat ?? '').trim())
  const oLng = Number.parseFloat(String(template.originLng ?? '').trim())
  const dLat = Number.parseFloat(String(template.destinationLat ?? '').trim())
  const dLng = Number.parseFloat(String(template.destinationLng ?? '').trim())
  if (
    !Number.isFinite(oLat) ||
    !Number.isFinite(oLng) ||
    !Number.isFinite(dLat) ||
    !Number.isFinite(dLng)
  ) {
    return null
  }
  if (oLat < -90 || oLat > 90 || dLat < -90 || dLat > 90) {
    return null
  }
  if (oLng < -180 || oLng > 180 || dLng < -180 || dLng > 180) {
    return null
  }
  return { originLat: oLat, originLng: oLng, destinationLat: dLat, destinationLng: dLng }
}

/**
 * One-off / periodic backfill: fills Directions-based geometry only for `route_templates` rows
 * that still have `route_polyline` null. Uses {@link fetchDrivingRouteGeometry} only (no synthetic fallback).
 */
export default class BackfillRouteGeometry extends BaseCommand {
  static commandName = 'backfill:route-geometry'
  static description =
    'Populate missing route_polyline (and distance/duration) via Google Directions for route_templates'

  async run() {
    const templates = await RouteTemplate.query()
      .whereNull('route_polyline')
      .orderBy('id', 'asc')

    const total = templates.length
    this.logger.info(`Processing ${total} routes...`)

    let updated = 0
    let skipped = 0
    let failed = 0

    for (const template of templates) {
      const coords = parseEndpointCoords(template)
      if (!coords) {
        skipped += 1
        this.logger.warning(
          `Skipped route ${template.id} (missing coords) — ${template.originLabel} → ${template.destinationLabel}`,
        )
        continue
      }

      try {
        const geom = await fetchDrivingRouteGeometry(coords)
        if (!geom) {
          skipped += 1
          this.logger.warning(
            `Skipped route ${template.id} (no Directions result — check API key, billing, or enable Directions API) — ${template.originLabel} → ${template.destinationLabel}`,
          )
          continue
        }

        template.merge({
          routePolyline: geom.encodedPolyline,
          totalDistanceMeters: geom.distanceMeters,
          totalDurationSeconds: geom.durationSeconds,
        })
        await template.save()
        updated += 1
        this.logger.success(`Updated route ${template.id}`)
      } catch (error) {
        failed += 1
        const msg = error instanceof Error ? error.message : String(error)
        this.logger.error(`Failed route ${template.id}: ${msg}`)
      }
    }

    this.logger.success(`Done: ${updated} updated, ${skipped} skipped, ${failed} failed`)
  }
}
