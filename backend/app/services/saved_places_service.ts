import db from '@adonisjs/lucid/services/db'
import { Exception } from '@adonisjs/core/exceptions'
import { SavedPlaceKind } from '#constants/saved_place'
import SavedPlace from '#models/saved_place'

export type SavedPlaceInput = {
  kind: string
  label: string
  placeId: string
  lat: string
  lng: string
  isDefault: boolean
}

const KIND_ORDER: Record<string, number> = {
  [SavedPlaceKind.HOME]: 0,
  [SavedPlaceKind.WORK]: 1,
  [SavedPlaceKind.PICKUP]: 2,
  [SavedPlaceKind.CUSTOM]: 3,
}

/**
 * Owner-only saved locations (Google Places ids + coordinates). Not exposed in public DTOs.
 */
export default class SavedPlacesService {
  formatRow(row: SavedPlace) {
    return {
      id: row.id,
      kind: row.kind,
      label: row.label,
      placeId: row.placeId,
      lat: row.lat,
      lng: row.lng,
      isDefault: row.isDefault,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    }
  }

  async listForUser(userId: number) {
    const rows = await SavedPlace.query().where('userId', userId).orderBy('id', 'asc')
    return rows
      .sort((a, b) => (KIND_ORDER[a.kind] ?? 9) - (KIND_ORDER[b.kind] ?? 9) || a.id - b.id)
      .map((r) => this.formatRow(r))
  }

  /**
   * Validates shape: at most one row each for `home` and `work`; `custom` may repeat.
   */
  private assertPlaceRules(places: SavedPlaceInput[]) {
    const homes = places.filter((p) => p.kind === SavedPlaceKind.HOME)
    const works = places.filter((p) => p.kind === SavedPlaceKind.WORK)
    if (homes.length > 1) {
      throw new Exception('At most one home place is allowed', { status: 422 })
    }
    if (works.length > 1) {
      throw new Exception('At most one work place is allowed', { status: 422 })
    }
  }

  /**
   * Full replace of the user’s saved places (matches PUT semantics).
   */
  async replaceForUser(userId: number, places: SavedPlaceInput[]) {
    this.assertPlaceRules(places)

    const trx = await db.transaction()
    try {
      await SavedPlace.query({ client: trx }).where('userId', userId).delete()

      if (places.length > 0) {
        await SavedPlace.createMany(
          places.map((p) => ({
            userId,
            kind: p.kind,
            label: p.label.trim(),
            placeId: p.placeId.trim(),
            lat: p.lat.trim(),
            lng: p.lng.trim(),
            isDefault: p.isDefault,
          })),
          { client: trx }
        )
      }

      await trx.commit()
    } catch (e) {
      await trx.rollback()
      throw e
    }

    return this.listForUser(userId)
  }
}
