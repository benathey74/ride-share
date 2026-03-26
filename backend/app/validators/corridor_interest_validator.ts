import vine from '@vinejs/vine'

export const expressCorridorInterestValidator = vine.compile(
  vine.object({
    message: vine.string().trim().maxLength(2000).optional(),
  })
)
