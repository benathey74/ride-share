import { Exception } from '@adonisjs/core/exceptions'
import TripInstance from '#models/trip_instance'
import TripMessage from '#models/trip_message'
import TripPassenger from '#models/trip_passenger'
import { TripPassengerStatus } from '#constants/trip'
import PrivacyViewService from '#services/privacy_view_service'
import type { DateTime } from 'luxon'

const privacy = new PrivacyViewService()

export type TripCoordinationMessageDto = {
  id: number
  message: string
  createdAt: string
  /** True when the authenticated user sent this message (no raw user id exposed). */
  fromViewer: boolean
  sender: ReturnType<PrivacyViewService['formatPublicProfile']>
}

export default class ChatService {
  /**
   * Trip coordination chat: driver, confirmed (accepted) passengers, or admins.
   * Pending seat requests alone do not grant access — aligns with “booked trip” coordination.
   */
  async assertCanAccessTrip(
    userId: number,
    tripInstanceId: number,
    opts: { isAdmin?: boolean } = {}
  ) {
    const trip = await TripInstance.find(tripInstanceId)
    if (!trip) {
      throw new Exception('Trip not found', { status: 404 })
    }

    if (opts.isAdmin) {
      return trip
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

  private shapeMessage(row: TripMessage, viewerUserId: number): TripCoordinationMessageDto {
    const createdAt: DateTime = row.createdAt
    return {
      id: row.id,
      message: row.message,
      createdAt: createdAt.toISO() ?? '',
      fromViewer: row.senderUserId === viewerUserId,
      sender: privacy.formatPublicProfile(row.sender.publicProfile ?? null),
    }
  }

  async listMessages(
    viewerUserId: number,
    tripInstanceId: number,
    opts: { isAdmin?: boolean } = {}
  ): Promise<TripCoordinationMessageDto[]> {
    await this.assertCanAccessTrip(viewerUserId, tripInstanceId, opts)

    const messages = await TripMessage.query()
      .where('trip_instance_id', tripInstanceId)
      .preload('sender', (q) => q.preload('publicProfile'))
      .orderBy('created_at', 'asc')

    return messages.map((m) => this.shapeMessage(m, viewerUserId))
  }

  async postMessage(
    viewerUserId: number,
    tripInstanceId: number,
    message: string,
    recipientUserId: number | null,
    opts: { isAdmin?: boolean } = {}
  ): Promise<TripCoordinationMessageDto> {
    await this.assertCanAccessTrip(viewerUserId, tripInstanceId, opts)

    const row = await TripMessage.create({
      tripInstanceId,
      senderUserId: viewerUserId,
      recipientUserId,
      message,
    })

    await row.load('sender', (q) => q.preload('publicProfile'))

    return this.shapeMessage(row, viewerUserId)
  }
}
