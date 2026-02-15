import { z } from "zod";

export const flightSearchSchema = z.object({
  fromCity: z.string().min(1, "From city is required"),
  toCity: z.string().min(1, "To city is required"),
  departureDate: z.string().datetime(),
  returnDate: z.string().datetime().optional(),
  passengers: z.coerce.number().int().min(1).max(10).default(1),
  fareClass: z
    .enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST_CLASS"])
    .optional(),
  airline: z.string().optional(),
  maxPrice: z.coerce.number().optional(),
  maxStops: z.coerce.number().int().min(0).max(3).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const createFlightBookingSchema = z.object({
  flightId: z.string().cuid(),
  fareClass: z.enum(["ECONOMY", "PREMIUM_ECONOMY", "BUSINESS", "FIRST_CLASS"]),
  passengers: z.coerce.number().int().min(1).max(10),
  passengerDetails: z.record(z.any()).optional(),
});

export const flightIdParamSchema = z.object({
  id: z.string().cuid(),
});

export type FlightSearchInput = z.infer<typeof flightSearchSchema>;
export type CreateFlightBookingInput = z.infer<
  typeof createFlightBookingSchema
>;
export type FlightIdParam = z.infer<typeof flightIdParamSchema>;
