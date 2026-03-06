import { Request, Response } from 'express';
import { CommentService } from '../services/commentService.js';
import { sendSuccess, sendError } from '../utils/errors.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export class CommentController {
  /**
   * Create a new comment on a card
   * POST /api/v1/comments
   * Protected route
   */
  static create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { cardId, content } = req.body;
    const comment = await CommentService.createComment(
      cardId,
      req.user.userId,
      content
    );

    sendSuccess(res, 201, comment, 'Comment created successfully');
  });

  /**
   * Get all comments on a card
   * GET /api/v1/cards/:cardId/comments
   * Protected route
   */
  static getCardComments = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { cardId } = req.params;
    const comments = await CommentService.getCardComments(cardId, req.user.userId);

    sendSuccess(res, 200, comments, 'Comments retrieved successfully');
  });

  /**
   * Get a single comment by ID
   * GET /api/v1/comments/:commentId
   * Protected route
   */
  static getById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { commentId } = req.params;
    const comment = await CommentService.getCommentById(commentId, req.user.userId);

    sendSuccess(res, 200, comment, 'Comment retrieved successfully');
  });

  /**
   * Update a comment
   * PATCH /api/v1/comments/:commentId
   * Protected route
   */
  static update = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { commentId } = req.params;
    const { content } = req.body;

    const comment = await CommentService.updateComment(
      commentId,
      req.user.userId,
      content
    );

    sendSuccess(res, 200, comment, 'Comment updated successfully');
  });

  /**
   * Delete a comment
   * DELETE /api/v1/comments/:commentId
   * Protected route
   */
  static delete = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { commentId } = req.params;
    await CommentService.deleteComment(commentId, req.user.userId);

    sendSuccess(res, 200, null, 'Comment deleted successfully');
  });
}
