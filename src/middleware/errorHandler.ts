import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly details?: unknown
  ) {
    super(message);
  }
}

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new HttpError(404, `Route not found: ${req.method} ${req.originalUrl}`));
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "validation_error",
      message: "Request validation failed",
      issues: err.issues
    });
    return;
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({
      error: "request_error",
      message: err.message,
      details: err.details
    });
    return;
  }

  console.error(err);
  res.status(500).json({
    error: "internal_error",
    message: "Unexpected server error"
  });
};
