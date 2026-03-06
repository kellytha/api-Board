import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { sendError } from '../utils/errors.js';

/**
 * Middleware to validate request body against a Zod schema
 */
export function validateRequest(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.body);
      req.body = validated;
      next();
    } catch (err: any) {
      const errors = err.errors?.map((e: any) => ({
        path: e.path.join('.'),
        message: e.message,
      })) || [];
      
      sendError(
        res,
        400,
        'Validation failed',
        JSON.stringify(errors)
      );
    }
  };
}

/**
 * Middleware to validate URL parameters
 */
export function validateParams(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.params);
      req.params = validated;
      next();
    } catch (err: any) {
      const errors = err.errors?.map((e: any) => ({
        path: e.path.join('.'),
        message: e.message,
      })) || [];
      
      sendError(
        res,
        400,
        'Invalid parameters',
        JSON.stringify(errors)
      );
    }
  };
}

/**
 * Middleware to validate query parameters
 */
export function validateQuery(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const validated = schema.parse(req.query);
      req.query = validated as any;
      next();
    } catch (err: any) {
      const errors = err.errors?.map((e: any) => ({
        path: e.path.join('.'),
        message: e.message,
      })) || [];
      
      sendError(
        res,
        400,
        'Invalid query parameters',
        JSON.stringify(errors)
      );
    }
  };
}
