import { prisma } from "@repo/database";
import type { Flight, Prisma } from "@repo/database";
import type { PaginatedResult, PaginationParams } from "../types/common.types";
import type { FlightSearchFilters } from "../types/flight.types";

export class FlightRepository {
  async findById(id: string): Promise<Flight | null> {
    return prisma.flight.findUnique({
      where: { id, isActive: true },
      include: {
        fares: {
          where: { isActive: true },
        },
      },
    });
  }

  async findAll(
    filters: FlightSearchFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Flight>> {
    const {
      fromCity,
      toCity,
      departureDate,
      fareClass,
      airline,
      maxPrice,
      maxStops,
    } = filters;
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Calculate date range for the departure date (entire day)
    const startOfDay = new Date(departureDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(departureDate);
    endOfDay.setHours(23, 59, 59, 999);

    const where: Prisma.FlightWhereInput = {
      isActive: true,
      fromCity: { contains: fromCity, mode: "insensitive" },
      toCity: { contains: toCity, mode: "insensitive" },
      departureTime: {
        gte: startOfDay,
        lte: endOfDay,
      },
      ...(maxStops !== undefined && { stops: { lte: maxStops } }),
      ...(airline && { airline: { contains: airline, mode: "insensitive" } }),
    };

    // Handle fare class and price filters
    let flightIdsWithValidFares: string[] | undefined;
    if (fareClass || maxPrice !== undefined) {
      const fareWhere: Prisma.FlightFareWhereInput = {
        isActive: true,
        ...(fareClass && {
          fareClass: fareClass as Prisma.EnumFareClassFilter,
        }),
        ...(maxPrice !== undefined && { price: { lte: maxPrice } }),
      };

      const fares = await prisma.flightFare.findMany({
        where: fareWhere,
        select: { flightId: true },
        distinct: ["flightId"],
      });

      flightIdsWithValidFares = fares.map((f) => f.flightId);
      if (flightIdsWithValidFares.length === 0) {
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

    if (flightIdsWithValidFares) {
      where.id = { in: flightIdsWithValidFares };
    }

    const [flights, total] = await Promise.all([
      prisma.flight.findMany({
        where,
        skip,
        take: limit,
        orderBy: { departureTime: "asc" },
        include: {
          fares: {
            where: { isActive: true },
            orderBy: { price: "asc" },
          },
        },
      }),
      prisma.flight.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: flights,
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

  async getFareByFlightAndClass(flightId: string, fareClass: string) {
    return prisma.flightFare.findFirst({
      where: {
        flightId,
        fareClass: fareClass as Prisma.EnumFareClassFilter,
        isActive: true,
        seatsAvailable: { gt: 0 },
      },
    });
  }
}

export const flightRepository = new FlightRepository();
