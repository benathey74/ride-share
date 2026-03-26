import vine from '@vinejs/vine'

export const createChatMessageValidator = vine.compile(
  vine.object({
    message: vine.string().trim().minLength(1).maxLength(4000),
    recipientUserId: vine.number().withoutDecimals().positive().optional().nullable(),
  })
)
