import { EventEmitter } from 'events';

export type CardCreatedEvent = { cardId: string; columnId: string };
export type CardMovedEvent = {
  cardId: string;
  fromColumnId: string;
  toColumnId: string;
  toPosition: number;
};
export type CommentAddedEvent = { commentId: string; cardId: string };

type EventMap = {
  'card.created': CardCreatedEvent;
  'card.moved': CardMovedEvent;
  'comment.added': CommentAddedEvent;
};

class TypedEventBus extends EventEmitter {
  emit<K extends keyof EventMap>(eventName: K, payload: EventMap[K]): boolean {
    return super.emit(eventName, payload);
  }
  on<K extends keyof EventMap>(eventName: K, listener: (payload: EventMap[K]) => void): this {
    return super.on(eventName, listener);
  }
}

export const eventBus = new TypedEventBus();

