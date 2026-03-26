import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'
import TripInstance from '#models/trip_instance'

export default class ModerationReport extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare reportedByUserId: number

  @column()
  declare reportedUserId: number

  @column()
  declare tripInstanceId: number | null

  @column()
  declare reason: string

  @column()
  declare details: string | null

  @column()
  declare status: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'reportedByUserId' })
  declare reportedBy: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'reportedUserId' })
  declare reportedUser: BelongsTo<typeof User>

  @belongsTo(() => TripInstance, { foreignKey: 'tripInstanceId' })
  declare tripInstance: BelongsTo<typeof TripInstance>
}
