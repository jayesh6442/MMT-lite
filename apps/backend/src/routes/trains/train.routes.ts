import { Router } from "express";
import { trainController } from "../../controllers/train.controller";
import { authenticate } from "../../middleware/auth.middleware";
import {
  validateBody,
  validateParams,
} from "../../middleware/validation.middleware";
import {
  createTrainBookingSchema,
  trainIdParamSchema,
} from "../../validations/train.validation";

const router = Router();

// Public routes
router.get("/search", trainController.searchTrains);
router.get(
  "/:id",
  validateParams(trainIdParamSchema),
  trainController.getTrainById,
);

// Protected routes
router.post(
  "/book",
  authenticate,
  validateBody(createTrainBookingSchema),
  trainController.createBooking,
);
router.get("/bookings/my", authenticate, trainController.getMyBookings);

export default router;
