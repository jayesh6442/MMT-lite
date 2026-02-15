import { prisma } from "@repo/database";
import type { Hotel, Prisma } from "@repo/database";
import type { PaginatedResult, PaginationParams } from "../types/common.types";
import type { HotelSearchFilters } from "../types/hotel.types";

export class HotelRepository {
  async findById(id: string): Promise<Hotel | null> {
    return prisma.hotel.findUnique({
      where: { id, isActive: true },
      include: {
        rooms: {
          where: { isActive: true },
          include: {
            rates: true,
          },
        },
      },
    });
  }

  async findAll(
    filters: HotelSearchFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Hotel>> {
    const { city, starRating, amenities, minPrice, maxPrice } = filters;
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    const where: Prisma.HotelWhereInput = {
      isActive: true,
      ...(city && { city: { contains: city, mode: "insensitive" } }),
      ...(starRating && { starRating }),
      ...(amenities?.length && { amenities: { hasEvery: amenities } }),
    };

    // If price filters are provided, we need to filter by rooms with rates
    let hotelIdsWithValidPrices: string[] | undefined;
    if (minPrice !== undefined || maxPrice !== undefined) {
      const rateFilter: Prisma.RoomRateWhereInput = {
        isActive: true,
        ...(minPrice !== undefined && { price: { gte: minPrice } }),
        ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
      };

      const roomsWithRates = await prisma.room.findMany({
        where: {
          isActive: true,
          rates: { some: rateFilter },
        },
        select: { hotelId: true },
        distinct: ["hotelId"],
      });

      hotelIdsWithValidPrices = roomsWithRates.map((r) => r.hotelId);
      if (hotelIdsWithValidPrices.length === 0) {
        return {
          data: [],
          pagination: {
            total: 0,
            page,
            limit,
            totalPages: 0,
            hasNext: false,
            hasPrev: false,
          },
        };
      }
    }

    if (hotelIdsWithValidPrices) {
      where.id = { in: hotelIdsWithValidPrices };
    }

    const [hotels, total] = await Promise.all([
      prisma.hotel.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          rooms: {
            where: { isActive: true },
            include: {
              rates: {
                where: { isActive: true },
                orderBy: { price: "asc" },
                take: 1,
              },
            },
          },
          _count: {
            select: { reviews: true },
          },
        },
      }),
      prisma.hotel.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: hotels,
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

  async findRoomsByHotelId(hotelId: string) {
    return prisma.room.findMany({
      where: { hotelId, isActive: true },
      include: {
        rates: {
          where: { isActive: true },
          orderBy: { price: "asc" },
        },
      },
    });
  }

  async getRoomRatesForDates(roomId: string, startDate: Date, endDate: Date) {
    return prisma.roomRate.findMany({
      where: {
        roomId,
        date: {
          gte: startDate,
          lt: endDate,
        },
        isActive: true,
        available: { gt: 0 },
      },
      orderBy: { date: "asc" },
    });
  }
}

export const hotelRepository = new HotelRepository();
