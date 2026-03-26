import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import TripInstance from '#models/trip_instance'
import User from '#models/user'

export default class TripRequest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tripInstanceId: number

  @column()
  declare riderUserId: number

  @column()
  declare approxPickupLabel: string

  @column()
  declare approxPickupLat: string

  @column()
  declare approxPickupLng: string

  @column()
  declare approxPickupRadiusMeters: number

  @column()
  declare exactPickupLabel: string | null

  @column()
  declare exactPickupLat: string | null

  @column()
  declare exactPickupLng: string | null

  @column()
  declare message: string | null

  @column()
  declare status: string

  @column.dateTime()
  declare respondedAt: DateTime | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => TripInstance, { foreignKey: 'tripInstanceId' })
  declare tripInstance: BelongsTo<typeof TripInstance>

  @belongsTo(() => User, { foreignKey: 'riderUserId' })
  declare rider: BelongsTo<typeof User>
}
