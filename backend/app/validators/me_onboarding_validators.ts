import vine from '@vinejs/vine'

const timeHm = vine.string().regex(/^\d{2}:\d{2}$/)

const decimalCoord = vine
  .string()
  .trim()
  .maxLength(32)
  .regex(/^-?\d+(\.\d+)?$/)

const googlePlaceId = vine.string().trim().minLength(1).maxLength(255)

const savedPlaceKind = vine.enum(['home', 'work', 'pickup', 'custom'] as const)

export const putMePassengerProfileValidator = vine.compile(
  vine.object({
    accessibilityNotes: vine.string().trim().maxLength(4000).optional().nullable(),
    usualCommuteDays: vine.array(vine.number().min(0).max(6)).minLength(1),
    preferredMorningTime: timeHm,
    preferredEveningTime: timeHm,
    ridePreferences: vine.string().trim().maxLength(2000).optional().nullable(),
  })
)

export const putMeDriverProfileValidator = vine.compile(
  vine.object({
    vehicleMake: vine.string().trim().minLength(1).maxLength(80),
    vehicleModel: vine.string().trim().minLength(1).maxLength(80),
    vehicleColor: vine.string().trim().minLength(1).maxLength(48),
    plateNumber: vine.string().trim().minLength(2).maxLength(32),
    seatsTotal: vine.number().min(1).max(20),
    detourToleranceMinutes: vine.number().min(0).max(120),
    pickupRadiusMeters: vine.number().min(50).max(5000),
    commuteNotes: vine.string().trim().maxLength(2000).optional().nullable(),
  })
)

export const putMeSavedPlacesValidator = vine.compile(
  vine.object({
    places: vine
      .array(
        vine.object({
          kind: savedPlaceKind,
          label: vine.string().trim().minLength(2).maxLength(255),
          placeId: googlePlaceId,
          lat: decimalCoord,
          lng: decimalCoord,
          isDefault: vine.boolean(),
        })
      )
      .maxLength(32),
  })
)
