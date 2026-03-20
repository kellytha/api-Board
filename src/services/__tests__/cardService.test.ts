import { describe, expect, test } from '@jest/globals';
import { CardService } from '../cardService.js';

// Pure unit-style tests for ordering helpers are limited because services
// talk to the database. Integration tests cover real flows.
describe('CardService', () => {
  test('exports expected methods', () => {
    expect(typeof CardService.createCard).toBe('function');
    expect(typeof CardService.moveCard).toBe('function');
    expect(typeof CardService.reorderCards).toBe('function');
    expect(typeof CardService.updateCard).toBe('function');
  });
});

