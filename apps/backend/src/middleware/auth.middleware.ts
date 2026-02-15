import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { UnauthorizedError } from "../utils/errors";
import type { AuthenticatedUser } from "../types/common.types";

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.header("authorization");

    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing bearer token");
    }

    const token = authHeader.slice("Bearer ".length).trim();

    const payload = jwt.verify(token, env.JWT_SECRET, {
      issuer: "api",
    }) as jwt.JwtPayload;

    const userId = payload.sub;
    const email = payload.email as string;
    const name = payload.name as string | null;

    if (!userId || !email) {
      throw new UnauthorizedError("Invalid token");
    }

    req.user = {
      id: userId,
      email,
      name,
    };

    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new UnauthorizedError("Invalid or expired token"));
    } else {
      next(error);
    }
  }
};
