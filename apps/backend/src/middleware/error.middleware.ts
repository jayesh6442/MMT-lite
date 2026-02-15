import type { Request, Response, NextFunction } from "express";
import { AppError } from "../utils/errors";

interface ErrorWithCode extends Error {
  code?: string;
}

export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  console.error("Error:", error);

  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        message: error.message,
        code: error.code,
      },
    });
  }

  // Handle Prisma errors
  if (error.name === "PrismaClientKnownRequestError") {
    const prismaError = error as ErrorWithCode;
    // P2002: Unique constraint violation
    if (prismaError.code === "P2002") {
      return res.status(409).json({
        success: false,
        error: {
          message: "Resource already exists",
          code: "CONFLICT",
        },
      });
    }

    // P2025: Record not found
    if (prismaError.code === "P2025") {
      return res.status(404).json({
        success: false,
        error: {
          message: "Resource not found",
          code: "NOT_FOUND",
        },
      });
    }
  }

  // Default error response
  return res.status(500).json({
    success: false,
    error: {
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message,
      code: "INTERNAL_ERROR",
    },
  });
};
