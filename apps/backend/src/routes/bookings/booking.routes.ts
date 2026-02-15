import { Router } from "express";
import { bookingController } from "../../controllers/booking.controller";
import { authenticate } from "../../middleware/auth.middleware";

const router = Router();

// Protected routes - all booking routes require authentication
router.use(authenticate);

// Get all bookings across all types
router.get("/", bookingController.getAllBookings);
router.get("/stats", bookingController.getBookingStats);
router.get("/:id", bookingController.getBookingById);
router.patch("/:id/cancel", bookingController.cancelBooking);

export default router;
