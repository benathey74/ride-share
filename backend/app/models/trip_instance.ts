import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column, hasMany } from '@adonisjs/lucid/orm'
import type { BelongsTo, HasMany } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import RouteTemplate from '#models/route_template'
import TripRequest from '#models/trip_request'
import TripPassenger from '#models/trip_passenger'
import TripMessage from '#models/trip_message'

export default class TripInstance extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare routeTemplateId: number | null

  @column()
  declare driverUserId: number

  @column.date()
  declare tripDate: DateTime

  @column()
  declare departureTime: string

  @column()
  declare seatsTotal: number

  @column()
  declare seatsRemaining: number

  @column()
  declare routeStatus: string

  @column()
  declare exactPickupUnlocked: boolean

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

  @belongsTo(() => RouteTemplate, { foreignKey: 'routeTemplateId' })
  declare routeTemplate: BelongsTo<typeof RouteTemplate>

  @belongsTo(() => User, { foreignKey: 'driverUserId' })
  declare driver: BelongsTo<typeof User>

  @hasMany(() => TripRequest, { foreignKey: 'tripInstanceId' })
  declare tripRequests: HasMany<typeof TripRequest>

  @hasMany(() => TripPassenger, { foreignKey: 'tripInstanceId' })
  declare passengers: HasMany<typeof TripPassenger>

  @hasMany(() => TripMessage, { foreignKey: 'tripInstanceId' })
  declare messages: HasMany<typeof TripMessage>
}
