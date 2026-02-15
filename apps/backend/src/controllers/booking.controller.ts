import type { Request, Response, NextFunction } from "express";
import { bookingRepository } from "../repositories/booking.repository";
import { NotFoundError, BadRequestError } from "../utils/errors";
import type { AuthenticatedUser } from "../types/common.types";

export class BookingController {
  async getAllBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthenticatedUser;
      const { type, page, limit } = req.query;

      const pagination = {
        page: page ? parseInt(page as string) : 1,
        limit: limit ? parseInt(limit as string) : 10,
      };

      let bookings: unknown[] = [];
      let total = 0;

      // Fetch bookings based on type
      switch (type) {
        case "HOTEL":
          const hotelResult = await bookingRepository.findHotelBookingsByUser(
            user.id,
            pagination,
          );
          bookings = hotelResult.data;
          total = hotelResult.pagination.total;
          break;
        case "FLIGHT":
          const flightResult = await bookingRepository.findFlightBookingsByUser(
            user.id,
            pagination,
          );
          bookings = flightResult.data;
          total = flightResult.pagination.total;
          break;
        case "TRAIN":
          const trainResult = await bookingRepository.findTrainBookingsByUser(
            user.id,
            pagination,
          );
          bookings = trainResult.data;
          total = trainResult.pagination.total;
          break;
        default:
          // Get all types
          const [hotelBookings, flightBookings, trainBookings] =
            await Promise.all([
              bookingRepository.findHotelBookingsByUser(user.id, pagination),
              bookingRepository.findFlightBookingsByUser(user.id, pagination),
              bookingRepository.findTrainBookingsByUser(user.id, pagination),
            ]);

          bookings = [
            ...hotelBookings.data.map((b) => ({ ...b, type: "HOTEL" })),
            ...flightBookings.data.map((b) => ({ ...b, type: "FLIGHT" })),
            ...trainBookings.data.map((b) => ({ ...b, type: "TRAIN" })),
          ].sort(
            (a: { createdAt: Date }, b: { createdAt: Date }) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
          );

          total =
            hotelBookings.pagination.total +
            flightBookings.pagination.total +
            trainBookings.pagination.total;
      }

      res.json({
        success: true,
        data: bookings,
        pagination: {
          total,
          page: pagination.page,
          limit: pagination.limit,
          totalPages: Math.ceil(total / pagination.limit),
        },
      });
    } catch (error) {
      next(error);
    }
  }

  async getBookingById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const bookingId = id as string;

      // Try to find in each booking type
      const hotelBooking =
        await bookingRepository.findHotelBookingById(bookingId);
      if (hotelBooking) {
        res.json({
          success: true,
          data: { ...hotelBooking, type: "HOTEL" },
        });
        return;
      }

      const flightBooking =
        await bookingRepository.findFlightBookingById(bookingId);
      if (flightBooking) {
        res.json({
          success: true,
          data: { ...flightBooking, type: "FLIGHT" },
        });
        return;
      }

      const trainBooking =
        await bookingRepository.findTrainBookingById(bookingId);
      if (trainBooking) {
        res.json({
          success: true,
          data: { ...trainBooking, type: "TRAIN" },
        });
        return;
      }

      throw new NotFoundError("Booking", bookingId);
    } catch (error) {
      next(error);
    }
  }

  async cancelBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const bookingId = id as string;

      // Try to find and cancel in each booking type
      const hotelBooking =
        await bookingRepository.findHotelBookingById(bookingId);
      if (hotelBooking) {
        if (hotelBooking.status === "CANCELLED") {
          throw new BadRequestError("Booking is already cancelled");
        }
        await bookingRepository.updateHotelBookingStatus(
          bookingId,
          "CANCELLED",
          "REFUNDED",
        );
        res.json({
          success: true,
          message: "Hotel booking cancelled successfully",
        });
        return;
      }

      const flightBooking =
        await bookingRepository.findFlightBookingById(bookingId);
      if (flightBooking) {
        if (flightBooking.status === "CANCELLED") {
          throw new BadRequestError("Booking is already cancelled");
        }
        await bookingRepository.updateFlightBookingStatus(
          bookingId,
          "CANCELLED",
          "REFUNDED",
        );
        res.json({
          success: true,
          message: "Flight booking cancelled successfully",
        });
        return;
      }

      const trainBooking =
        await bookingRepository.findTrainBookingById(bookingId);
      if (trainBooking) {
        if (trainBooking.status === "CANCELLED") {
          throw new BadRequestError("Booking is already cancelled");
        }
        await bookingRepository.updateTrainBookingStatus(
          bookingId,
          "CANCELLED",
          "REFUNDED",
        );
        res.json({
          success: true,
          message: "Train booking cancelled successfully",
        });
        return;
      }

      throw new NotFoundError("Booking", bookingId);
    } catch (error) {
      next(error);
    }
  }

  async getBookingStats(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthenticatedUser;

      const [hotelBookings, flightBookings, trainBookings] = await Promise.all([
        bookingRepository.findHotelBookingsByUser(user.id, {
          page: 1,
          limit: 1000,
        }),
        bookingRepository.findFlightBookingsByUser(user.id, {
          page: 1,
          limit: 1000,
        }),
        bookingRepository.findTrainBookingsByUser(user.id, {
          page: 1,
          limit: 1000,
        }),
      ]);

      interface BookingWithPrice {
        totalPrice: number | string | { toString(): string };
        status: string;
      }

      const stats = {
        total: {
          count:
            hotelBookings.pagination.total +
            flightBookings.pagination.total +
            trainBookings.pagination.total,
          spent: this.calculateTotalSpent([
            ...hotelBookings.data,
            ...flightBookings.data,
            ...trainBookings.data,
          ] as BookingWithPrice[]),
        },
        hotels: {
          count: hotelBookings.pagination.total,
          spent: this.calculateTotalSpent(
            hotelBookings.data as BookingWithPrice[],
          ),
        },
        flights: {
          count: flightBookings.pagination.total,
          spent: this.calculateTotalSpent(
            flightBookings.data as BookingWithPrice[],
          ),
        },
        trains: {
          count: trainBookings.pagination.total,
          spent: this.calculateTotalSpent(
            trainBookings.data as BookingWithPrice[],
          ),
        },
      };

      res.json({
        success: true,
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  private calculateTotalSpent(
    bookings: { totalPrice: unknown; status: string }[],
  ): number {
    return bookings
      .filter((b) => b.status !== "CANCELLED")
      .reduce((sum, b) => sum + Number(b.totalPrice), 0);
  }
}

export const bookingController = new BookingController();
