import { Router } from 'express';
import { TagController } from '../controllers/tagController.js';
import { validateRequest } from '../middlewares/validation.js';
import { createTagSchema, updateTagSchema } from '../validators/index.js';
import { authenticate } from '../middlewares/errorHandler.js';

const router = Router();

/**
 * Create a new tag
 * POST /api/v1/tags
 */
router.post(
  '/',
  authenticate,
  validateRequest(createTagSchema),
  TagController.create
);

/**
 * Get all tags
 * GET /api/v1/tags
 */
router.get(
  '/',
  authenticate,
  TagController.getAll
);

/**
 * Get a single tag by ID
 * GET /api/v1/tags/:tagId
 */
router.get(
  '/:tagId',
  authenticate,
  TagController.getById
);

/**
 * Update a tag
 * PATCH /api/v1/tags/:tagId
 */
router.patch(
  '/:tagId',
  authenticate,
  validateRequest(updateTagSchema),
  TagController.update
);

/**
 * Delete a tag
 * DELETE /api/v1/tags/:tagId
 */
router.delete(
  '/:tagId',
  authenticate,
  TagController.delete
);

export default router;
