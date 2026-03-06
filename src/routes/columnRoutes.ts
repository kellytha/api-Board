import { Router } from 'express';
import { ColumnController } from '../controllers/columnController.js';
import { validateRequest } from '../middlewares/validation.js';
import { createColumnSchema, updateColumnSchema } from '../validators/index.js';
import { authenticate } from '../middlewares/errorHandler.js';

const router = Router();

/**
 * Create a new column
 * POST /api/v1/columns
 */
router.post(
  '/',
  authenticate,
  validateRequest(createColumnSchema),
  ColumnController.create
);

/**
 * Get all columns in a board
 * GET /api/v1/boards/:boardId/columns
 */
router.get(
  '/board/:boardId',
  authenticate,
  ColumnController.getBoardColumns
);

/**
 * Get a single column by ID
 * GET /api/v1/columns/:columnId
 */
router.get(
  '/:columnId',
  authenticate,
  ColumnController.getById
);

/**
 * Update a column
 * PATCH /api/v1/columns/:columnId
 */
router.patch(
  '/:columnId',
  authenticate,
  validateRequest(updateColumnSchema),
  ColumnController.update
);

/**
 * Delete a column
 * DELETE /api/v1/columns/:columnId
 */
router.delete(
  '/:columnId',
  authenticate,
  ColumnController.delete
);

/**
 * Reorder columns
 * PATCH /api/v1/boards/:boardId/columns/reorder
 */
router.patch(
  '/board/:boardId/reorder',
  authenticate,
  ColumnController.reorder
);

export default router;
