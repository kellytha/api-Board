import { Router } from 'express';
import { CardController } from '../controllers/cardController.js';
import { validateRequest } from '../middlewares/validation.js';
import { createCardSchema, updateCardWithConflictSchema, moveCardSchema, reorderCardsSchema } from '../validators/index.js';
import { authenticate } from '../middlewares/errorHandler.js';

const router = Router();

/**
 * Create a new card
 * POST /api/v1/cards
 */
router.post(
  '/',
  authenticate,
  validateRequest(createCardSchema),
  CardController.create
);

/**
 * Get all cards in a column
 * GET /api/v1/columns/:columnId/cards
 */
router.get(
  '/column/:columnId',
  authenticate,
  CardController.getColumnCards
);

/**
 * Get a single card by ID
 * GET /api/v1/cards/:cardId
 */
router.get(
  '/:cardId',
  authenticate,
  CardController.getById
);

/**
 * Update a card
 * PATCH /api/v1/cards/:cardId
 */
router.patch(
  '/:cardId',
  authenticate,
  validateRequest(updateCardWithConflictSchema),
  CardController.update
);

/**
 * Delete a card
 * DELETE /api/v1/cards/:cardId
 */
router.delete(
  '/:cardId',
  authenticate,
  CardController.delete
);

/**
 * Assign a tag to a card
 * POST /api/v1/cards/:cardId/tags/:tagId
 */
router.post(
  '/:cardId/tags/:tagId',
  authenticate,
  CardController.assignTag
);

/**
 * Remove a tag from a card
 * DELETE /api/v1/cards/:cardId/tags/:tagId
 */
router.delete(
  '/:cardId/tags/:tagId',
  authenticate,
  CardController.removeTag
);

/**
 * Reorder cards
 * PATCH /api/v1/columns/:columnId/cards/reorder
 */
router.patch(
  '/column/:columnId/reorder',
  authenticate,
  validateRequest(reorderCardsSchema),
  CardController.reorder
);

/**
 * Move a card to another column
 * POST /api/v1/cards/:cardId/move
 */
router.post(
  '/:cardId/move',
  authenticate,
  validateRequest(moveCardSchema),
  CardController.move
);

export default router;
