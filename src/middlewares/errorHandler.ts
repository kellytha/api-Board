import { Request, Response, NextFunction } from 'express';
import { AppError, sendError, UnauthorizedError } from '../utils/errors.js';
import { TokenService } from '../utils/token.js';
import { IJWTPayload } from '../types/index.js';
import { logger } from '../utils/logger.js';

declare global {
  namespace Express {
    interface Request {
      user?: IJWTPayload;
    }
  }
}

/**
 * Global error handler middleware
 * This should be the last middleware in the chain
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Error:', err);

  if (err instanceof AppError) {
    sendError(res, err.statusCode, err.message);
    return;
  }

  // Handle Prisma errors
  if (err.message.includes('Unique constraint failed')) {
    sendError(res, 409, 'Resource already exists');
    return;
  }

  if (err.message.includes('Record to update not found')) {
    sendError(res, 404, 'Resource not found');
  }

  // Generic error
  sendError(res, 500, 'Internal server error', err.message);
}

/**
 * Validation error middleware for Zod validation
 */
export function validationErrorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err.statusCode === 400 && err.validation) {
    const errors = Object.entries(err.validation).map(([field, message]) => ({
      field,
      message,
    }));
    sendError(res, 400, 'Validation failed', JSON.stringify(errors));
    return;
  }

  next(err);
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  try {
    const authHeader = req.headers.authorization;
    const token = TokenService.extractTokenFromHeader(authHeader);

    if (!token) {
      throw new UnauthorizedError('No authentication token provided');
    }

    const payload = TokenService.verifyToken(token);
    req.user = payload;
    next();
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
    sendError(res, 401, errorMessage);
  }
}

/**
 * Async error wrapper - use this to wrap async route handlers
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
