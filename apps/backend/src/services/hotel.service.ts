import { hotelRepository } from "../repositories/hotel.repository";
import { bookingRepository } from "../repositories/booking.repository";
import { NotFoundError, BadRequestError, ConflictError } from "../utils/errors";
import type {
  HotelSearchFilters,
  HotelSearchResult,
  RoomAvailability,
} from "../types/hotel.types";
import type { PaginationParams } from "../types/common.types";
import type { Room, RoomRate } from "@repo/database";

interface RoomWithRates extends Room {
  rates: RoomRate[];
}

interface HotelWithRooms {
  id: string;
  rooms: RoomWithRates[];
  [key: string]: unknown;
}

export class HotelService {
  async searchHotels(
    filters: HotelSearchFilters,
    pagination: PaginationParams,
  ) {
    const { checkInDate, checkOutDate } = filters;

    // Validate dates
    if (checkInDate && checkOutDate) {
      if (new Date(checkInDate) >= new Date(checkOutDate)) {
        throw new BadRequestError("Check-out date must be after check-in date");
      }
    }

    const result = await hotelRepository.findAll(filters, pagination);

    // Calculate availability and pricing for each hotel
    const hotelsWithAvailability: HotelSearchResult[] = result.data.map(
      (hotel) => {
        const hotelWithRooms = hotel as unknown as HotelWithRooms;
        const rooms: RoomAvailability[] = hotelWithRooms.rooms.map(
          (room: RoomWithRates) => {
            let totalPrice = 0;
            let available = true;
            let ratePerNight = 0;

            if (
              checkInDate &&
              checkOutDate &&
              room.rates &&
              room.rates.length > 0
            ) {
              const checkIn = new Date(checkInDate);
              const checkOut = new Date(checkOutDate);
              const nights = Math.ceil(
                (checkOut.getTime() - checkIn.getTime()) /
                  (1000 * 60 * 60 * 24),
              );

              // For simplicity, use the lowest rate
              ratePerNight = Number(room.rates[0]?.price ?? 0);
              totalPrice = ratePerNight * nights;
            } else if (room.rates && room.rates.length > 0) {
              ratePerNight = Number(room.rates[0]?.price ?? 0);
            }

            return {
              room,
              totalPrice,
              available,
              ratePerNight,
            };
          },
        );

        const lowestPrice =
          rooms.length > 0
            ? Math.min(...rooms.map((r) => r.ratePerNight).filter((p) => p > 0))
            : null;

        return {
          hotel,
          rooms,
          lowestPrice,
        };
      },
    );

    return {
      data: hotelsWithAvailability,
      pagination: result.pagination,
    };
  }

  async getHotelById(id: string) {
    const hotel = await hotelRepository.findById(id);
    if (!hotel) {
      throw new NotFoundError("Hotel", id);
    }
    return hotel;
  }

  async checkRoomAvailability(
    roomId: string,
    checkInDate: Date,
    checkOutDate: Date,
    guests: number,
  ) {
    const nights = Math.ceil(
      (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24),
    );

    if (nights <= 0) {
      throw new BadRequestError("Check-out date must be after check-in date");
    }

    const rates = await hotelRepository.getRoomRatesForDates(
      roomId,
      checkInDate,
      checkOutDate,
    );

    // Check if we have rates for all nights
    if (rates.length < nights) {
      throw new BadRequestError("Room not available for selected dates");
    }

    // Check availability for each night
    const unavailableDates = rates.filter((r) => r.available < 1);
    if (unavailableDates.length > 0) {
      throw new ConflictError("Room not available for selected dates");
    }

    const totalPrice = rates.reduce((sum, rate) => sum + Number(rate.price), 0);

    return {
      available: true,
      totalPrice,
      nights,
    };
  }

  async createBooking(input: {
    userId: string;
    hotelId: string;
    roomId: string;
    checkInDate: Date;
    checkOutDate: Date;
    guests: number;
    guestDetails?: Record<string, unknown>;
    specialRequests?: string;
  }) {
    // Verify hotel exists
    const hotel = await hotelRepository.findById(input.hotelId);
    if (!hotel) {
      throw new NotFoundError("Hotel", input.hotelId);
    }

    const hotelWithRooms = hotel as unknown as HotelWithRooms;

    // Verify room exists and belongs to hotel
    const room = hotelWithRooms.rooms.find((r: Room) => r.id === input.roomId);
    if (!room) {
      throw new NotFoundError("Room", input.roomId);
    }

    // Check room capacity
    if (input.guests > room.maxGuests) {
      throw new BadRequestError(
        `Room maximum capacity is ${room.maxGuests} guests`,
      );
    }

    // Check availability and calculate price
    const availability = await this.checkRoomAvailability(
      input.roomId,
      input.checkInDate,
      input.checkOutDate,
      input.guests,
    );

    // Create booking
    const booking = await bookingRepository.createHotelBooking({
      userId: input.userId,
      hotelId: input.hotelId,
      roomId: input.roomId,
      checkInDate: input.checkInDate,
      checkOutDate: input.checkOutDate,
      guests: input.guests,
      guestDetails: input.guestDetails,
      totalPrice: availability.totalPrice,
      specialRequests: input.specialRequests,
    });

    return booking;
  }
}

export const hotelService = new HotelService();
