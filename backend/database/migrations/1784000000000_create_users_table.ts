import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id').notNullable()
      table.string('email', 254).notNullable().unique()
      table.string('real_name', 255).nullable()
      table.string('phone', 32).nullable()
      table.string('status', 32).notNullable().defaultTo('active')
      table.boolean('can_drive').notNullable().defaultTo(false)
      table.boolean('can_ride').notNullable().defaultTo(true)
      table.boolean('is_admin').notNullable().defaultTo(false)

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
