import { prisma } from "@repo/database";
import type {
  HotelBooking,
  FlightBooking,
  TrainBooking,
  BookingStatus,
  PaymentStatus,
  Prisma,
  FareClass,
  TrainClassType,
} from "@repo/database";
import type { PaginatedResult, PaginationParams } from "../types/common.types";

export class BookingRepository {
  // Hotel Bookings
  async createHotelBooking(data: {
    userId: string;
    hotelId: string;
    roomId: string;
    checkInDate: Date;
    checkOutDate: Date;
    guests: number;
    guestDetails?: Record<string, unknown>;
    totalPrice: number;
    specialRequests?: string;
  }): Promise<HotelBooking> {
    return prisma.hotelBooking.create({
      data: {
        userId: data.userId,
        hotelId: data.hotelId,
        roomId: data.roomId,
        checkInDate: data.checkInDate,
        checkOutDate: data.checkOutDate,
        guests: data.guests,
        guestDetails: data.guestDetails as Prisma.InputJsonValue,
        totalPrice: data.totalPrice,
        specialRequests: data.specialRequests,
        status: "PENDING" as BookingStatus,
        paymentStatus: "PENDING" as PaymentStatus,
      },
    });
  }

  async findHotelBookingById(id: string) {
    return prisma.hotelBooking.findUnique({
      where: { id },
      include: {
        hotel: true,
        payment: true,
      },
    });
  }

  async findHotelBookingsByUser(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<HotelBooking>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.hotelBooking.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          hotel: {
            select: {
              id: true,
              name: true,
              city: true,
              images: true,
            },
          },
        },
      }),
      prisma.hotelBooking.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // Flight Bookings
  async createFlightBooking(data: {
    userId: string;
    flightId: string;
    fareClass: string;
    passengers: number;
    passengerDetails?: Record<string, unknown>;
    totalPrice: number;
  }): Promise<FlightBooking> {
    return prisma.flightBooking.create({
      data: {
        userId: data.userId,
        flightId: data.flightId,
        fareClass: data.fareClass as FareClass,
        passengers: data.passengers,
        passengerDetails: data.passengerDetails as Prisma.InputJsonValue,
        totalPrice: data.totalPrice,
        status: "PENDING" as BookingStatus,
        paymentStatus: "PENDING" as PaymentStatus,
      },
    });
  }

  async findFlightBookingById(id: string) {
    return prisma.flightBooking.findUnique({
      where: { id },
      include: {
        flight: true,
        payment: true,
      },
    });
  }

  async findFlightBookingsByUser(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<FlightBooking>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.flightBooking.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          flight: {
            select: {
              id: true,
              flightNumber: true,
              airline: true,
              fromCity: true,
              toCity: true,
              departureTime: true,
              arrivalTime: true,
            },
          },
        },
      }),
      prisma.flightBooking.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // Train Bookings
  async createTrainBooking(data: {
    userId: string;
    trainId: string;
    classType: string;
    passengers: number;
    passengerDetails?: Record<string, unknown>;
    totalPrice: number;
  }): Promise<TrainBooking> {
    return prisma.trainBooking.create({
      data: {
        userId: data.userId,
        trainId: data.trainId,
        classType: data.classType as TrainClassType,
        passengers: data.passengers,
        passengerDetails: data.passengerDetails as Prisma.InputJsonValue,
        totalPrice: data.totalPrice,
        status: "PENDING" as BookingStatus,
        paymentStatus: "PENDING" as PaymentStatus,
      },
    });
  }

  async findTrainBookingById(id: string) {
    return prisma.trainBooking.findUnique({
      where: { id },
      include: {
        train: true,
        payment: true,
      },
    });
  }

  async findTrainBookingsByUser(
    userId: string,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<TrainBooking>> {
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const [bookings, total] = await Promise.all([
      prisma.trainBooking.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          train: {
            select: {
              id: true,
              trainNumber: true,
              trainName: true,
              fromCity: true,
              toCity: true,
              departureTime: true,
              arrivalTime: true,
            },
          },
        },
      }),
      prisma.trainBooking.count({ where: { userId } }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: bookings,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  // Update booking status
  async updateHotelBookingStatus(
    id: string,
    status: BookingStatus,
    paymentStatus?: PaymentStatus,
  ) {
    return prisma.hotelBooking.update({
      where: { id },
      data: {
        status,
        ...(paymentStatus && { paymentStatus }),
      },
    });
  }

  async updateFlightBookingStatus(
    id: string,
    status: BookingStatus,
    paymentStatus?: PaymentStatus,
  ) {
    return prisma.flightBooking.update({
      where: { id },
      data: {
        status,
        ...(paymentStatus && { paymentStatus }),
      },
    });
  }

  async updateTrainBookingStatus(
    id: string,
    status: BookingStatus,
    paymentStatus?: PaymentStatus,
  ) {
    return prisma.trainBooking.update({
      where: { id },
      data: {
        status,
        ...(paymentStatus && { paymentStatus }),
      },
    });
  }
}

export const bookingRepository = new BookingRepository();
