import vine from '@vinejs/vine'

export const adminOptionalReasonValidator = vine.compile(
  vine.object({
    reason: vine.string().trim().maxLength(2000).optional(),
  })
)
