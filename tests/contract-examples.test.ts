import { describe, it, expect, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { db } from '../src/lib/db';
import { GET as getHealth } from '../src/app/api/health/route';
import { GET as getTasks, POST as createTask } from '../src/app/api/tasks/route';
import { GET as getTaskById } from '../src/app/api/tasks/[id]/route';
import { POST as completeTask } from '../src/app/api/tasks/[id]/complete/route';
import { POST as uncompleteTask } from '../src/app/api/tasks/[id]/uncomplete/route';
import { GET as getCalendarMonth } from '../src/app/api/calendar/month/route';
import { GET as getAnalyticsSummary } from '../src/app/api/analytics/summary/route';

describe('Deliverable 5 — Named Examples Catalogue Verification', () => {
  beforeEach(async () => {
    // Reset tasks and recurrences
    await db.task.deleteMany({});
    await db.recurrence.deleteMany({});
    await db.category.deleteMany({});
    await db.user.deleteMany({});

    const user = await db.user.upsert({
      where: { id: 'user-default' },
      update: {},
      create: {
        id: 'user-default',
        email: 'user@chronotask.internal',
        name: 'Default User',
      },
    });

    const cat1 = await db.category.upsert({
      where: { id: 'cat-1' },
      update: {},
      create: {
        id: 'cat-1',
        userId: user.id,
        name: 'Engineering',
        color: '#2563EB',
      },
    });

    const cat2 = await db.category.upsert({
      where: { id: 'cat-2' },
      update: {},
      create: {
        id: 'cat-2',
        userId: user.id,
        name: 'Operations',
        color: '#059669',
      },
    });

    const rec50 = await db.recurrence.upsert({
      where: { id: 'rec-50' },
      update: {},
      create: {
        id: 'rec-50',
        frequency: 'WEEKDAYS',
        interval: 1,
        byWeekdays: JSON.stringify([1, 2, 3, 4, 5]),
        untilDate: '2026-10-30',
      },
    });

    await db.task.create({
      data: {
        id: 'task-101',
        userId: user.id,
        title: 'Analyze Quarterly Metrics',
        description: 'Review performance reports for Q3',
        date: '2026-09-01',
        dueTime: '14:30',
        completed: true,
        completedAt: new Date('2026-09-01T14:45:00Z'),
        priority: 'HIGH',
        categoryId: cat1.id,
        recurrenceId: null,
        createdAt: new Date('2026-08-30T09:00:00Z'),
        updatedAt: new Date('2026-09-01T14:45:00Z'),
      },
    });

    await db.task.create({
      data: {
        id: 'task-102',
        userId: user.id,
        title: 'Deploy Gateway Update',
        description: null,
        date: '2026-09-01',
        dueTime: null,
        completed: false,
        completedAt: null,
        priority: 'URGENT',
        categoryId: cat2.id,
        recurrenceId: rec50.id,
        createdAt: new Date('2026-08-30T09:15:00Z'),
        updatedAt: new Date('2026-08-30T09:15:00Z'),
      },
    });
  });

  // Example 1: 200_health_ok
  it('200_health_ok: Verifies readiness probe', async () => {
    const res = await getHealth();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.status).toBe('ok');
    expect(json.database).toBe('connected');
    expect(typeof json.timestamp).toBe('string');
  });

  // Example 2: 200_success_filter_date
  it('200_success_filter_date: Checks deterministic date filtering', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks?date=2026-09-01');
    const res = await getTasks(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json)).toBe(true);
    expect(json.length).toBe(2);
    expect(json.map((t: any) => t.id)).toContain('task-101');
    expect(json.map((t: any) => t.id)).toContain('task-102');
  });

  // Example 3: 400_invalid_date_format
  it('400_invalid_date_format: Validates YYYY-MM-DD pattern validation', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks?date=01-09-2026');
    const res = await getTasks(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.code).toBe('INVALID_QUERY_PARAMS');
    expect(json.path).toBe('/api/tasks');
    expect(json.details?.field).toBe('date');
    expect(json.details?.provided).toBe('01-09-2026');
  });

  // Example 4: 201_created_single_task
  it('201_created_single_task: Verifies task creation workflow', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: 'Review System Architecture',
        description: 'Finalize calendar schema contracts',
        date: '2026-09-01',
        dueTime: '11:00',
        priority: 'HIGH',
        categoryId: 'cat-1',
        recurrenceConfig: null,
      }),
    });
    const res = await createTask(req);
    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.title).toBe('Review System Architecture');
    expect(json.priority).toBe('HIGH');
    expect(json.completed).toBe(false);
    expect(json.completedAt).toBeNull();
    expect(json.id).toBeDefined();
  });

  // Example 5: 422_missing_title
  it('422_missing_title: Empty string constraint check', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks', {
      method: 'POST',
      body: JSON.stringify({
        title: '',
        description: 'Invalid empty title',
        date: '2026-09-01',
        priority: 'MEDIUM',
      }),
    });
    const res = await createTask(req);
    expect(res.status).toBe(422);
    const json = await res.json();
    expect(json.code).toBe('VALIDATION_FAILED');
    expect(json.path).toBe('/api/tasks');
    expect(json.details?.field).toBe('title');
  });

  // Example 6: 200_success_task_101
  it('200_success_task_101: Retrieval of existing task', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks/task-101');
    const res = await getTaskById(req, { params: { id: 'task-101' } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe('task-101');
    expect(json.title).toBe('Analyze Quarterly Metrics');
    expect(json.completed).toBe(true);
    expect(json.completedAt).toBe('2026-09-01T14:45:00.000Z');
  });

  // Example 7: 404_task_not_found
  it('404_task_not_found: Non-existent record query', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks/task-99999');
    const res = await getTaskById(req, { params: { id: 'task-99999' } });
    expect(res.status).toBe(404);
    const json = await res.json();
    expect(json.code).toBe('NOT_FOUND');
    expect(json.message).toContain('task-99999');
    expect(json.path).toBe('/api/tasks/task-99999');
  });

  // Example 8: 200_task_completed
  it('200_task_completed: Deliberate completion flow sets completedAt', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks/task-102/complete', {
      method: 'POST',
    });
    const res = await completeTask(req, { params: { id: 'task-102' } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe('task-102');
    expect(json.completed).toBe(true);
    expect(json.completedAt).not.toBeNull();
  });

  // Example 9: 409_already_completed
  it('409_already_completed: Guard against double completion', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks/task-101/complete', {
      method: 'POST',
    });
    const res = await completeTask(req, { params: { id: 'task-101' } });
    expect(res.status).toBe(409);
    const json = await res.json();
    expect(json.code).toBe('TASK_ALREADY_COMPLETED');
    expect(json.path).toBe('/api/tasks/task-101/complete');
    expect(json.details?.completedAt).toBeDefined();
  });

  // Example 10: 200_task_uncompleted
  it('200_task_uncompleted: Reversion of completed task resets completedAt', async () => {
    const req = new NextRequest('http://localhost:3000/api/tasks/task-101/uncomplete', {
      method: 'POST',
    });
    const res = await uncompleteTask(req, { params: { id: 'task-101' } });
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.id).toBe('task-101');
    expect(json.completed).toBe(false);
    expect(json.completedAt).toBeNull();
  });

  // Example 11: 200_calendar_month_sept_2026
  it('200_calendar_month_sept_2026: Month rollup with 4 day status tiers', async () => {
    await db.task.create({
      data: {
        userId: 'user-default',
        title: 'Task A',
        date: '2026-09-02',
        completed: true,
        priority: 'MEDIUM',
      },
    });
    await db.task.create({
      data: {
        userId: 'user-default',
        title: 'Task B',
        date: '2026-09-02',
        completed: false,
        priority: 'MEDIUM',
      },
    });
    await db.task.create({
      data: {
        userId: 'user-default',
        title: 'Task C',
        date: '2026-09-03',
        completed: false,
        priority: 'MEDIUM',
      },
    });

    const req = new NextRequest('http://localhost:3000/api/calendar/month?year=2026&month=9');
    const res = await getCalendarMonth(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.year).toBe(2026);
    expect(json.month).toBe(9);
    expect(json.days.length).toBe(30);

    const day1 = json.days.find((d: any) => d.date === '2026-09-01');
    expect(day1.status).toBe('partially_completed');
    expect(day1.colorCode).toBe('yellow');

    const day2 = json.days.find((d: any) => d.date === '2026-09-02');
    expect(day2.status).toBe('partially_completed');
    expect(day2.colorCode).toBe('yellow');

    const day3 = json.days.find((d: any) => d.date === '2026-09-03');
    expect(day3.status).toBe('none_completed');
    expect(day3.colorCode).toBe('red');

    const day4 = json.days.find((d: any) => d.date === '2026-09-04');
    expect(day4.status).toBe('no_tasks');
    expect(day4.colorCode).toBe('neutral');
  });

  // Example 12: 200_weekly_analytics
  it('200_weekly_analytics: Verifies factual analytics synthesis', async () => {
    const req = new NextRequest('http://localhost:3000/api/analytics/summary?period=weekly&date=2026-09-01');
    const res = await getAnalyticsSummary(req);
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.period).toBe('weekly');
    expect(json.anchorDate).toBe('2026-09-01');
    expect(json.startDate).toBe('2026-08-31');
    expect(json.endDate).toBe('2026-09-06');
    expect(typeof json.totalTasks).toBe('number');
    expect(typeof json.completedTasks).toBe('number');
    expect(typeof json.completionRate).toBe('number');
    expect(json.priorityBreakdown.HIGH).toBeDefined();
    expect(Array.isArray(json.trendData)).toBe(true);
    expect(Array.isArray(json.insights)).toBe(true);
    expect(json.insights.length).toBeGreaterThan(0);
  });
});
