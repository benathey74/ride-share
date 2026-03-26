import ChatService from '#services/chat_service'
import { createChatMessageValidator } from '#validators/chat_message_validator'
import type { HttpContext } from '@adonisjs/core/http'

const chatService = new ChatService()

export default class ChatMessagesController {
  async index({ currentUser, params, serialize }: HttpContext) {
    const tripInstanceId = Number(params.tripId)
    const messages = await chatService.listMessages(currentUser.id, tripInstanceId)
    return serialize({ messages })
  }

  async store({ currentUser, params, request, serialize }: HttpContext) {
    const tripInstanceId = Number(params.tripId)
    const payload = await request.validateUsing(createChatMessageValidator)
    const message = await chatService.postMessage(
      currentUser.id,
      tripInstanceId,
      payload.message,
      payload.recipientUserId ?? null
    )
    return serialize({ message })
  }
}
