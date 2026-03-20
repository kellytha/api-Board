import * as repo from '../repositories/comment.repository.js';
import { CardService } from './cardService.js';
import { ForbiddenError, NotFoundError } from '../utils/errors.js';
import { eventBus } from '../events/eventBus.js';

export class CommentService {
  static async createComment(
    cardId: string,
    userId: string,
    content: string,
    parentId?: string | null
  ) {
    // Ownership check happens via CardService.
    await CardService.getCardById(cardId, userId);

    if (parentId) {
      const parent = await repo.getCommentById(parentId);
      if (!parent || parent.deletedAt) throw new NotFoundError('Parent comment not found');
      if (parent.cardId !== cardId) throw new ForbiddenError('Parent comment must belong to same card');
    }

    const created = await repo.createComment({ cardId, userId, content, parentId: parentId ?? null });
    eventBus.emit('comment.added', { commentId: created.id, cardId: created.cardId });
    return created;
  }

  static async getCardComments(cardId: string, userId: string) {
    await CardService.getCardById(cardId, userId);
    return repo.getCommentsByCardId(cardId);
  }

  static async getCommentById(commentId: string, userId: string) {
    const comment = await repo.getCommentById(commentId);
    if (!comment || comment.deletedAt) throw new NotFoundError('Comment not found');
    await CardService.getCardById(comment.cardId, userId);
    return comment;
  }

  static async updateComment(commentId: string, userId: string, content: string) {
    const existing = await this.getCommentById(commentId, userId);
    if (existing.userId !== userId) throw new ForbiddenError('You can only edit your own comment');
    return repo.editComment(commentId, content);
  }

  static async deleteComment(commentId: string, userId: string) {
    const existing = await this.getCommentById(commentId, userId);
    if (existing.userId !== userId) throw new ForbiddenError('You can only delete your own comment');
    return repo.softDeleteComment(commentId);
  }
}