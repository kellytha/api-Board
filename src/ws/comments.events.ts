import { getIO } from "./websocket";

// Replace with real Prisma type if needed
export interface CommentEventPayload {
  id: number;
  cardId: number;
  parentId?: number | null;
  content: string;
  [key: string]: any;
}

export function emitCommentAdded(comment: CommentEventPayload) {
  getIO().emit("comment:added", comment);
}

export function emitCommentEdited(comment: CommentEventPayload) {
  getIO().emit("comment:edited", comment);
}

export function emitCommentDeleted(commentId: number) {
  getIO().emit("comment:deleted", { id: commentId });
}