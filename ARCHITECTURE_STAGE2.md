# Stage 2 Architecture

This document captures the key changes made to support collaboration and higher system quality.

## Real-time approach (Socket.IO + domain events)

**Goal**: Keep HTTP logic clean while still broadcasting collaboration updates.


- **Pattern**: Services emit **domain events** → a WebSocket bridge listens → emits Socket.IO events.
- **HTTP layer**: Controllers/services do not depend on Socket.IO directly.
- **Files**:
  - `src/events/eventBus.ts`: typed event bus (`card.created`, `card.moved`, `comment.added`)
  - `src/ws/eventBridge.ts`: subscribes to domain events and calls `io.emit(...)`
  - `src/ws/websocket.ts`: initializes Socket.IO and registers the bridge

**Emitted events**
- `card:created` (payload: `{ cardId, columnId }`)
- `card:moved` (payload: `{ cardId, fromColumnId, toColumnId, toPosition }`)
- `comment:added` (payload: `{ commentId, cardId }`)

## Ordering strategy (safe reindexing)

**Problem**: `Card` has `@@unique([columnId, position])`. Naive updates can cause duplicate positions (or transient conflicts) during reorder/move.

**Strategy**: **two-phase reindexing** inside a database transaction.

1. Assign each card a unique **temporary negative** position (e.g. `-1, -2, -3...`)
2. Assign final dense positions `0..n-1`

This avoids collisions while still ending with clean, stable ordering.

**Implemented in**
- `CardService.reorderCards(...)`
- `CardService.moveCard(...)` (reindexes both source and target columns)

## Conflict handling (optimistic updates)

**Goal**: Support frontend optimistic updates and detect write-write conflicts.

**Strategy**: client sends an `expectedUpdatedAt` timestamp with updates.

- API performs an update with a **precondition**:
  - `updateMany(where: { id, updatedAt: expectedUpdatedAt }, data: ...)`
- If no rows update, the API returns **412 Precondition Failed** indicating a conflict.

**Implemented in**
- `PATCH /api/v1/cards/:cardId` with body field `expectedUpdatedAt`
- Error type: `PreconditionFailedError` (HTTP 412)

## Comment system (threaded + integrity)

**Goal**: Comments on cards with threaded replies (min 2 levels), edit, and delete.

- Prisma schema uses a self-relation:
  - `parentId String?` referencing `Comment.id`
  - `parent` / `replies` relation named `"CommentThread"`
- Deletion uses **soft delete** (`deletedAt`) to preserve thread integrity.

## Performance notes

- `GET /api/v1/boards` is now **paginated** and does not eager-load the full board graph.
- `GET /api/v1/boards/:boardId` remains the “deep fetch” endpoint.
- `GET /api/v1/cards/column/:columnId` is **paginated**.

