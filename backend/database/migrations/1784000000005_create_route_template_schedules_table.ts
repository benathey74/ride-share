import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'route_template_schedules'

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
      table.smallint('day_of_week').notNullable()
      table.boolean('is_active').notNullable().defaultTo(true)

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.unique(['route_template_id', 'day_of_week'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
