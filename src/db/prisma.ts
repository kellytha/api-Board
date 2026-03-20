import { PrismaClient } from '@prisma/client';

// PrismaClient should be a singleton per process.
// In dev/watch mode, module caching keeps this stable.
export const prisma = new PrismaClient();

