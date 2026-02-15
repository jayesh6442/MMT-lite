import { Router } from "express";
import { hotelController } from "../../controllers/hotel.controller";
import { authenticate } from "../../middleware/auth.middleware";
import {
  validateBody,
  validateParams,
} from "../../middleware/validation.middleware";
import {
  createHotelBookingSchema,
  hotelIdParamSchema,
} from "../../validations/hotel.validation";

const router = Router();

// Public routes
router.get("/search", hotelController.searchHotels);
router.get(
  "/:id",
  validateParams(hotelIdParamSchema),
  hotelController.getHotelById,
);

// Protected routes
router.post(
  "/book",
  authenticate,
  validateBody(createHotelBookingSchema),
  hotelController.createBooking,
);
router.get("/bookings/my", authenticate, hotelController.getMyBookings);

export default router;
