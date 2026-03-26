import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class DriverProfile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare vehicleMake: string | null

  @column()
  declare vehicleModel: string | null

  @column()
  declare vehicleColor: string | null

  @column()
  declare plateNumber: string | null

  @column()
  declare seatsTotal: number

  @column()
  declare detourToleranceMinutes: number

  @column({ columnName: 'pickup_radius_meters' })
  declare pickupRadiusMeters: number | null

  @column({ columnName: 'commute_notes' })
  declare commuteNotes: string | null

  @column()
  declare approvalStatus: string

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
