import { middleware } from '#start/kernel'
import router from '@adonisjs/core/services/router'
import { controllers } from '#generated/controllers'

const chatStack = [middleware.devIdentity(), middleware.suspended()]

export function registerChatRoutes() {
  router
    .group(() => {
      router.get('/trips/:tripId/messages', [controllers.ChatMessages, 'index'])
      router.post('/trips/:tripId/messages', [controllers.ChatMessages, 'store'])
    })
    .prefix('/api/v1/chat')
    .use(chatStack)
}
