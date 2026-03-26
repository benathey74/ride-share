import { Exception } from '@adonisjs/core/exceptions'
import RouteTemplate from '#models/route_template'
import RouteTemplateSchedule from '#models/route_template_schedule'
import User from '#models/user'
import { RouteTemplateStatus } from '#constants/trip'
import { hydrateRouteTemplateGeometry } from '#services/route_template_geometry_hydrator'

export default class DriverRouteTemplateService {
  async listForDriver(driverUserId: number) {
    const templates = await RouteTemplate.query()
      .where('driver_user_id', driverUserId)
      .preload('schedules')
      .orderBy('created_at', 'desc')

    return templates.map((t) => this.serializeTemplate(t))
  }

  async create(
    driverUserId: number,
    payload: {
      originLabel: string
      destinationLabel: string
      originPlaceId?: string | null
      destinationPlaceId?: string | null
      originLat: string
      originLng: string
      destinationLat: string
      destinationLng: string
      scheduleType: string
      departureTime: string
      seatsTotal?: number
      detourToleranceMinutes?: number
      pickupRadiusMeters?: number
      status?: string
      schedules?: { dayOfWeek: number; isActive?: boolean }[]
    }
  ) {
    const user = await User.findOrFail(driverUserId)
    if (!user.canDrive) {
      throw new Exception('Account is not enabled for driving', { status: 403 })
    }

    const template = await RouteTemplate.create({
      driverUserId,
      originLabel: payload.originLabel,
      destinationLabel: payload.destinationLabel,
      originPlaceId: payload.originPlaceId ?? null,
      destinationPlaceId: payload.destinationPlaceId ?? null,
      originLat: payload.originLat,
      originLng: payload.originLng,
      destinationLat: payload.destinationLat,
      destinationLng: payload.destinationLng,
      scheduleType: payload.scheduleType,
      departureTime: payload.departureTime,
      seatsTotal: payload.seatsTotal ?? 4,
      detourToleranceMinutes: payload.detourToleranceMinutes ?? 10,
      pickupRadiusMeters: payload.pickupRadiusMeters ?? null,
      status: payload.status ?? RouteTemplateStatus.ACTIVE,
    })

    if (payload.schedules?.length) {
      await RouteTemplateSchedule.createMany(
        payload.schedules.map((s) => ({
          routeTemplateId: template.id,
          dayOfWeek: s.dayOfWeek,
          isActive: s.isActive ?? true,
        }))
      )
    }

    await template.load('schedules')

    const oLat = Number.parseFloat(payload.originLat)
    const oLng = Number.parseFloat(payload.originLng)
    const dLat = Number.parseFloat(payload.destinationLat)
    const dLng = Number.parseFloat(payload.destinationLng)
    if (
      Number.isFinite(oLat) &&
      Number.isFinite(oLng) &&
      Number.isFinite(dLat) &&
      Number.isFinite(dLng)
    ) {
      try {
        await hydrateRouteTemplateGeometry(template)
      } catch {
        /* Leave geometry null if hydration fails unexpectedly */
      }
    }

    return this.serializeTemplate(template)
  }

  private serializeTemplate(t: RouteTemplate) {
    return {
      id: String(t.id),
      originLabel: t.originLabel,
      destinationLabel: t.destinationLabel,
      originPlaceId: t.originPlaceId,
      destinationPlaceId: t.destinationPlaceId,
      originLat: t.originLat,
      originLng: t.originLng,
      destinationLat: t.destinationLat,
      destinationLng: t.destinationLng,
      scheduleType: t.scheduleType,
      departureTime: t.departureTime,
      seatsTotal: t.seatsTotal,
      detourToleranceMinutes: t.detourToleranceMinutes,
      pickupRadiusMeters: t.pickupRadiusMeters,
      routePolyline: t.routePolyline,
      totalDistanceMeters: t.totalDistanceMeters,
      totalDurationSeconds: t.totalDurationSeconds,
      status: t.status,
      schedules: t.schedules.map((s) => ({
        id: s.id,
        dayOfWeek: s.dayOfWeek,
        isActive: s.isActive,
      })),
      createdAt: t.createdAt,
      updatedAt: t.updatedAt,
    }
  }
}
