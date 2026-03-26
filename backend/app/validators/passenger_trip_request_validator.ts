import vine from '@vinejs/vine'

export const createTripRequestValidator = vine.compile(
  vine.object({
    tripInstanceId: vine.number().withoutDecimals().positive(),
    approxPickupLabel: vine.string().trim().minLength(2).maxLength(160),
    approxPickupLat: vine.string().trim().maxLength(32),
    approxPickupLng: vine.string().trim().maxLength(32),
    approxPickupRadiusMeters: vine.number().withoutDecimals().min(50).max(5000).optional(),
    message: vine.string().trim().maxLength(2000).optional().nullable(),
  })
)
