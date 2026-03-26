import { compose } from '@adonisjs/core/helpers'
import { withAuthFinder } from '@adonisjs/auth/mixins/lucid'
import hash from '@adonisjs/core/services/hash'
import { DateTime } from 'luxon'
import { BaseModel, column, hasMany, hasOne } from '@adonisjs/lucid/orm'
import type { HasMany, HasOne } from '@adonisjs/lucid/types/relations'
import DriverProfile from '#models/driver_profile'
import ModerationAction from '#models/moderation_action'
import ModerationReport from '#models/moderation_report'
import PassengerProfile from '#models/passenger_profile'
import PublicProfile from '#models/public_profile'
import RouteTemplate from '#models/route_template'
import SavedPlace from '#models/saved_place'
import TripInstance from '#models/trip_instance'

const AuthFinder = withAuthFinder(() => hash.use('scrypt'), {
  uids: ['email'],
  passwordColumnName: 'password',
})

export default class User extends compose(BaseModel, AuthFinder) {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string | null

  @column({ columnName: 'real_name' })
  declare realName: string | null

  @column()
  declare phone: string | null

  @column({ columnName: 'department_team' })
  declare departmentTeam: string | null

  @column({ columnName: 'emergency_contact_name' })
  declare emergencyContactName: string | null

  @column({ columnName: 'emergency_contact_phone' })
  declare emergencyContactPhone: string | null

  @column.dateTime({ columnName: 'onboarding_completed_at' })
  declare onboardingCompletedAt: DateTime | null

  @column()
  declare status: string

  @column({ columnName: 'can_drive' })
  declare canDrive: boolean

  @column({ columnName: 'can_ride' })
  declare canRide: boolean

  @column({ columnName: 'is_admin' })
  declare isAdmin: boolean

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime | null

  @hasOne(() => PublicProfile, { foreignKey: 'userId' })
  declare publicProfile: HasOne<typeof PublicProfile>

  @hasOne(() => DriverProfile, { foreignKey: 'userId' })
  declare driverProfile: HasOne<typeof DriverProfile>

  @hasOne(() => PassengerProfile, { foreignKey: 'userId' })
  declare passengerProfile: HasOne<typeof PassengerProfile>

  @hasMany(() => SavedPlace, { foreignKey: 'userId' })
  declare savedPlaces: HasMany<typeof SavedPlace>

  @hasMany(() => RouteTemplate, { foreignKey: 'driverUserId' })
  declare driverRouteTemplates: HasMany<typeof RouteTemplate>

  @hasMany(() => TripInstance, { foreignKey: 'driverUserId' })
  declare driverTrips: HasMany<typeof TripInstance>

  @hasMany(() => ModerationReport, { foreignKey: 'reportedByUserId' })
  declare moderationReportsFiled: HasMany<typeof ModerationReport>

  @hasMany(() => ModerationAction, { foreignKey: 'targetUserId' })
  declare moderationActionsReceived: HasMany<typeof ModerationAction>

  get isSuspended(): boolean {
    return this.status === 'suspended'
  }
}
