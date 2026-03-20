import request from 'supertest';
import { describe, expect, test } from '@jest/globals';
import app from '../index.js';

// NOTE: These integration tests assume a reachable DATABASE_URL and migrated schema.
// They focus on the HTTP flow wiring rather than exhaustive data assertions.

async function registerAndLogin() {
  const email = `user_${Date.now()}@test.com`;
  const username = `user_${Date.now()}`;
  const password = 'Test1234!';

  const reg = await request(app)
    .post('/api/v1/auth/register')
    .send({ email, username, password, confirmPassword: password });

    console.log(reg.body)
  expect(reg.status).toBe(201);
  const token = reg.body?.data?.token;
  expect(typeof token).toBe('string');
  return { token, userId: reg.body.data.user.id };
}

test('Create board flow', async () => {
  const { token } = await registerAndLogin();
  const res = await request(app)
    .post('/api/v1/boards')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Test Board', description: 'Integration' });
  expect(res.status).toBe(201);
  expect(res.body.success).toBe(true);
});

test('Move card flow', async () => {
  const { token } = await registerAndLogin();
  const board = await request(app)
    .post('/api/v1/boards')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Board', description: '' });
  const boardId = board.body.data.id;

  const col1 = await request(app)
    .post('/api/v1/columns')
    .set('Authorization', `Bearer ${token}`)
    .send({ boardId, name: 'Todo', position: 0 });
  const col2 = await request(app)
    .post('/api/v1/columns')
    .set('Authorization', `Bearer ${token}`)
    .send({ boardId, name: 'Doing', position: 1 });
  const columnId1 = col1.body.data.id;
  const columnId2 = col2.body.data.id;

  const card = await request(app)
    .post('/api/v1/cards')
    .set('Authorization', `Bearer ${token}`)
    .send({ columnId: columnId1, title: 'Task', description: '', position: 0, dueDate: null });
  const cardId = card.body.data.id;

  const moved = await request(app)
    .post(`/api/v1/cards/${cardId}/move`)
    .set('Authorization', `Bearer ${token}`)
    .send({ columnId: columnId2, position: 0 });
  expect(moved.status).toBe(200);
  expect(moved.body.data.columnId).toBe(columnId2);
});

test('Comment flow (add + reply)', async () => {
  const { token } = await registerAndLogin();
  const board = await request(app)
    .post('/api/v1/boards')
    .set('Authorization', `Bearer ${token}`)
    .send({ name: 'Board', description: '' });
  const boardId = board.body.data.id;

  const col = await request(app)
    .post('/api/v1/columns')
    .set('Authorization', `Bearer ${token}`)
    .send({ boardId, name: 'Todo', position: 0 });
  const columnId = col.body.data.id;

  const card = await request(app)
    .post('/api/v1/cards')
    .set('Authorization', `Bearer ${token}`)
    .send({ columnId, title: 'Task', description: '', position: 0, dueDate: null });
  const cardId = card.body.data.id;

  const root = await request(app)
    .post('/api/v1/comments')
    .set('Authorization', `Bearer ${token}`)
    .send({ cardId, content: 'Root comment', parentId: null });
  expect(root.status).toBe(201);
  const rootId = root.body.data.id;

  const reply = await request(app)
    .post('/api/v1/comments')
    .set('Authorization', `Bearer ${token}`)
    .send({ cardId, content: 'Reply', parentId: rootId });
  expect(reply.status).toBe(201);
});

