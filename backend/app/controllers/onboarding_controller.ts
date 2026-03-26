import OnboardingService from '#services/onboarding_service'
import SavedPlacesService from '#services/saved_places_service'
import { putMeSavedPlacesValidator } from '#validators/me_onboarding_validators'
import type { HttpContext } from '@adonisjs/core/http'

const onboardingService = new OnboardingService()
const savedPlacesService = new SavedPlacesService()

export default class OnboardingController {
  /** GET /api/v1/me/onboarding */
  async show({ currentUser, serialize }: HttpContext) {
    const onboarding = await onboardingService.getSnapshot(currentUser.id)
    return serialize({ onboarding })
  }

  /** GET /api/v1/me/saved-places */
  async savedPlacesIndex({ currentUser, serialize }: HttpContext) {
    const savedPlaces = await savedPlacesService.listForUser(currentUser.id)
    return serialize({ savedPlaces })
  }

  /** PUT /api/v1/me/saved-places — full replace */
  async savedPlacesReplace({ currentUser, request, serialize }: HttpContext) {
    const payload = await request.validateUsing(putMeSavedPlacesValidator)
    const savedPlaces = await savedPlacesService.replaceForUser(currentUser.id, payload.places)
    return serialize({ savedPlaces })
  }
}
