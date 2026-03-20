import { getIO } from "./websocket";

// Example card interface — replace with your real model
export interface CardEventPayload {
  id: number;
  title?: string;
  columnId?: number;
  position?: number;
  [key: string]: any;
}

export function emitCardCreated(card: CardEventPayload) {
  getIO().emit("card:created", card);
}

export function emitCardMoved(card: CardEventPayload) {
  getIO().emit("card:moved", card);
}

export function emitCardUpdated(card: CardEventPayload) {
  getIO().emit("card:updated", card);
}

export function emitCardDeleted(cardId: number) {
  getIO().emit("card:deleted", { id: cardId });
}