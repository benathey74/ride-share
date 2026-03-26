import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'passenger_route_corridor_interests'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table
        .integer('route_template_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('route_templates')
        .onDelete('CASCADE')
      table
        .integer('rider_user_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('users')
        .onDelete('CASCADE')
      table.text('message').nullable()
      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
      table.unique(['route_template_id', 'rider_user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
