import { PrismaClient } from '@prisma/client';
import { IComment } from '../types/index.js';
import { NotFoundError, ForbiddenError } from '../utils/errors.js';
import { CardService } from './cardService.js';

const prisma = new PrismaClient();

export class CommentService {
  /**
   * Create a new comment on a card
   */
  static async createComment(
    cardId: string,
    userId: string,
    content: string
  ): Promise<IComment> {
    // Verify card exists and ownership
    await CardService.getCardById(cardId, userId);

    const comment = await prisma.comment.create({
      data: {
        content,
        cardId,
        userId,
      },
    });

    return comment;
  }

  /**
   * Get all comments on a card
   */
  static async getCardComments(cardId: string, userId?: string): Promise<any[]> {
    // Verify card exists and ownership if userId provided
    if (userId) {
      await CardService.getCardById(cardId, userId);
    }

    const comments = await prisma.comment.findMany({
      where: { cardId },
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
    });

    return comments;
  }

  /**
   * Get a single comment by ID
   */
  static async getCommentById(commentId: string, userId?: string): Promise<any> {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        card: {
          select: {
            columnId: true,
            column: {
              select: {
                boardId: true,
                board: {
                  select: { userId: true },
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

    if (!comment) {
      throw new NotFoundError('Comment not found');
    }

    // Check board ownership if userId is provided
    if (userId && comment.card.column.board.userId !== userId) {
      throw new ForbiddenError('You do not have access to this comment');
    }

    return comment;
  }

  /**
   * Update a comment
   */
  static async updateComment(
    commentId: string,
    userId: string,
    content: string
  ): Promise<IComment> {
    const comment = await this.getCommentById(commentId, userId);

    // Verify ownership of comment
    if (comment.userId !== userId) {
      throw new ForbiddenError('You can only edit your own comments');
    }

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { content },
    });

    return updatedComment;
  }

  /**
   * Delete a comment
   */
  static async deleteComment(commentId: string, userId: string): Promise<void> {
    const comment = await this.getCommentById(commentId, userId);

    // Verify ownership of comment
    if (comment.userId !== userId) {
      throw new ForbiddenError('You can only delete your own comments');
    }

    await prisma.comment.delete({
      where: { id: commentId },
    });
  }
}
