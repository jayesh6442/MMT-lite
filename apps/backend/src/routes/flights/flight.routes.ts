import { Router } from "express";
import { flightController } from "../../controllers/flight.controller";
import { authenticate } from "../../middleware/auth.middleware";
import {
  validateBody,
  validateParams,
} from "../../middleware/validation.middleware";
import {
  createFlightBookingSchema,
  flightIdParamSchema,
} from "../../validations/flight.validation";

const router = Router();

// Public routes
router.get("/search", flightController.searchFlights);
router.get(
  "/:id",
  validateParams(flightIdParamSchema),
  flightController.getFlightById,
);

// Protected routes
router.post(
  "/book",
  authenticate,
  validateBody(createFlightBookingSchema),
  flightController.createBooking,
);
router.get("/bookings/my", authenticate, flightController.getMyBookings);

export default router;
