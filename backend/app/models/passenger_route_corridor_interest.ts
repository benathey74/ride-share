import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import RouteTemplate from '#models/route_template'
import User from '#models/user'

export default class PassengerRouteCorridorInterest extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare routeTemplateId: number

  @column()
  declare riderUserId: number

  @column()
  declare message: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => RouteTemplate, { foreignKey: 'routeTemplateId' })
  declare routeTemplate: BelongsTo<typeof RouteTemplate>

  @belongsTo(() => User, { foreignKey: 'riderUserId' })
  declare rider: BelongsTo<typeof User>
}
