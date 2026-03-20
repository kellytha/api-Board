import { IColumn } from '../types/index.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { BoardService } from './boardService.js';
import { prisma } from '../db/prisma.js';

export class ColumnService {
  /**
   * Create a new column in a board
   */
  static async createColumn(
    boardId: string,
    userId: string,
    name: string,
    position: number
  ): Promise<IColumn> {
    // Verify board ownership
    await BoardService.getBoardById(boardId, userId);

    const column = await prisma.column.create({
      data: {
        name,
        position,
        boardId,
      },
    });

    return column;
  }

  /**
   * Get all columns in a board
   */
  static async getBoardColumns(boardId: string, userId?: string): Promise<IColumn[]> {
    // Verify board exists and ownership if userId provided
    if (userId) {
      await BoardService.getBoardById(boardId, userId);
    }

    const columns = await prisma.column.findMany({
      where: { boardId },
      orderBy: { position: 'asc' },
      include: {
        cards: {
          orderBy: { position: 'asc' },
          include: {
            tags: true,
            comments: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    return columns;
  }

  /**
   * Get a single column by ID
   */
  static async getColumnById(columnId: string, userId?: string): Promise<any> {
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: {
        board: {
          select: { userId: true },
        },
        cards: {
          orderBy: { position: 'asc' },
          include: {
            tags: true,
            comments: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!column) {
      throw new NotFoundError('Column not found');
    }

    // Check ownership if userId is provided
    if (userId && column.board.userId !== userId) {
      throw new ForbiddenError('You do not have access to this column');
    }

    return column;
  }

  /**
   * Update a column
   */
  static async updateColumn(
    columnId: string,
    userId: string,
    data: { name?: string; position?: number }
  ): Promise<IColumn> {
    const column = await this.getColumnById(columnId, userId);

    const updatedColumn = await prisma.column.update({
      where: { id: columnId },
      data,
    });

    return updatedColumn;
  }

  /**
   * Delete a column
   */
  static async deleteColumn(columnId: string, userId: string): Promise<void> {
    const column = await this.getColumnById(columnId, userId);

    await prisma.column.delete({
      where: { id: columnId },
    });
  }

  /**
   * Reorder columns (for drag and drop)
   */
  static async reorderColumns(
    boardId: string,
    userId: string,
    columns: Array<{ id: string; position: number }>
  ): Promise<void> {
    // Verify board ownership
    await BoardService.getBoardById(boardId, userId);

    // Update all columns in a transaction
    await prisma.$transaction(
      columns.map((col) =>
        prisma.column.update({
          where: { id: col.id },
          data: { position: col.position },
        })
      )
    );
  }
}
