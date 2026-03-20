import { Request, Response } from 'express';
import { BoardService } from '../services/boardService.js';
import { sendSuccess, sendError } from '../utils/errors.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export class BoardController {
  /**
   * Create a new board
   * POST /api/v1/boards
   * Protected route
   */
  static create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { name, description } = req.body;
    const board = await BoardService.createBoard(req.user.userId, name, description);

    sendSuccess(res, 201, board, 'Board created successfully');
  });

  /**
   * Get all boards for the current user
   * GET /api/v1/boards
   * Protected route
   */
  static getUserBoards = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const page = req.query.page ? Number(req.query.page) : 1;
    const limit = req.query.limit ? Number(req.query.limit) : 10;
    const boards = await BoardService.getUserBoards(req.user.userId, { page, limit });
    sendSuccess(res, 200, boards, 'Boards retrieved successfully');
  });

  /**
   * Get a single board by ID
   * GET /api/v1/boards/:boardId
   * Protected route
   */
  static getById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { boardId } = req.params;
    const board = await BoardService.getBoardById(boardId, req.user.userId);

    sendSuccess(res, 200, board, 'Board retrieved successfully');
  });

  /**
   * Update a board
   * PATCH /api/v1/boards/:boardId
   * Protected route
   */
  static update = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { boardId } = req.params;
    const { name, description } = req.body;

    const board = await BoardService.updateBoard(boardId, req.user.userId, {
      name,
      description,
    });

    sendSuccess(res, 200, board, 'Board updated successfully');
  });

  /**
   * Delete a board
   * DELETE /api/v1/boards/:boardId
   * Protected route
   */
  static delete = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { boardId } = req.params;
    await BoardService.deleteBoard(boardId, req.user.userId);

    sendSuccess(res, 200, null, 'Board deleted successfully');
  });
}
