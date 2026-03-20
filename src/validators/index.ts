import { z } from 'zod';

// Auth Validation Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  username: z.string().min(3, 'Username must be at least 3 characters').max(50, 'Username must not exceed 50 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Board Validation Schemas
export const createBoardSchema = z.object({
  name: z.string().min(1, 'Board name is required').max(255, 'Board name must not exceed 255 characters'),
  description: z.string().max(1000, 'Description must not exceed 1000 characters').optional(),
});

export const updateBoardSchema = createBoardSchema.partial();

// Column Validation Schemas
export const createColumnSchema = z.object({
  name: z.string().min(1, 'Column name is required').max(255, 'Column name must not exceed 255 characters'),
  position: z.number().int('Position must be an integer').min(0, 'Position must be non-negative'),
});

export const updateColumnSchema = createColumnSchema.partial();

// Card Validation Schemas
export const createCardSchema = z.object({
  title: z.string().min(1, 'Card title is required').max(255, 'Card title must not exceed 255 characters'),
  description: z.string().max(5000, 'Description must not exceed 5000 characters').optional(),
  position: z.number().int('Position must be an integer').min(0, 'Position must be non-negative'),
  dueDate: z.string().datetime().optional().nullable(),
});

export const updateCardSchema = createCardSchema.partial();
export const updateCardWithConflictSchema = updateCardSchema.extend({
  expectedUpdatedAt: z.string().datetime('expectedUpdatedAt must be an ISO datetime'),
});

export const moveCardSchema = z.object({
  columnId: z.string().min(1, 'Target column ID is required'),
  position: z.number().int('Position must be an integer').min(0, 'Position must be non-negative'),
});

export const reorderCardsSchema = z.object({
  cards: z.array(
    z.object({
      id: z.string().min(1, 'Card ID is required'),
    })
  ).min(1, 'Cards array must not be empty'),
});

// Tag Validation Schemas
export const createTagSchema = z.object({
  name: z.string().min(1, 'Tag name is required').max(100, 'Tag name must not exceed 100 characters'),
  color: z.string().regex(/^#[0-9A-Fa-f]{6}$/, 'Color must be a valid hex color'),
});

export const updateTagSchema = createTagSchema.partial();

// Card-Tag Assignment
export const assignTagSchema = z.object({
  tagId: z.string().min(1, 'Tag ID is required'),
});

// Comment Validation Schemas
export const createCommentSchema = z.object({
  cardId: z.string().min(1, 'Card ID is required'),
  content: z.string().min(1, 'Comment content is required').max(5000, 'Comment must not exceed 5000 characters'),
  parentId: z.string().min(1).optional().nullable(),
});

export const updateCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required').max(5000, 'Comment must not exceed 5000 characters'),
});

// Type exports for use in controllers
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateBoardInput = z.infer<typeof createBoardSchema>;
export type UpdateBoardInput = z.infer<typeof updateBoardSchema>;
export type CreateColumnInput = z.infer<typeof createColumnSchema>;
export type UpdateColumnInput = z.infer<typeof updateColumnSchema>;
export type CreateCardInput = z.infer<typeof createCardSchema>;
export type UpdateCardInput = z.infer<typeof updateCardSchema>;
export type CreateTagInput = z.infer<typeof createTagSchema>;
export type UpdateTagInput = z.infer<typeof updateTagSchema>;
export type AssignTagInput = z.infer<typeof assignTagSchema>;
export type CreateCommentInput = z.infer<typeof createCommentSchema>;
