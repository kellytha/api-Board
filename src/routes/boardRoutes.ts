import { Router } from 'express';
import { BoardController } from '../controllers/boardController.js';
import { validateRequest } from '../middlewares/validation.js';
import { createBoardSchema, updateBoardSchema } from '../validators/index.js';
import { authenticate } from '../middlewares/errorHandler.js';

const router = Router();

/**
 * Create a new board
 * POST /api/v1/boards
 */
router.post(
  '/',
  authenticate,
  validateRequest(createBoardSchema),
  BoardController.create
);

/**
 * Get all boards for the current user
 * GET /api/v1/boards
 */
router.get(
  '/',
  authenticate,
  BoardController.getUserBoards
);

/**
 * Get a single board by ID
 * GET /api/v1/boards/:boardId
 */
router.get(
  '/:boardId',
  authenticate,
  BoardController.getById
);

/**
 * Update a board
 * PATCH /api/v1/boards/:boardId
 */
router.patch(
  '/:boardId',
  authenticate,
  validateRequest(updateBoardSchema),
  BoardController.update
);

/**
 * Delete a board
 * DELETE /api/v1/boards/:boardId
 */
router.delete(
  '/:boardId',
  authenticate,
  BoardController.delete
);

export default router;
