import vine from '@vinejs/vine'

export const authRegisterValidator = vine.compile(
  vine.object({
    email: vine.string().trim().email().normalizeEmail().maxLength(254),
    password: vine.string().minLength(8).maxLength(128),
    intendedRole: vine.enum(['passenger', 'driver', 'both'] as const),
  }),
)
