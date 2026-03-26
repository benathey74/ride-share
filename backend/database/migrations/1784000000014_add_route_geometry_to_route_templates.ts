import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'route_templates'

  async up() {
    this.schema.alterTable(this.tableName, (table) => {
      table.text('route_polyline').nullable()
      table.integer('total_distance_meters').unsigned().nullable()
      table.integer('total_duration_seconds').unsigned().nullable()
    })
  }

  async down() {
    this.schema.alterTable(this.tableName, (table) => {
      table.dropColumn('route_polyline')
      table.dropColumn('total_distance_meters')
      table.dropColumn('total_duration_seconds')
    })
  }
}
