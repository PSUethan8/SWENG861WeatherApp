import { Request, Response, NextFunction } from 'express';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';
import { ZodError } from 'zod';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export function errorHandler(
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log the error
  logger.error(`Error: ${err.message}`, err.stack);

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    res.status(400).json({
      error: 'Validation Error',
      message: 'Invalid request data',
      details: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
    return;
  }

  // Determine status code
  const statusCode = err.statusCode || 500;

  // Build response
  const response: Record<string, unknown> = {
    error: statusCode >= 500 ? 'Internal Server Error' : err.name || 'Error',
    message: err.isOperational || statusCode < 500 
      ? err.message 
      : 'Something went wrong',
  };

  // Include stack trace in development
  if (!env.isProduction && err.stack) {
    response.stack = err.stack;
  }

  res.status(statusCode).json(response);
}

export function createError(message: string, statusCode: number): AppError {
  const error: AppError = new Error(message);
  error.statusCode = statusCode;
  error.isOperational = true;
  return error;
}

