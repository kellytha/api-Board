import { ICard } from '../types/index.js';
import { NotFoundError, ForbiddenError, PreconditionFailedError } from '../utils/errors.js';
import { ColumnService } from './columnService.js';
import { prisma } from '../db/prisma.js';
import { eventBus } from '../events/eventBus.js';

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

    eventBus.emit('card.created', { cardId: card.id, columnId: card.columnId });
    return card;
  }

  /**
   * Get all cards in a column
   */
  static async getColumnCards(
    columnId: string,
    userId?: string,
    opts?: { page?: number; limit?: number }
  ): Promise<{ items: any[]; page: number; limit: number; total: number; pages: number }> {
    // Verify column exists and ownership if userId provided
    if (userId) {
      await ColumnService.getColumnById(columnId, userId);
    }

    const page = Math.max(1, opts?.page ?? 1);
    const limit = Math.min(100, Math.max(1, opts?.limit ?? 50));
    const skip = (page - 1) * limit;

    const [total, items] = await prisma.$transaction([
      prisma.card.count({ where: { columnId } }),
      prisma.card.findMany({
        where: { columnId },
        orderBy: { position: 'asc' },
        skip,
        take: limit,
        include: {
          tags: true,
          comments: {
            where: { deletedAt: null },
            orderBy: { createdAt: 'desc' },
            include: {
              user: {
                select: {
                  id: true,
                  username: true,
                  email: true,
                },
              },
              replies: {
                where: { deletedAt: null },
                orderBy: { createdAt: 'asc' },
                include: { user: { select: { id: true, username: true, email: true } } },
              },
            },
          },
        },
      }),
    ]);

    return { items, page, limit, total, pages: Math.ceil(total / limit) };
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
      expectedUpdatedAt?: string;
    }
  ): Promise<ICard> {
    const card = await this.getCardById(cardId, userId);

    const { expectedUpdatedAt, ...updateData } = data;

    if (expectedUpdatedAt) {
      const updatedCount = await prisma.card.updateMany({
        where: { id: cardId, updatedAt: new Date(expectedUpdatedAt) },
        data: updateData,
      });
      if (updatedCount.count === 0) {
        throw new PreconditionFailedError('Conflict: card has been modified by another user');
      }
      return prisma.card.findUniqueOrThrow({ where: { id: cardId } });
    }

    const updatedCard = await prisma.card.update({
      where: { id: cardId },
      data: updateData,
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
    cards: Array<{ id: string }>
  ): Promise<void> {
    // Verify column ownership
    await ColumnService.getColumnById(columnId, userId);

    // Ensure cards belong to the column and user owns them
    const existing = await prisma.card.findMany({
      where: { columnId, id: { in: cards.map((c) => c.id) } },
      select: { id: true },
    });

    if (existing.length !== cards.length) {
      throw new ForbiddenError('One or more cards do not belong to this column');
    }

    // Two-phase reindex avoids unique constraint collisions:
    // 1) assign unique negative positions
    // 2) assign final 0..n-1 positions
    await prisma.$transaction(async (tx) => {
      for (let i = 0; i < cards.length; i++) {
        await tx.card.update({
          where: { id: cards[i].id },
          data: { position: -(i + 1) },
        });
      }
      for (let i = 0; i < cards.length; i++) {
        await tx.card.update({
          where: { id: cards[i].id },
          data: { position: i },
        });
      }
    });
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

    const fromColumnId = card.columnId;

    // Build new ordering for target column as dense 0..n-1
    const targetIds = (await prisma.card.findMany({
      where: { columnId: targetColumnId },
      orderBy: { position: 'asc' },
      select: { id: true },
    })).map((c) => c.id).filter((id) => id !== cardId);

    const insertAt = Math.max(0, Math.min(position, targetIds.length));
    targetIds.splice(insertAt, 0, cardId);

    // Build new ordering for source column (remove the moved card)
    const sourceIds = (await prisma.card.findMany({
      where: { columnId: fromColumnId },
      orderBy: { position: 'asc' },
      select: { id: true },
    })).map((c) => c.id).filter((id) => id !== cardId);

    const updatedCard = await prisma.$transaction(async (tx) => {
      // Move card into target column with a temp position that won't collide
      await tx.card.update({
        where: { id: cardId },
        data: { columnId: targetColumnId, position: -999999 },
      });

      // Reindex source column
      for (let i = 0; i < sourceIds.length; i++) {
        await tx.card.update({ where: { id: sourceIds[i] }, data: { position: -(i + 1) } });
      }
      for (let i = 0; i < sourceIds.length; i++) {
        await tx.card.update({ where: { id: sourceIds[i] }, data: { position: i } });
      }

      // Reindex target column (includes moved card)
      for (let i = 0; i < targetIds.length; i++) {
        await tx.card.update({ where: { id: targetIds[i] }, data: { position: -(i + 1) } });
      }
      for (let i = 0; i < targetIds.length; i++) {
        await tx.card.update({ where: { id: targetIds[i] }, data: { position: i } });
      }

      return tx.card.findUniqueOrThrow({ where: { id: cardId } });
    });

    eventBus.emit('card.moved', {
      cardId: updatedCard.id,
      fromColumnId,
      toColumnId: updatedCard.columnId,
      toPosition: updatedCard.position,
    });
    return updatedCard;
  }
}
