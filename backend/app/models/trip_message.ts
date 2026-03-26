import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import TripInstance from '#models/trip_instance'
import User from '#models/user'

export default class TripMessage extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare tripInstanceId: number

  @column()
  declare senderUserId: number

  @column()
  declare recipientUserId: number | null

  @column()
  declare message: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => TripInstance, { foreignKey: 'tripInstanceId' })
  declare tripInstance: BelongsTo<typeof TripInstance>

  @belongsTo(() => User, { foreignKey: 'senderUserId' })
  declare sender: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'recipientUserId' })
  declare recipient: BelongsTo<typeof User>
}
