import type { Request, Response, NextFunction } from "express";
import { trainService } from "../services/train.service";
import { bookingRepository } from "../repositories/booking.repository";
import type { AuthenticatedUser } from "../types/common.types";
import { AppError } from "../utils/errors";

export class TrainController {
  async searchTrains(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        fromCity,
        toCity,
        departureDate,
        classType,
        passengers,
        page,
        limit,
      } = req.query;

      if (!fromCity || !toCity || !departureDate) {
        throw new AppError(
          400,
          "fromCity, toCity, and departureDate are required",
        );
      }

      const result = await trainService.searchTrains(
        {
          fromCity: fromCity as string,
          toCity: toCity as string,
          departureDate: new Date(departureDate as string),
          classType: classType as string,
          passengers: passengers ? parseInt(passengers as string) : 1,
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

  async getTrainById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const train = await trainService.getTrainById(id as string);

      res.json({
        success: true,
        data: train,
      });
    } catch (error) {
      next(error);
    }
  }

  async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthenticatedUser;
      const { trainId, classType, passengers, passengerDetails } = req.body;

      const booking = await trainService.createBooking({
        userId: user.id,
        trainId,
        classType,
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

      const bookings = await bookingRepository.findTrainBookingsByUser(
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

export const trainController = new TrainController();
