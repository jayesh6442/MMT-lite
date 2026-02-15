import type { Request, Response, NextFunction } from "express";
import { hotelService } from "../services/hotel.service";
import { bookingRepository } from "../repositories/booking.repository";
import type { AuthenticatedUser } from "../types/common.types";
import { AppError } from "../utils/errors";

export class HotelController {
  async searchHotels(req: Request, res: Response, next: NextFunction) {
    try {
      const {
        city,
        checkInDate,
        checkOutDate,
        guests,
        page,
        limit,
        minPrice,
        maxPrice,
        starRating,
        amenities,
      } = req.query;

      if (!city || !checkInDate || !checkOutDate) {
        throw new AppError(
          400,
          "City, checkInDate, and checkOutDate are required",
        );
      }

      const result = await hotelService.searchHotels(
        {
          city: city as string,
          checkInDate: new Date(checkInDate as string),
          checkOutDate: new Date(checkOutDate as string),
          guests: guests ? parseInt(guests as string) : 2,
          minPrice: minPrice ? parseFloat(minPrice as string) : undefined,
          maxPrice: maxPrice ? parseFloat(maxPrice as string) : undefined,
          starRating: starRating ? parseInt(starRating as string) : undefined,
          amenities: amenities ? (amenities as string).split(",") : undefined,
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

  async getHotelById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const hotel = await hotelService.getHotelById(id as string);

      res.json({
        success: true,
        data: hotel,
      });
    } catch (error) {
      next(error);
    }
  }

  async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const user = req.user as AuthenticatedUser;
      const {
        hotelId,
        roomId,
        checkInDate,
        checkOutDate,
        guests,
        guestDetails,
        specialRequests,
      } = req.body;

      const booking = await hotelService.createBooking({
        userId: user.id,
        hotelId,
        roomId,
        checkInDate: new Date(checkInDate),
        checkOutDate: new Date(checkOutDate),
        guests,
        guestDetails,
        specialRequests,
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

      const bookings = await bookingRepository.findHotelBookingsByUser(
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

export const hotelController = new HotelController();
