import { DateTime } from 'luxon'
import { BaseModel, belongsTo, column } from '@adonisjs/lucid/orm'
import type { BelongsTo } from '@adonisjs/lucid/types/relations'
import User from '#models/user'

export default class PassengerProfile extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare userId: number

  @column()
  declare accessibilityNotes: string | null

  @column({
    columnName: 'usual_commute_days',
    prepare: (value: number[] | null | undefined) =>
      value == null ? null : JSON.stringify(value),
    consume: (value: string | number[] | null | undefined) => {
      if (value == null) return null
      if (Array.isArray(value)) {
        return value.filter((n): n is number => typeof n === 'number' && n >= 0 && n <= 6)
      }
      try {
        const p = JSON.parse(value) as unknown
        return Array.isArray(p)
          ? p.filter((n): n is number => typeof n === 'number' && n >= 0 && n <= 6)
          : null
      } catch {
        return null
      }
    },
  })
  declare usualCommuteDays: number[] | null

  @column({ columnName: 'preferred_morning_time' })
  declare preferredMorningTime: string | null

  @column({ columnName: 'preferred_evening_time' })
  declare preferredEveningTime: string | null

  @column({ columnName: 'ride_preferences' })
  declare ridePreferences: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @belongsTo(() => User)
  declare user: BelongsTo<typeof User>
}
