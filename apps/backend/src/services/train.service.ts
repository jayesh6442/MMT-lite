import { trainRepository } from "../repositories/train.repository";
import { bookingRepository } from "../repositories/booking.repository";
import { NotFoundError, BadRequestError, ConflictError } from "../utils/errors";
import type { TrainSearchFilters } from "../types/train.types";
import type { PaginationParams } from "../types/common.types";

export class TrainService {
  async searchTrains(
    filters: TrainSearchFilters,
    pagination: PaginationParams,
  ) {
    const result = await trainRepository.findAll(filters, pagination);

    // Calculate lowest price for each train
    const trainsWithLowestPrice = result.data.map((train) => {
      const lowestPrice =
        (train as unknown as { classes: { price: number }[] }).classes.length >
        0
          ? Math.min(
              ...(
                train as unknown as { classes: { price: number }[] }
              ).classes.map((c) => Number(c.price)),
            )
          : 0;

      return {
        train,
        availableClasses: (train as unknown as { classes: { price: number }[] })
          .classes,
        lowestPrice,
      };
    });

    return {
      data: trainsWithLowestPrice,
      pagination: result.pagination,
    };
  }

  async getTrainById(id: string) {
    const train = await trainRepository.findById(id);
    if (!train) {
      throw new NotFoundError("Train", id);
    }
    return train;
  }

  async checkAvailability(
    trainId: string,
    classType: string,
    passengers: number,
  ) {
    const trainClass = await trainRepository.getClassByTrainAndType(
      trainId,
      classType,
    );

    if (!trainClass) {
      throw new NotFoundError("Train class", `${trainId}-${classType}`);
    }

    if (trainClass.seatsAvailable < passengers) {
      throw new ConflictError(
        `Only ${trainClass.seatsAvailable} seats available in ${classType}`,
      );
    }

    return {
      available: true,
      pricePerPerson: Number(trainClass.price),
      totalPrice: Number(trainClass.price) * passengers,
      trainClass,
    };
  }

  async createBooking(input: {
    userId: string;
    trainId: string;
    classType: string;
    passengers: number;
    passengerDetails?: Record<string, unknown>;
  }) {
    // Verify train exists
    const train = await trainRepository.findById(input.trainId);
    if (!train) {
      throw new NotFoundError("Train", input.trainId);
    }

    // Check if train has already departed
    if (new Date(train.departureTime) < new Date()) {
      throw new BadRequestError("Train has already departed");
    }

    // Check availability
    const availability = await this.checkAvailability(
      input.trainId,
      input.classType,
      input.passengers,
    );

    // Generate PNR number (10 alphanumeric characters)
    const pnrNumber = this.generatePNR();

    // Create booking
    const booking = await bookingRepository.createTrainBooking({
      userId: input.userId,
      trainId: input.trainId,
      classType: input.classType,
      passengers: input.passengers,
      passengerDetails: input.passengerDetails,
      totalPrice: availability.totalPrice,
    });

    // Update booking with PNR
    await bookingRepository.updateTrainBookingStatus(booking.id, "CONFIRMED");

    return {
      ...booking,
      pnrNumber,
    };
  }

  private generatePNR(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let pnr = "";
    for (let i = 0; i < 10; i++) {
      pnr += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pnr;
  }
}

export const trainService = new TrainService();
