import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'trip_requests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('trip_instance_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('trip_instances')
        .onDelete('CASCADE')
      table
        .integer('rider_user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.string('approx_pickup_label', 160).notNullable()
      table.decimal('approx_pickup_lat', 10, 7).notNullable()
      table.decimal('approx_pickup_lng', 10, 7).notNullable()
      table.integer('approx_pickup_radius_meters').unsigned().notNullable().defaultTo(400)
      table.string('exact_pickup_label', 160).nullable()
      table.decimal('exact_pickup_lat', 10, 7).nullable()
      table.decimal('exact_pickup_lng', 10, 7).nullable()
      table.text('message').nullable()
      table.string('status', 32).notNullable().defaultTo('pending')
      table.timestamp('responded_at', { useTz: true }).nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
