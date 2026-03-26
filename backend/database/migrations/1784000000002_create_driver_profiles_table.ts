import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'driver_profiles'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('vehicle_make', 80).nullable()
      table.string('vehicle_model', 80).nullable()
      table.string('vehicle_color', 40).nullable()
      table.string('plate_number', 32).nullable()
      table.integer('seats_total').unsigned().notNullable().defaultTo(4)
      table.integer('detour_tolerance_minutes').unsigned().notNullable().defaultTo(10)
      table.string('approval_status', 32).notNullable().defaultTo('pending')

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.unique(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
