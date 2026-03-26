import vine from '@vinejs/vine'

const scheduleRow = vine.object({
  dayOfWeek: vine.number().withoutDecimals().min(0).max(6),
  isActive: vine.boolean().optional(),
})

export const createRouteTemplateValidator = vine.compile(
  vine.object({
    originLabel: vine.string().trim().minLength(2).maxLength(160),
    destinationLabel: vine.string().trim().minLength(2).maxLength(160),
    originPlaceId: vine.string().trim().maxLength(255).optional().nullable(),
    destinationPlaceId: vine.string().trim().maxLength(255).optional().nullable(),
    originLat: vine.string().trim().maxLength(32),
    originLng: vine.string().trim().maxLength(32),
    destinationLat: vine.string().trim().maxLength(32),
    destinationLng: vine.string().trim().maxLength(32),
    scheduleType: vine.string().trim().maxLength(32),
    departureTime: vine
      .string()
      .trim()
      .regex(/^\d{2}:\d{2}(:\d{2})?$/),
    seatsTotal: vine.number().withoutDecimals().min(1).max(20).optional(),
    detourToleranceMinutes: vine.number().withoutDecimals().min(0).max(120).optional(),
    pickupRadiusMeters: vine.number().withoutDecimals().min(50).max(5000).optional(),
    status: vine.string().trim().maxLength(32).optional(),
    schedules: vine.array(scheduleRow).optional(),
  })
)
