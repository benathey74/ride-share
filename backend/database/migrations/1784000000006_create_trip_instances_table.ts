import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'trip_instances'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('route_template_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('route_templates')
        .onDelete('SET NULL')
      table
        .integer('driver_user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.date('trip_date').notNullable()
      table.time('departure_time').notNullable()
      table.integer('seats_total').unsigned().notNullable()
      table.integer('seats_remaining').unsigned().notNullable()
      table.string('route_status', 32).notNullable().defaultTo('scheduled')
      table.boolean('exact_pickup_unlocked').notNullable().defaultTo(false)
      table.text('route_polyline').nullable()
      table.integer('total_distance_meters').unsigned().nullable()
      table.integer('total_duration_seconds').unsigned().nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
