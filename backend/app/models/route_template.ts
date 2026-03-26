import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import RouteTemplateSchedule from '#models/route_template_schedule'
import TripInstance from '#models/trip_instance'

export default class RouteTemplate extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare driverUserId: number

  @column()
  declare originLabel: string

  @column()
  declare destinationLabel: string

  @column()
  declare originPlaceId: string | null

  @column()
  declare destinationPlaceId: string | null

  @column()
  declare originLat: string

  @column()
  declare originLng: string

  @column()
  declare destinationLat: string

  @column()
  declare destinationLng: string

  @column()
  declare scheduleType: string

  @column()
  declare departureTime: string

  @column()
  declare seatsTotal: number

  @column()
  declare detourToleranceMinutes: number

  @column()
  declare status: string

  /** Optional corridor fuzz radius (meters). When null, clients use default (~400m). */
  @column()
  declare pickupRadiusMeters: number | null

  /** Encoded polyline (Google Directions overview), optional until server key + fetch succeed. */
  @column()
  declare routePolyline: string | null

  @column()
  declare totalDistanceMeters: number | null

  @column()
  declare totalDurationSeconds: number | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'driverUserId' })
  declare driver: BelongsTo<typeof User>

  @hasMany(() => RouteTemplateSchedule, { foreignKey: 'routeTemplateId' })
  declare schedules: HasMany<typeof RouteTemplateSchedule>

  @hasMany(() => TripInstance, { foreignKey: 'routeTemplateId' })
  declare tripInstances: HasMany<typeof TripInstance>
}
