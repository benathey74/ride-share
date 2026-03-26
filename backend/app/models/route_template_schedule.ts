import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import RouteTemplate from '#models/route_template'

export default class RouteTemplateSchedule extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare routeTemplateId: number

  @column()
  declare dayOfWeek: number

  @column()
  declare isActive: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => RouteTemplate, { foreignKey: 'routeTemplateId' })
  declare routeTemplate: BelongsTo<typeof RouteTemplate>
}
