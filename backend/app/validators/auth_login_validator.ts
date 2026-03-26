import vine from '@vinejs/vine'

export const authLoginValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().normalizeEmail().maxLength(254),
    password: vine.string().minLength(1).maxLength(128),
  }),
)
