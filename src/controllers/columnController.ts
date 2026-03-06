import { Request, Response } from 'express';
import { ColumnService } from '../services/columnService.js';
import { sendSuccess, sendError } from '../utils/errors.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export class ColumnController {
  /**
   * Create a new column
   * POST /api/v1/columns
   * Protected route
   */
  static create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { boardId, name, position } = req.body;
    const column = await ColumnService.createColumn(
      boardId,
      req.user.userId,
      name,
      position
    );

    sendSuccess(res, 201, column, 'Column created successfully');
  });

  /**
   * Get all columns in a board
   * GET /api/v1/boards/:boardId/columns
   * Protected route
   */
  static getBoardColumns = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { boardId } = req.params;
    const columns = await ColumnService.getBoardColumns(boardId, req.user.userId);

    sendSuccess(res, 200, columns, 'Columns retrieved successfully');
  });

  /**
   * Get a single column by ID
   * GET /api/v1/columns/:columnId
   * Protected route
   */
  static getById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { columnId } = req.params;
    const column = await ColumnService.getColumnById(columnId, req.user.userId);

    sendSuccess(res, 200, column, 'Column retrieved successfully');
  });

  /**
   * Update a column
   * PATCH /api/v1/columns/:columnId
   * Protected route
   */
  static update = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { columnId } = req.params;
    const { name, position } = req.body;

    const column = await ColumnService.updateColumn(columnId, req.user.userId, {
      name,
      position,
    });

    sendSuccess(res, 200, column, 'Column updated successfully');
  });

  /**
   * Delete a column
   * DELETE /api/v1/columns/:columnId
   * Protected route
   */
  static delete = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { columnId } = req.params;
    await ColumnService.deleteColumn(columnId, req.user.userId);

    sendSuccess(res, 200, null, 'Column deleted successfully');
  });

  /**
   * Reorder columns
   * PATCH /api/v1/boards/:boardId/columns/reorder
   * Protected route
   */
  static reorder = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { boardId } = req.params;
    const { columns } = req.body;

    await ColumnService.reorderColumns(boardId, req.user.userId, columns);

    sendSuccess(res, 200, null, 'Columns reordered successfully');
  });
}
