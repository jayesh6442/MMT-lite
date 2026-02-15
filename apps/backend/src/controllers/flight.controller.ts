import type { Request, Response, NextFunction } from "express";
import { flightService } from "../services/flight.service";
import { bookingRepository } from "../repositories/booking.repository";
import type { AuthenticatedUser } from "../types/common.types";
import { AppError } from "../utils/errors";

export class FlightController {
  async searchFlights(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        fromCity,
        toCity,
        departureDate,
        returnDate,
        passengers,
        fareClass,
        airline,
        maxPrice,
        maxStops,
        page,
        limit,
      } = req.query;

      if (!fromCity || !toCity || !departureDate) {
        throw new AppError(
          400,
          "fromCity, toCity, and departureDate are required",
        );
      }

      const result = await flightService.searchFlights(
        {
          fromCity: fromCity as string,
          toCity: toCity as string,
          departureDate: new Date(departureDate as string),
          returnDate: returnDate ? new Date(returnDate as string) : undefined,
          passengers: passengers ? parseInt(passengers as string) : 1,
          fareClass: fareClass as string,
          airline: airline as string,
          maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
          maxStops: maxStops ? parseInt(maxStops as string) : undefined,
        },
        {
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 20,
        },
      );

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getFlightById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const flight = await flightService.getFlightById(id as string);

      res.json({
        success: true,
        data: flight,
      });
    } catch (error) {
      next(error);
    }
  }

  async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthenticatedUser;
      const { flightId, fareClass, passengers, passengerDetails } = req.body;

      const booking = await flightService.createBooking({
        userId: user.id,
        flightId,
        fareClass,
        passengers,
        passengerDetails,
      });

      res.status(201).json({
        success: true,
        data: booking,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMyBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthenticatedUser;
      const { page, limit } = req.query;

      const bookings = await bookingRepository.findFlightBookingsByUser(
        user.id,
        {
          page: page ? parseInt(page as string) : 1,
          limit: limit ? parseInt(limit as string) : 10,
        },
      );

      res.json({
        success: true,
        data: bookings.data,
        pagination: bookings.pagination,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const flightController = new FlightController();
