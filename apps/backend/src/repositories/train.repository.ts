import { prisma } from "@repo/database";
import type { Train, Prisma } from "@repo/database";
import type { PaginatedResult, PaginationParams } from "../types/common.types";
import type { TrainSearchFilters } from "../types/train.types";

export class TrainRepository {
  async findById(id: string): Promise<Train | null> {
    return prisma.train.findUnique({
      where: { id, isActive: true },
      include: {
        classes: {
          where: { isActive: true },
        },
      },
    });
  }

  async findAll(
    filters: TrainSearchFilters,
    pagination: PaginationParams,
  ): Promise<PaginatedResult<Train>> {
    const { fromCity, toCity, departureDate, classType } = filters;
    const { page, limit } = pagination;
    const skip = (page - 1) * limit;

    // Get day of week from departure date
    const dayOfWeek = new Date(departureDate).getDay();

    const where: Prisma.TrainWhereInput = {
      isActive: true,
      fromCity: { contains: fromCity, mode: "insensitive" },
      toCity: { contains: toCity, mode: "insensitive" },
      daysOfWeek: { has: dayOfWeek },
    };

    // Handle class type filter
    let trainIdsWithValidClasses: string[] | undefined;
    if (classType) {
      const classes = await prisma.trainClass.findMany({
        where: {
          classType: classType as Prisma.EnumTrainClassTypeFilter,
          isActive: true,
          seatsAvailable: { gt: 0 },
        },
        select: { trainId: true },
        distinct: ["trainId"],
      });

      trainIdsWithValidClasses = classes.map((c) => c.trainId);
      if (trainIdsWithValidClasses.length === 0) {
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

    if (trainIdsWithValidClasses) {
      where.id = { in: trainIdsWithValidClasses };
    }

    const [trains, total] = await Promise.all([
      prisma.train.findMany({
        where,
        skip,
        take: limit,
        orderBy: { departureTime: "asc" },
        include: {
          classes: {
            where: { isActive: true },
            orderBy: { price: "asc" },
          },
        },
      }),
      prisma.train.count({ where }),
    ]);

    const totalPages = Math.ceil(total / limit);

    return {
      data: trains,
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

  async getClassByTrainAndType(trainId: string, classType: string) {
    return prisma.trainClass.findFirst({
      where: {
        trainId,
        classType: classType as Prisma.EnumTrainClassTypeFilter,
        isActive: true,
        seatsAvailable: { gt: 0 },
      },
    });
  }
}

export const trainRepository = new TrainRepository();
