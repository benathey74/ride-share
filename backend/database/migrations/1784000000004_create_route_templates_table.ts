import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'route_templates'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('driver_user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('origin_label', 160).notNullable()
      table.string('destination_label', 160).notNullable()
      table.string('origin_place_id', 255).nullable()
      table.string('destination_place_id', 255).nullable()
      table.decimal('origin_lat', 10, 7).notNullable()
      table.decimal('origin_lng', 10, 7).notNullable()
      table.decimal('destination_lat', 10, 7).notNullable()
      table.decimal('destination_lng', 10, 7).notNullable()
      table.string('schedule_type', 32).notNullable().defaultTo('recurring')
      table.time('departure_time').notNullable()
      table.integer('seats_total').unsigned().notNullable().defaultTo(4)
      table.integer('detour_tolerance_minutes').unsigned().notNullable().defaultTo(10)
      table.string('status', 32).notNullable().defaultTo('active')

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
