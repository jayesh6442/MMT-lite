import { z } from "zod";

export const hotelSearchSchema = z.object({
  city: z.string().min(1, "City is required"),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
  guests: z.coerce.number().int().min(1).max(20).default(2),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  starRating: z.coerce.number().int().min(1).max(5).optional(),
  amenities: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(",") : undefined)),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(["price", "rating", "name"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const createHotelBookingSchema = z.object({
  hotelId: z.string().cuid(),
  roomId: z.string().cuid(),
  checkInDate: z.string().datetime(),
  checkOutDate: z.string().datetime(),
  guests: z.coerce.number().int().min(1).max(20),
  guestDetails: z.record(z.any()).optional(),
  specialRequests: z.string().max(500).optional(),
});

export const hotelIdParamSchema = z.object({
  id: z.string().cuid(),
});

export type HotelSearchInput = z.infer<typeof hotelSearchSchema>;
export type CreateHotelBookingInput = z.infer<typeof createHotelBookingSchema>;
export type HotelIdParam = z.infer<typeof hotelIdParamSchema>;
