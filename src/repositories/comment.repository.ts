import { prisma } from '../db/prisma.js';

export async function createComment(data: {
  content: string;
  cardId: string;
  userId: string;
  parentId?: string | null;
}) {
  return prisma.comment.create({
    data,
    include: {
      user: { select: { id: true, username: true, email: true } },
      replies: true,
    },
  });
}

export async function getCommentsByCardId(cardId: string) {
  return prisma.comment.findMany({
    where: { cardId, deletedAt: null },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { id: true, username: true, email: true } },
      replies: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, username: true, email: true } } },
      },
    },
  });
}

export async function getCommentById(commentId: string) {
  return prisma.comment.findUnique({
    where: { id: commentId },
    include: {
      user: { select: { id: true, username: true, email: true } },
      replies: {
        where: { deletedAt: null },
        orderBy: { createdAt: 'asc' },
        include: { user: { select: { id: true, username: true, email: true } } },
      },
    },
  });
}

export async function editComment(id: string, content: string) {
  return prisma.comment.update({
    where: { id },
    data: { content },
    include: {
      user: { select: { id: true, username: true, email: true } },
      replies: true,
    },
  });
}

export async function softDeleteComment(id: string) {
  return prisma.comment.update({
    where: { id },
    data: { deletedAt: new Date() },
    include: {
      user: { select: { id: true, username: true, email: true } },
      replies: true,
    },
  });
}