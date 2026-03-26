import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import TripInstance from '#models/trip_instance'
import User from '#models/user'
import TripRequest from '#models/trip_request'

export default class TripPassenger extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tripInstanceId: number

  @column()
  declare riderUserId: number

  @column()
  declare tripRequestId: number | null

  @column()
  declare confirmedPickupLabel: string | null

  @column()
  declare confirmedPickupLat: string | null

  @column()
  declare confirmedPickupLng: string | null

  @column()
  declare seatCount: number

  @column()
  declare status: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => TripInstance, { foreignKey: 'tripInstanceId' })
  declare tripInstance: BelongsTo<typeof TripInstance>

  @belongsTo(() => User, { foreignKey: 'riderUserId' })
  declare rider: BelongsTo<typeof User>

  @belongsTo(() => TripRequest, { foreignKey: 'tripRequestId' })
  declare tripRequest: BelongsTo<typeof TripRequest>
}
