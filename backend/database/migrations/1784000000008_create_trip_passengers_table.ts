import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'trip_passengers'

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
      table
        .integer('trip_request_id')
        .unsigned()
        .nullable()
        .references('id')
        .inTable('trip_requests')
        .onDelete('SET NULL')
      table.string('confirmed_pickup_label', 160).nullable()
      table.decimal('confirmed_pickup_lat', 10, 7).nullable()
      table.decimal('confirmed_pickup_lng', 10, 7).nullable()
      table.integer('seat_count').unsigned().notNullable().defaultTo(1)
      table.string('status', 32).notNullable().defaultTo('confirmed')

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
