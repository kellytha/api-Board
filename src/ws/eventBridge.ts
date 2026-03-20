import type { Server } from 'socket.io';
import { eventBus } from '../events/eventBus.js';

export function registerWebsocketEventBridge(io: Server) {
  eventBus.on('card.created', ({ cardId, columnId }) => {
    io.emit('card:created', { cardId, columnId });
  });

  eventBus.on('card.moved', ({ cardId, fromColumnId, toColumnId, toPosition }) => {
    io.emit('card:moved', { cardId, fromColumnId, toColumnId, toPosition });
  });

  eventBus.on('comment.added', ({ commentId, cardId }) => {
    io.emit('comment:added', { commentId, cardId });
  });
}

