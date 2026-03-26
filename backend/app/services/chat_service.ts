import { Exception } from '@adonisjs/core/exceptions'
import TripInstance from '#models/trip_instance'
import TripMessage from '#models/trip_message'
import TripPassenger from '#models/trip_passenger'
import { TripPassengerStatus } from '#constants/trip'
import PrivacyViewService from '#services/privacy_view_service'

const privacy = new PrivacyViewService()

export default class ChatService {
  async assertCanAccessTrip(userId: number, tripInstanceId: number) {
    const trip = await TripInstance.find(tripInstanceId)
    if (!trip) {
      throw new Exception('Trip not found', { status: 404 })
    }

    if (trip.driverUserId === userId) {
      return trip
    }

    const passenger = await TripPassenger.query()
      .where('trip_instance_id', tripInstanceId)
      .where('rider_user_id', userId)
      .where('status', TripPassengerStatus.CONFIRMED)
      .first()

    if (!passenger) {
      throw new Exception('Not allowed to access this trip chat', { status: 403 })
    }

    return trip
  }

  async listMessages(userId: number, tripInstanceId: number) {
    await this.assertCanAccessTrip(userId, tripInstanceId)

    const messages = await TripMessage.query()
      .where('trip_instance_id', tripInstanceId)
      .preload('sender', (q) => q.preload('publicProfile'))
      .orderBy('created_at', 'asc')

    return messages.map((m) => ({
      id: m.id,
      message: m.message,
      createdAt: m.createdAt,
      recipientUserId: m.recipientUserId,
      sender: privacy.formatPublicProfile(m.sender.publicProfile ?? null),
    }))
  }

  async postMessage(
    userId: number,
    tripInstanceId: number,
    message: string,
    recipientUserId: number | null
  ) {
    await this.assertCanAccessTrip(userId, tripInstanceId)

    const row = await TripMessage.create({
      tripInstanceId,
      senderUserId: userId,
      recipientUserId,
      message,
    })

    await row.load('sender', (q) => q.preload('publicProfile'))

    return {
      id: row.id,
      message: row.message,
      createdAt: row.createdAt,
      recipientUserId: row.recipientUserId,
      sender: privacy.formatPublicProfile(row.sender.publicProfile ?? null),
    }
  }
}
