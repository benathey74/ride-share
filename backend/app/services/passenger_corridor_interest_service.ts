import { Exception } from '@adonisjs/core/exceptions'
import PassengerRouteCorridorInterest from '#models/passenger_route_corridor_interest'
import RouteTemplate from '#models/route_template'
import { RouteTemplateStatus } from '#constants/trip'

export default class PassengerCorridorInterestService {
  /**
   * Passenger signals interest in a corridor when no bookable trip exists yet.
   * Upserts one row per (template, rider); updates message and updated_at on repeat.
   */
  async expressInterest(riderUserId: number, routeTemplateId: number, message: string | null) {
    const template = await RouteTemplate.find(routeTemplateId)
    if (!template || template.status !== RouteTemplateStatus.ACTIVE) {
      throw new Exception('Route not found', { status: 404 })
    }

    if (template.driverUserId === riderUserId) {
      throw new Exception('You cannot notify yourself on your own route', { status: 422 })
    }

    const trimmed = message?.trim() ? message.trim() : null

    const existing = await PassengerRouteCorridorInterest.query()
      .where('route_template_id', routeTemplateId)
      .where('rider_user_id', riderUserId)
      .first()

    if (existing) {
      existing.message = trimmed
      await existing.save()
      return { updated: true as const }
    }

    await PassengerRouteCorridorInterest.create({
      routeTemplateId,
      riderUserId,
      message: trimmed,
    })

    return { updated: false as const }
  }
}
