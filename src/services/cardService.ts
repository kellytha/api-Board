import { PrismaClient } from '@prisma/client';
import { ICard } from '../types/index.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { ColumnService } from './columnService.js';

const prisma = new PrismaClient();

export class CardService {
  /**
   * Create a new card in a column
   */
  static async createCard(
    columnId: string,
    userId: string,
    title: string,
    description?: string,
    position: number = 0,
    dueDate?: Date
  ): Promise<ICard> {
    // Verify column ownership
    await ColumnService.getColumnById(columnId, userId);

    const card = await prisma.card.create({
      data: {
        title,
        description,
        position,
        columnId,
        dueDate,
      },
    });

    return card;
  }

  /**
   * Get all cards in a column
   */
  static async getColumnCards(columnId: string, userId?: string): Promise<any[]> {
    // Verify column exists and ownership if userId provided
    if (userId) {
      await ColumnService.getColumnById(columnId, userId);
    }

    const cards = await prisma.card.findMany({
      where: { columnId },
      orderBy: { position: 'asc' },
      include: {
        tags: true,
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    return cards;
  }

  /**
   * Get a single card by ID
   */
  static async getCardById(cardId: string, userId?: string): Promise<any> {
    const card = await prisma.card.findUnique({
      where: { id: cardId },
      include: {
        column: {
          select: {
            boardId: true,
            board: {
              select: { userId: true },
            },
          },
        },
        tags: true,
        comments: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!card) {
      throw new NotFoundError('Card not found');
    }

    // Check ownership if userId is provided
    if (userId && card.column.board.userId !== userId) {
      throw new ForbiddenError('You do not have access to this card');
    }

    return card;
  }

  /**
   * Update a card
   */
  static async updateCard(
    cardId: string,
    userId: string,
    data: {
      title?: string;
      description?: string;
      position?: number;
      columnId?: string;
      dueDate?: Date | null;
    }
  ): Promise<ICard> {
    const card = await this.getCardById(cardId, userId);

    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data,
    });

    return updatedCard;
  }

  /**
   * Delete a card
   */
  static async deleteCard(cardId: string, userId: string): Promise<void> {
    const card = await this.getCardById(cardId, userId);

    await prisma.card.delete({
      where: { id: cardId },
    });
  }

  /**
   * Assign a tag to a card
   */
  static async assignTag(cardId: string, userId: string, tagId: string): Promise<void> {
    const card = await this.getCardById(cardId, userId);

    await prisma.card.update({
      where: { id: cardId },
      data: {
        tags: {
          connect: { id: tagId },
        },
      },
    });
  }

  /**
   * Remove a tag from a card
   */
  static async removeTag(cardId: string, userId: string, tagId: string): Promise<void> {
    const card = await this.getCardById(cardId, userId);

    await prisma.card.update({
      where: { id: cardId },
      data: {
        tags: {
          disconnect: { id: tagId },
        },
      },
    });
  }

  /**
   * Reorder cards (for drag and drop)
   */
  static async reorderCards(
    columnId: string,
    userId: string,
    cards: Array<{ id: string; position: number; columnId?: string }>
  ): Promise<void> {
    // Verify column ownership
    await ColumnService.getColumnById(columnId, userId);

    // Update all cards in a transaction
    await prisma.$transaction(
      cards.map((card) =>
        prisma.card.update({
          where: { id: card.id },
          data: {
            position: card.position,
            ...(card.columnId && { columnId: card.columnId }),
          },
        })
      )
    );
  }

  /**
   * Move card to another column
   */
  static async moveCard(
    cardId: string,
    userId: string,
    targetColumnId: string,
    position: number
  ): Promise<ICard> {
    const card = await this.getCardById(cardId, userId);
    // Verify target column ownership
    await ColumnService.getColumnById(targetColumnId, userId);

    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: {
        columnId: targetColumnId,
        position,
      },
    });

    return updatedCard;
  }
}
