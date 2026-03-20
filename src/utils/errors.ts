import { Response } from 'express';
import { IApiResponse } from '../types/index.js';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational: boolean = true
  ) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(400, message);
  }
}

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found') {
    super(404, message);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(401, message);
  }
}

export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(403, message);
  }
}

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists') {
    super(409, message);
  }
}

export class PreconditionFailedError extends AppError {
  constructor(message: string = 'Precondition failed') {
    super(412, message);
  }
}

/**
 * Send a successful API response
 */
export function sendSuccess<T>(
  res: Response,
  statusCode: number = 200,
  data?: T,
  message: string = 'Success'
): Response {
  const response: IApiResponse<T> = {
    success: true,
    message,
    ...(data !== undefined && { data }),
  };
  return res.status(statusCode).json(response);
}

/**
 * Send an error API response
 */
export function sendError(
  res: Response,
  statusCode: number = 500,
  message: string = 'Internal server error',
  error?: string
): Response {
  const response: IApiResponse<null> = {
    success: false,
    message,
    ...(error && { error }),
  };
  return res.status(statusCode).json(response);
}
