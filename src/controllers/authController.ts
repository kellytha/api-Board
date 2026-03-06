import { Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { sendSuccess, sendError } from '../utils/errors.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export class AuthController {
  /**
   * Register a new user
   * POST /api/v1/auth/register
   */
  static register = asyncHandler(async (req: Request, res: Response) => {
    const { email, username, password } = req.body;

    const result = await AuthService.register(email, username, password);
    sendSuccess(res, 201, result, 'User registered successfully');
  });

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  static login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const result = await AuthService.login(email, password);
    sendSuccess(res, 200, result, 'Login successful');
  });

  /**
   * Get current user
   * GET /api/v1/auth/me
   * Protected route
   */
  static getMe = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const user = await AuthService.getUserById(req.user.userId);
    sendSuccess(res, 200, user, 'User retrieved successfully');
  });
}
