import { Request, Response } from 'express';
import { CardService } from '../services/cardService.js';
import { sendSuccess, sendError } from '../utils/errors.js';
import { asyncHandler } from '../middlewares/errorHandler.js';

export class CardController {
  /**
   * Create a new card
   * POST /api/v1/cards
   * Protected route
   */
  static create = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { columnId, title, description, position, dueDate } = req.body;
    const card = await CardService.createCard(
      columnId,
      req.user.userId,
      title,
      description,
      position,
      dueDate ? new Date(dueDate) : undefined
    );

    sendSuccess(res, 201, card, 'Card created successfully');
  });

  /**
   * Get all cards in a column
   * GET /api/v1/columns/:columnId/cards
   * Protected route
   */
  static getColumnCards = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { columnId } = req.params;
    const cards = await CardService.getColumnCards(columnId, req.user.userId);

    sendSuccess(res, 200, cards, 'Cards retrieved successfully');
  });

  /**
   * Get a single card by ID
   * GET /api/v1/cards/:cardId
   * Protected route
   */
  static getById = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { cardId } = req.params;
    const card = await CardService.getCardById(cardId, req.user.userId);

    sendSuccess(res, 200, card, 'Card retrieved successfully');
  });

  /**
   * Update a card
   * PATCH /api/v1/cards/:cardId
   * Protected route
   */
  static update = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { cardId } = req.params;
    const { title, description, position, columnId, dueDate } = req.body;

    const card = await CardService.updateCard(cardId, req.user.userId, {
      title,
      description,
      position,
      columnId,
      dueDate: dueDate ? new Date(dueDate) : dueDate,
    });

    sendSuccess(res, 200, card, 'Card updated successfully');
  });

  /**
   * Delete a card
   * DELETE /api/v1/cards/:cardId
   * Protected route
   */
  static delete = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { cardId } = req.params;
    await CardService.deleteCard(cardId, req.user.userId);

    sendSuccess(res, 200, null, 'Card deleted successfully');
  });

  /**
   * Assign a tag to a card
   * POST /api/v1/cards/:cardId/tags/:tagId
   * Protected route
   */
  static assignTag = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { cardId, tagId } = req.params;
    await CardService.assignTag(cardId, req.user.userId, tagId);

    sendSuccess(res, 200, null, 'Tag assigned successfully');
  });

  /**
   * Remove a tag from a card
   * DELETE /api/v1/cards/:cardId/tags/:tagId
   * Protected route
   */
  static removeTag = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { cardId, tagId } = req.params;
    await CardService.removeTag(cardId, req.user.userId, tagId);

    sendSuccess(res, 200, null, 'Tag removed successfully');
  });

  /**
   * Reorder cards
   * PATCH /api/v1/columns/:columnId/cards/reorder
   * Protected route
   */
  static reorder = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { columnId } = req.params;
    const { cards } = req.body;

    await CardService.reorderCards(columnId, req.user.userId, cards);

    sendSuccess(res, 200, null, 'Cards reordered successfully');
  });

  /**
   * Move a card to another column
   * POST /api/v1/cards/:cardId/move
   * Protected route
   */
  static move = asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      sendError(res, 401, 'Unauthorized');
      return;
    }

    const { cardId } = req.params;
    const { columnId, position } = req.body;

    const card = await CardService.moveCard(
      cardId,
      req.user.userId,
      columnId,
      position
    );

    sendSuccess(res, 200, card, 'Card moved successfully');
  });
}
