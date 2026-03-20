import { describe, expect, test } from '@jest/globals';
import { BoardService } from '../boardService.js';

describe('BoardService', () => {
  test('exports expected methods', () => {
    expect(typeof BoardService.createBoard).toBe('function');
    expect(typeof BoardService.getUserBoards).toBe('function');
    expect(typeof BoardService.getBoardById).toBe('function');
  });
});

