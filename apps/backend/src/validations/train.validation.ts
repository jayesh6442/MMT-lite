import { z } from "zod";

export const trainSearchSchema = z.object({
  fromCity: z.string().min(1, "From city is required"),
  toCity: z.string().min(1, "To city is required"),
  departureDate: z.string().datetime(),
  classType: z
    .enum(["SL", "AC3", "AC2", "AC1", "CC", "EC", "GENERAL"])
    .optional(),
  passengers: z.coerce.number().int().min(1).max(10).default(1),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createTrainBookingSchema = z.object({
  trainId: z.string().cuid(),
  classType: z.enum(["SL", "AC3", "AC2", "AC1", "CC", "EC", "GENERAL"]),
  passengers: z.coerce.number().int().min(1).max(10),
  passengerDetails: z.record(z.any()).optional(),
});

export const trainIdParamSchema = z.object({
  id: z.string().cuid(),
});

export type TrainSearchInput = z.infer<typeof trainSearchSchema>;
export type CreateTrainBookingInput = z.infer<typeof createTrainBookingSchema>;
export type TrainIdParam = z.infer<typeof trainIdParamSchema>;
