import vine from '@vinejs/vine'

export const patchMeProfileValidator = vine.compile(
  vine.object({
    realName: vine.string().trim().maxLength(255).optional().nullable(),
    phone: vine.string().trim().maxLength(32).optional().nullable(),
    accessibilityNotes: vine.string().trim().maxLength(4000).optional().nullable(),
    departmentTeam: vine.string().trim().maxLength(120).optional().nullable(),
    emergencyContactName: vine.string().trim().maxLength(120).optional().nullable(),
    emergencyContactPhone: vine.string().trim().maxLength(32).optional().nullable(),
    /** When true, sets `onboarding_completed_at` to now (idempotent if already set). */
    completeOnboarding: vine.boolean().optional(),
  })
)

export const patchMePublicProfileValidator = vine.compile(
  vine.object({
    alias: vine
      .string()
      .trim()
      .minLength(3)
      .maxLength(64)
      .regex(/^[a-z0-9-]+$/)
      .optional(),
    avatar: vine.string().trim().minLength(1).maxLength(128).optional(),
  })
)
