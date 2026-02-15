import { flightRepository } from "../repositories/flight.repository";
import { bookingRepository } from "../repositories/booking.repository";
import { NotFoundError, BadRequestError, ConflictError } from "../utils/errors";
import type { FlightSearchFilters } from "../types/flight.types";
import type { PaginationParams } from "../types/common.types";

export class FlightService {
  async searchFlights(
    filters: FlightSearchFilters,
    pagination: PaginationParams,
  ) {
    const result = await flightRepository.findAll(filters, pagination);

    // Calculate lowest price for each flight
    const flightsWithLowestPrice = result.data.map((flight) => {
      const lowestPrice =
        (flight as unknown as { fares: { price: number }[] }).fares.length > 0
          ? Math.min(
              ...(
                flight as unknown as { fares: { price: number }[] }
              ).fares.map((f) => Number(f.price)),
            )
          : 0;

      return {
        flight,
        availableFares: (flight as unknown as { fares: { price: number }[] })
          .fares,
        lowestPrice,
      };
    });

    // Sort by price if requested
    if (filters.sortBy === "price") {
      flightsWithLowestPrice.sort((a, b) => {
        const comparison = a.lowestPrice - b.lowestPrice;
        return filters.sortOrder === "desc" ? -comparison : comparison;
      });
    }

    return {
      data: flightsWithLowestPrice,
      pagination: result.pagination,
    };
  }

  async getFlightById(id: string) {
    const flight = await flightRepository.findById(id);
    if (!flight) {
      throw new NotFoundError("Flight", id);
    }
    return flight;
  }

  async checkAvailability(
    flightId: string,
    fareClass: string,
    passengers: number,
  ) {
    const fare = await flightRepository.getFareByFlightAndClass(
      flightId,
      fareClass,
    );

    if (!fare) {
      throw new NotFoundError("Fare class", `${flightId}-${fareClass}`);
    }

    if (fare.seatsAvailable < passengers) {
      throw new ConflictError(
        `Only ${fare.seatsAvailable} seats available in ${fareClass}`,
      );
    }

    return {
      available: true,
      pricePerPerson: Number(fare.price),
      totalPrice: Number(fare.price) * passengers,
      fare,
    };
  }

  async createBooking(input: {
    userId: string;
    flightId: string;
    fareClass: string;
    passengers: number;
    passengerDetails?: Record<string, unknown>;
  }) {
    // Verify flight exists
    const flight = await flightRepository.findById(input.flightId);
    if (!flight) {
      throw new NotFoundError("Flight", input.flightId);
    }

    // Check if flight has already departed
    if (new Date(flight.departureTime) < new Date()) {
      throw new BadRequestError("Flight has already departed");
    }

    // Check availability
    const availability = await this.checkAvailability(
      input.flightId,
      input.fareClass,
      input.passengers,
    );

    // Create booking
    const booking = await bookingRepository.createFlightBooking({
      userId: input.userId,
      flightId: input.flightId,
      fareClass: input.fareClass,
      passengers: input.passengers,
      passengerDetails: input.passengerDetails,
      totalPrice: availability.totalPrice,
    });

    return booking;
  }
}

export const flightService = new FlightService();
