import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { db } from '../src/lib/db';
import { POST as createTask } from '../src/app/api/tasks/route';
import { PATCH as updateTask, DELETE as deleteTask } from '../src/app/api/tasks/[id]/route';
import { POST as completeTask } from '../src/app/api/tasks/[id]/complete/route';
import { GET as getCalendarMonth } from '../src/app/api/calendar/month/route';
import { GET as getCategories, POST as createCategory } from '../src/app/api/categories/route';

describe('Deliverable 7 — Auto-Generated Mutation Matrix & Contract Invariants', () => {
  let createdTaskId: string;

  beforeEach(async () => {
    await db.task.deleteMany({});

    const user = await db.user.upsert({
      where: { id: 'user-default' },
      update: {},
      create: {
        id: 'user-default',
        email: 'user@chronotask.internal',
        name: 'Default User',
      },
    });

    const task = await db.task.create({
      data: {
        id: 'task-test-base',
        userId: user.id,
        title: 'Base Task',
        date: '2026-09-01',
        completed: false,
        priority: 'MEDIUM',
      },
    });
    createdTaskId = task.id;
  });

  // 1. Null Injection
  it('POST /api/tasks: Null injection for title -> 422', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: null,
        date: '2026-09-01',
      }),
    });
    const res = await createTask(req);
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.code).toBe('VALIDATION_FAILED');
  });

  it('POST /api/tasks: Null injection for date -> 422', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Valid Title',
        date: null,
      }),
    });
    const res = await createTask(req);
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.code).toBe('VALIDATION_FAILED');
  });

  // 2. Type Mutation
  it('POST /api/tasks: Type mutation priority=12345 -> 422', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Valid Title',
        date: '2026-09-01',
        priority: 12345,
      }),
    });
    const res = await createTask(req);
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.code).toBe('VALIDATION_FAILED');
  });

  // 3. Enum Value Mutation
  it('POST /api/tasks: Enum mutation priority="SUPER_URGENT" -> 422', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Valid Title',
        date: '2026-09-01',
        priority: 'SUPER_URGENT',
      }),
    });
    const res = await createTask(req);
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.code).toBe('VALIDATION_FAILED');
  });

  // 4. Boundary Checks: Title length > 200
  it('POST /api/tasks: Boundary check title length > 200 -> 422', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'A'.repeat(250),
        date: '2026-09-01',
      }),
    });
    const res = await createTask(req);
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.code).toBe('VALIDATION_FAILED');
  });

  // 5. Boundary Checks on Calendar: month 13, month 0, year 1990
  it('GET /api/calendar/month: month=13 -> 400 Bad Request', async () => {
    const req = new NextRequest('http://localhost:3000/api/calendar/month?year=2026&month=13');
    const res = await getCalendarMonth(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('INVALID_QUERY_PARAMS');
  });

  it('GET /api/calendar/month: month=0 -> 400 Bad Request', async () => {
    const req = new NextRequest('http://localhost:3000/api/calendar/month?year=2026&month=0');
    const res = await getCalendarMonth(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('INVALID_QUERY_PARAMS');
  });

  it('GET /api/calendar/month: year=1990 -> 400 Bad Request', async () => {
    const req = new NextRequest('http://localhost:3000/api/calendar/month?year=1990&month=9');
    const res = await getCalendarMonth(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('INVALID_QUERY_PARAMS');
  });

  // 6. ID Mutation: Complete Non-existent ID -> 404
  it('POST /api/tasks/{id}/complete: ID mutation with non-existent id -> 404', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks/non-existent-id/complete', {
      method: 'POST',
    });
    const res = await completeTask(req, { params: { id: 'non-existent-id' } });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.code).toBe('NOT_FOUND');
  });

  // 7. PATCH /api/tasks/{id} and DELETE /api/tasks/{id}
  it('PATCH and DELETE /api/tasks/{id} workflow', async () => {
    // PATCH
    const patchReq = new NextRequest(`http://localhost:3000/api/tasks/${createdTaskId}`, {
      method: 'PATCH',
      body: JSON.stringify({
        title: 'Updated Title',
        priority: 'URGENT',
      }),
    });
    const patchRes = await updateTask(patchReq, { params: { id: createdTaskId } });
    expect(patchRes.status).toBe(200);
    const patchJson = await patchRes.json();
    expect(patchJson.title).toBe('Updated Title');
    expect(patchJson.priority).toBe('URGENT');

    // DELETE
    const delReq = new NextRequest(`http://localhost:3000/api/tasks/${createdTaskId}`, {
      method: 'DELETE',
    });
    const delRes = await deleteTask(delReq, { params: { id: createdTaskId } });
    expect(delRes.status).toBe(204);

    // Verify deleted
    const checkReq = new NextRequest(`http://localhost:3000/api/tasks/${createdTaskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ title: 'Should fail' }),
    });
    const checkRes = await updateTask(checkReq, { params: { id: createdTaskId } });
    expect(checkRes.status).toBe(404);
  });

  // 8. Categories GET and POST
  it('Categories API operations', async () => {
    const postReq = new NextRequest('http://localhost:3000/api/categories', {
      method: 'POST',
      body: JSON.stringify({
        name: 'Design',
        color: '#8B5CF6',
      }),
    });
    const postRes = await createCategory(postReq);
    expect(postRes.status).toBe(201);
    const postJson = await postRes.json();
    expect(postJson.name).toBe('Design');
    expect(postJson.color).toBe('#8B5CF6');

    const getRes = await getCategories();
    expect(getRes.status).toBe(200);
    const getJson = await getRes.json();
    expect(Array.isArray(getJson)).toBe(true);
    expect(getJson.some((c: any) => c.name === 'Design')).toBe(true);
  });
});
