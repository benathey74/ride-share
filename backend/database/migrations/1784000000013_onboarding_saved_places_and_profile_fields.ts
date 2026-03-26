import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  async up() {
    this.schema.alterTable('users', (table) => {
      table.string('department_team', 120).nullable()
      table.string('emergency_contact_name', 120).nullable()
      table.string('emergency_contact_phone', 32).nullable()
      table.timestamp('onboarding_completed_at', { useTz: true }).nullable()
    })

    this.schema.alterTable('passenger_profiles', (table) => {
      table.text('usual_commute_days').nullable()
      table.string('preferred_morning_time', 8).nullable()
      table.string('preferred_evening_time', 8).nullable()
      table.text('ride_preferences').nullable()
    })

    this.schema.alterTable('driver_profiles', (table) => {
      table.integer('pickup_radius_meters').unsigned().nullable()
      table.text('commute_notes').nullable()
    })

    this.schema.createTable('saved_places', (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('kind', 32).notNullable()
      table.string('label', 255).notNullable()
      table.string('place_id', 255).notNullable()
      table.string('lat', 32).notNullable()
      table.string('lng', 32).notNullable()
      table.boolean('is_default').notNullable().defaultTo(false)

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.index(['user_id', 'kind'])
    })
  }

  async down() {
    this.schema.dropTable('saved_places')

    this.schema.alterTable('driver_profiles', (table) => {
      table.dropColumn('pickup_radius_meters')
      table.dropColumn('commute_notes')
    })

    this.schema.alterTable('passenger_profiles', (table) => {
      table.dropColumn('usual_commute_days')
      table.dropColumn('preferred_morning_time')
      table.dropColumn('preferred_evening_time')
      table.dropColumn('ride_preferences')
    })

    this.schema.alterTable('users', (table) => {
      table.dropColumn('department_team')
      table.dropColumn('emergency_contact_name')
      table.dropColumn('emergency_contact_phone')
      table.dropColumn('onboarding_completed_at')
    })
  }
}
