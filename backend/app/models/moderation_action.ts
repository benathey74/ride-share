import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class ModerationAction extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare adminUserId: number

  @column()
  declare targetUserId: number

  @column()
  declare actionType: string

  @column()
  declare reason: string | null

  @column({ columnName: 'metadata_json' })
  declare metadataJson: Record<string, unknown> | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User, { foreignKey: 'adminUserId' })
  declare admin: BelongsTo<typeof User>

  @belongsTo(() => User, { foreignKey: 'targetUserId' })
  declare targetUser: BelongsTo<typeof User>
}
