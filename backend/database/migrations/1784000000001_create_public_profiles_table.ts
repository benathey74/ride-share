import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'public_profiles'

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
      table.string('alias', 64).notNullable().unique()
      table.string('avatar', 128).notNullable()
      table.decimal('rating', 3, 2).notNullable().defaultTo('5.00')
      table.integer('completed_trips').unsigned().notNullable().defaultTo(0)
      table.decimal('on_time_score', 4, 3).nullable()

      table.timestamp('created_at', { useTz: true }).notNullable()
      table.timestamp('updated_at', { useTz: true }).nullable()

      table.unique(['user_id'])
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}
