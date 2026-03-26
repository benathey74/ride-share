import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { DateTime } from 'luxon'
import {
  DriverApprovalStatus,
  RouteTemplateStatus,
  TripInstanceStatus,
  TripRequestStatus,
  TripPassengerStatus,
  UserStatus,
} from '#constants/trip'
import DriverProfile from '#models/driver_profile'
import PassengerProfile from '#models/passenger_profile'
import PublicProfile from '#models/public_profile'
import RouteTemplate from '#models/route_template'
import RouteTemplateSchedule from '#models/route_template_schedule'
import TripInstance from '#models/trip_instance'
import TripMessage from '#models/trip_message'
import TripPassenger from '#models/trip_passenger'
import TripRequest from '#models/trip_request'
import User from '#models/user'
import { hydrateRouteTemplateGeometry } from '#services/route_template_geometry_hydrator'

export default class extends BaseSeeder {
  async run() {
    const admin = await User.create({
      email: 'admin@rides.local',
      password: 'Admin123!',
      realName: 'Internal Admin',
      phone: null,
      status: UserStatus.ACTIVE,
      canDrive: true,
      canRide: true,
      isAdmin: true,
      onboardingCompletedAt: DateTime.utc(),
    })
    await PublicProfile.create({
      userId: admin.id,
      alias: 'admin-nova',
      avatar: '🛡️',
      rating: '5.00',
      completedTrips: 0,
      onTimeScore: null,
    })
    await PassengerProfile.create({ userId: admin.id })

    const host = await User.create({
      email: 'host@rides.local',
      password: 'Host123!',
      realName: 'Driver Host',
      phone: null,
      status: UserStatus.ACTIVE,
      canDrive: true,
      canRide: true,
      isAdmin: false,
      onboardingCompletedAt: DateTime.utc(),
    })
    await PublicProfile.create({
      userId: host.id,
      alias: 'mint-heron',
      avatar: '🌿',
      rating: '4.90',
      completedTrips: 12,
      onTimeScore: '0.920',
    })
    await PassengerProfile.create({ userId: host.id })
    await DriverProfile.create({
      userId: host.id,
      vehicleMake: 'Toyota',
      vehicleModel: 'Innova',
      vehicleColor: 'Blue',
      plateNumber: 'ABC-1234',
      seatsTotal: 4,
      detourToleranceMinutes: 12,
      approvalStatus: DriverApprovalStatus.APPROVED,
    })

    const riderA = await User.create({
      email: 'rider-a@rides.local',
      password: 'RiderA123!',
      realName: 'Rider A',
      phone: null,
      status: UserStatus.ACTIVE,
      canDrive: false,
      canRide: true,
      isAdmin: false,
      onboardingCompletedAt: DateTime.utc(),
    })
    await PublicProfile.create({
      userId: riderA.id,
      alias: 'signal-otter',
      avatar: '🎧',
      rating: '5.00',
      completedTrips: 3,
      onTimeScore: null,
    })
    await PassengerProfile.create({ userId: riderA.id })

    const riderB = await User.create({
      email: 'rider-b@rides.local',
      password: 'RiderB123!',
      realName: 'Rider B',
      phone: null,
      status: UserStatus.ACTIVE,
      canDrive: false,
      canRide: true,
      isAdmin: false,
      onboardingCompletedAt: DateTime.utc(),
    })
    await PublicProfile.create({
      userId: riderB.id,
      alias: 'amber-kite',
      avatar: '🪁',
      rating: '5.00',
      completedTrips: 1,
      onTimeScore: null,
    })
    await PassengerProfile.create({ userId: riderB.id })

    const templateOrtigas = await RouteTemplate.create({
      driverUserId: host.id,
      originLabel: 'Ortigas',
      destinationLabel: 'BGC High Street',
      originPlaceId: null,
      destinationPlaceId: null,
      originLat: '14.6094000',
      originLng: '121.0792000',
      destinationLat: '14.5547000',
      destinationLng: '121.0244000',
      scheduleType: 'recurring',
      departureTime: '17:10:00',
      seatsTotal: 2,
      detourToleranceMinutes: 10,
      status: RouteTemplateStatus.ACTIVE,
      pickupRadiusMeters: 450,
    })

    await RouteTemplateSchedule.create({
      routeTemplateId: templateOrtigas.id,
      dayOfWeek: 1,
      isActive: true,
    })
    await hydrateRouteTemplateGeometry(templateOrtigas)

    const templateMakati = await RouteTemplate.create({
      driverUserId: host.id,
      originLabel: 'Makati Ave',
      destinationLabel: 'Quezon City Hub',
      originPlaceId: null,
      destinationPlaceId: null,
      originLat: '14.5547000',
      originLng: '121.0244000',
      destinationLat: '14.6760000',
      destinationLng: '121.0437000',
      scheduleType: 'recurring',
      departureTime: '07:10:00',
      seatsTotal: 3,
      detourToleranceMinutes: 15,
      status: RouteTemplateStatus.ACTIVE,
    })

    await RouteTemplateSchedule.create({
      routeTemplateId: templateMakati.id,
      dayOfWeek: 2,
      isActive: true,
    })
    await hydrateRouteTemplateGeometry(templateMakati)

    /** Match driver dashboard `trip_date = today` filter so alpha testers see trips under "Today's trips". */
    const tripDay = DateTime.utc().startOf('day')

    const tripA = await TripInstance.create({
      routeTemplateId: templateOrtigas.id,
      driverUserId: host.id,
      tripDate: tripDay,
      departureTime: '17:10:00',
      seatsTotal: 2,
      seatsRemaining: 2,
      routeStatus: TripInstanceStatus.SCHEDULED,
      exactPickupUnlocked: false,
      routePolyline: templateOrtigas.routePolyline,
      totalDistanceMeters: templateOrtigas.totalDistanceMeters,
      totalDurationSeconds: templateOrtigas.totalDurationSeconds,
    })

    const tripB = await TripInstance.create({
      routeTemplateId: templateMakati.id,
      driverUserId: host.id,
      tripDate: tripDay,
      departureTime: '07:10:00',
      seatsTotal: 3,
      seatsRemaining: 2,
      routeStatus: TripInstanceStatus.SCHEDULED,
      exactPickupUnlocked: true,
      routePolyline: templateMakati.routePolyline,
      totalDistanceMeters: templateMakati.totalDistanceMeters,
      totalDurationSeconds: templateMakati.totalDurationSeconds,
    })

    await TripRequest.create({
      tripInstanceId: tripA.id,
      riderUserId: riderA.id,
      status: TripRequestStatus.PENDING,
      approxPickupLabel: 'BGC',
      approxPickupLat: '14.5500000',
      approxPickupLng: '121.0300000',
      approxPickupRadiusMeters: 300,
      exactPickupLabel: null,
      exactPickupLat: null,
      exactPickupLng: null,
      message: 'Can pick up near High Street.',
    })

    const acceptedRequest = await TripRequest.create({
      tripInstanceId: tripB.id,
      riderUserId: riderB.id,
      status: TripRequestStatus.ACCEPTED,
      approxPickupLabel: 'Makati Ave',
      approxPickupLat: '14.5520000',
      approxPickupLng: '121.0280000',
      approxPickupRadiusMeters: 500,
      exactPickupLabel: 'Makati Ave — tower lobby',
      exactPickupLat: '14.5520000',
      exactPickupLng: '121.0280000',
      message: null,
      respondedAt: DateTime.utc(),
    })

    await TripPassenger.create({
      tripInstanceId: tripB.id,
      riderUserId: riderB.id,
      tripRequestId: acceptedRequest.id,
      status: TripPassengerStatus.CONFIRMED,
      seatCount: 1,
      confirmedPickupLabel: acceptedRequest.exactPickupLabel,
      confirmedPickupLat: acceptedRequest.exactPickupLat,
      confirmedPickupLng: acceptedRequest.exactPickupLng,
    })

    await TripMessage.create({
      tripInstanceId: tripB.id,
      senderUserId: host.id,
      recipientUserId: null,
      message: 'See you at the pickup zone — alias-only in chat, please.',
    })
  }
}
