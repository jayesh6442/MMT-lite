import "./config/env";
import express from "express";
import passport from "passport";
import authRoutes from "./routes/auth";
import "./auth/google";
import { env } from "./config/env";

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
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");

  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use("/auth", authRoutes);

app.listen(env.PORT, () => {
  console.log(`API running on :${env.PORT}`);
});
