import { describe, expect, test } from '@jest/globals';
import { CommentService } from '../commentService.js';

describe('CommentService', () => {
  test('exports expected methods', () => {
    expect(typeof CommentService.createComment).toBe('function');
    expect(typeof CommentService.getCardComments).toBe('function');
    expect(typeof CommentService.updateComment).toBe('function');
    expect(typeof CommentService.deleteComment).toBe('function');
  });
});

