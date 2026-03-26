import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'route_templates'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.integer('pickup_radius_meters').unsigned().nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('pickup_radius_meters')
    })
  }
}
