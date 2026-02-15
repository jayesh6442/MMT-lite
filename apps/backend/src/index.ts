import "./config/env";
import express from "express";
import passport from "passport";
import authRoutes from "./routes/auth";
import hotelRoutes from "./routes/hotels/hotel.routes";
import flightRoutes from "./routes/flights/flight.routes";
import trainRoutes from "./routes/trains/train.routes";
import bookingRoutes from "./routes/bookings/booking.routes";
import "./auth/google";
import { env } from "./config/env";
import { errorHandler } from "./middleware/error.middleware";

const app = express();

app.use(express.json());
app.use(passport.initialize());

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin === env.FRONTEND_URL) {
    res.header("Access-Control-Allow-Origin", origin);
    res.header("Vary", "Origin");
  }

  res.header("Access-Control-Allow-Headers", "Authorization, Content-Type");
  res.header(
    "Access-Control-Allow-Methods",
    "GET,POST,PUT,PATCH,DELETE,OPTIONS",
  );

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Routes
app.use("/auth", authRoutes);
app.use("/hotels", hotelRoutes);
app.use("/flights", flightRoutes);
app.use("/trains", trainRoutes);
app.use("/bookings", bookingRoutes);

// Error handler (must be last)
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`API running on :${env.PORT}`);
});
