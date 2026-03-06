import { Router } from 'express';
import { CommentController } from '../controllers/commentController.js';
import { validateRequest } from '../middlewares/validation.js';
import { createCommentSchema } from '../validators/index.js';
import { authenticate } from '../middlewares/errorHandler.js';

const router = Router();

/**
 * Create a new comment
 * POST /api/v1/comments
 */
router.post(
  '/',
  authenticate,
  validateRequest(createCommentSchema),
  CommentController.create
);

/**
 * Get all comments on a card
 * GET /api/v1/cards/:cardId/comments
 */
router.get(
  '/card/:cardId',
  authenticate,
  CommentController.getCardComments
);

/**
 * Get a single comment by ID
 * GET /api/v1/comments/:commentId
 */
router.get(
  '/:commentId',
  authenticate,
  CommentController.getById
);

/**
 * Update a comment
 * PATCH /api/v1/comments/:commentId
 */
router.patch(
  '/:commentId',
  authenticate,
  validateRequest(createCommentSchema),
  CommentController.update
);

/**
 * Delete a comment
 * DELETE /api/v1/comments/:commentId
 */
router.delete(
  '/:commentId',
  authenticate,
  CommentController.delete
);

export default router;
