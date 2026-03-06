import { PrismaClient } from '@prisma/client';
import { IBoard } from '../types/index.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';

const prisma = new PrismaClient();

export class BoardService {
  /**
   * Create a new board
   */
  static async createBoard(
    userId: string,
    name: string,
    description?: string
  ): Promise<IBoard> {
    const board = await prisma.board.create({
      data: {
        name,
        description,
        userId,
      },
    });

    return board;
  }

  /**
   * Get all boards for a user
   */
  static async getUserBoards(userId: string): Promise<IBoard[]> {
    const boards = await prisma.board.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        columns: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
            },
          },
        },
      },
    });

    return boards;
  }

  /**
   * Get a single board by ID
   */
  static async getBoardById(boardId: string, userId?: string): Promise<any> {
    const board = await prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
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
                        email: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
      },
    });

    if (!board) {
      throw new NotFoundError('Board not found');
    }

    // Check ownership if userId is provided
    if (userId && board.userId !== userId) {
      throw new ForbiddenError('You do not have access to this board');
    }

    return board;
  }

  /**
   * Update a board
   */
  static async updateBoard(
    boardId: string,
    userId: string,
    data: { name?: string; description?: string }
  ): Promise<IBoard> {
    const board = await this.getBoardById(boardId, userId);

    const updatedBoard = await prisma.board.update({
      where: { id: boardId },
      data,
    });

    return updatedBoard;
  }

  /**
   * Delete a board
   */
  static async deleteBoard(boardId: string, userId: string): Promise<void> {
    const board = await this.getBoardById(boardId, userId);

    await prisma.board.delete({
      where: { id: boardId },
    });
  }
}
