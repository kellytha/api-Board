import { Request, Response } from 'express';
import { TagService } from '../services/tagService.js';
import { sendSuccess, sendError } from '../utils/errors.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export class TagController {
  /**
   * Create a new tag
   * POST /api/v1/tags
   * Protected route
   */
  static create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { name, color } = req.body;
    const tag = await TagService.createTag(name, color);

    sendSuccess(res, 201, tag, 'Tag created successfully');
  });

  /**
   * Get all tags
   * GET /api/v1/tags
   * Protected route
   */
  static getAll = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const tags = await TagService.getAllTags();
    sendSuccess(res, 200, tags, 'Tags retrieved successfully');
  });

  /**
   * Get a single tag by ID
   * GET /api/v1/tags/:tagId
   * Protected route
   */
  static getById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { tagId } = req.params;
    const tag = await TagService.getTagById(tagId);

    sendSuccess(res, 200, tag, 'Tag retrieved successfully');
  });

  /**
   * Update a tag
   * PATCH /api/v1/tags/:tagId
   * Protected route
   */
  static update = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { tagId } = req.params;
    const { name, color } = req.body;

    const tag = await TagService.updateTag(tagId, { name, color });

    sendSuccess(res, 200, tag, 'Tag updated successfully');
  });

  /**
   * Delete a tag
   * DELETE /api/v1/tags/:tagId
   * Protected route
   */
  static delete = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { tagId } = req.params;
    await TagService.deleteTag(tagId);

    sendSuccess(res, 200, null, 'Tag deleted successfully');
  });
}
