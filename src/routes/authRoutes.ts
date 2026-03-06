import { Router } from 'express';
import { AuthController } from '../controllers/authController.js';
import { validateRequest } from '../middlewares/validation.js';
import { registerSchema, loginSchema } from '../validators/index.js';
import { authenticate } from '../middlewares/errorHandler.js';

const router = Router();

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
router.post(
  '/register',
  validateRequest(registerSchema),
  AuthController.register
);

/**
 * Login user
 * POST /api/v1/auth/login
 */
router.post(
  '/login',
  validateRequest(loginSchema),
  AuthController.login
);

/**
 * Get current user
 * GET /api/v1/auth/me
 */
router.get(
  '/me',
  authenticate,
  AuthController.getMe
);

export default router;
