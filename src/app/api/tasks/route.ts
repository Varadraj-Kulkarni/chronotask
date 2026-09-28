import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invalidQueryParamsResponse, validationFailedResponse, internalServerErrorResponse } from '@/lib/errors';
import { CreateTaskSchema } from '@/lib/validations/tasks';
import { DATE_REGEX, PriorityLevelEnum } from '@/lib/validations/common';
import { generateRecurrenceDates } from '@/lib/recurrence';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get('date');
  const completedParam = searchParams.get('completed');
  const priorityParam = searchParams.get('priority');

  if (dateParam !== null && !DATE_REGEX.test(dateParam)) {
    return invalidQueryParamsResponse(
      "Query parameter 'date' must conform to YYYY-MM-DD format.",
      '/api/tasks',
      { field: 'date', provided: dateParam }
    );
  }

  const whereClause: Record<string, unknown> = {};

  if (dateParam !== null) {
    whereClause.date = dateParam;
  }

  if (completedParam !== null) {
    whereClause.completed = completedParam === 'true';
  }

  if (priorityParam !== null) {
    const parsedPriority = PriorityLevelEnum.safeParse(priorityParam);
    if (!parsedPriority.success) {
      return invalidQueryParamsResponse(
        `Invalid priority level: ${priorityParam}`,
        '/api/tasks',
        { field: 'priority', provided: priorityParam }
      );
    }
    whereClause.priority = parsedPriority.data;
  }

  try {
    const tasks = await db.task.findMany({
      where: whereClause,
      orderBy: [{ date: 'asc' }, { dueTime: 'asc' }, { createdAt: 'asc' }],
    });

    const response = tasks.map((t) => ({
      id: t.id,
      userId: t.userId,
      title: t.title,
      description: t.description,
      date: t.date,
      dueTime: t.dueTime,
      completed: t.completed,
      completedAt: t.completedAt ? t.completedAt.toISOString() : null,
      priority: t.priority,
      categoryId: t.categoryId,
      recurrenceId: t.recurrenceId,
      originalDate: t.originalDate,
      rescheduledFrom: t.rescheduledFrom,
      rescheduleType: t.rescheduleType,
      rescheduleCount: t.rescheduleCount,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
    }));

    return NextResponse.json(response, { status: 200 });
  } catch (err) {
    console.error('Error fetching tasks:', err);
    return internalServerErrorResponse('/api/tasks');
  }
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return validationFailedResponse('Invalid JSON payload in request body.', '/api/tasks', {
      field: 'body',
      issue: 'Malformed JSON payload.',
    });
  }

  const parsed = CreateTaskSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue.path.length > 0 ? issue.path.join('.') : 'body';
    return validationFailedResponse('Validation failed on one or more fields.', '/api/tasks', {
      field,
      issue: issue.message,
    });
  }

  const data = parsed.data;

  try {
    // Duplicate Task Detection on Same Date (Requirement 7 & 8)
    if (!data.allowDuplicate) {
      const trimmedTitle = data.title.trim().toLowerCase();
      const existingTasksOnDate = await db.task.findMany({
        where: { date: data.date },
        select: { id: true, title: true, dueTime: true },
      });

      const duplicate = existingTasksOnDate.find((t) => {
        if (t.title.trim().toLowerCase() !== trimmedTitle) return false;
        // If both have no due time, or both have identical due times -> conflict
        const bothNoTime = !t.dueTime && !data.dueTime;
        const sameTime = t.dueTime && data.dueTime && t.dueTime === data.dueTime;
        return bothNoTime || sameTime;
      });

      if (duplicate) {
        return NextResponse.json(
          {
            code: 'DUPLICATE_TASK_WARNING',
            message: `A task named '${data.title}' already exists on this date. Do you want to create another one?`,
            details: {
              field: 'title',
              existingTaskId: duplicate.id,
              date: data.date,
            },
            timestamp: new Date().toISOString(),
            path: '/api/tasks',
          },
          { status: 409 }
        );
      }
    }

    let recurrenceId: string | null = null;
    let datesToCreate = [data.date];

    if (data.recurrenceConfig) {
      const rec = await db.recurrence.create({
        data: {
          frequency: data.recurrenceConfig.frequency,
          interval: data.recurrenceConfig.interval ?? 1,
          byWeekdays: data.recurrenceConfig.byWeekdays ? JSON.stringify(data.recurrenceConfig.byWeekdays) : null,
          untilDate: data.recurrenceConfig.untilDate ?? null,
        },
      });
      recurrenceId = rec.id;
      datesToCreate = generateRecurrenceDates(data.date, data.recurrenceConfig);
      if (!datesToCreate.includes(data.date)) {
        datesToCreate.unshift(data.date);
      }
    }

    // Create the primary/first task
    const firstDate = datesToCreate[0];
    const primaryTask = await db.task.create({
      data: {
        userId: 'user-default',
        title: data.title,
        description: data.description ?? null,
        date: firstDate,
        dueTime: data.dueTime ?? null,
        priority: data.priority ?? 'MEDIUM',
        categoryId: data.categoryId ?? null,
        recurrenceId,
        originalDate: firstDate,
        rescheduledFrom: null,
        rescheduleType: null,
        rescheduleCount: 0,
      },
    });

    // Create subsequent recurring tasks if any
    if (datesToCreate.length > 1) {
      for (let i = 1; i < datesToCreate.length; i++) {
        await db.task.create({
          data: {
            userId: 'user-default',
            title: data.title,
            description: data.description ?? null,
            date: datesToCreate[i],
            dueTime: data.dueTime ?? null,
            priority: data.priority ?? 'MEDIUM',
            categoryId: data.categoryId ?? null,
            recurrenceId,
            originalDate: datesToCreate[i],
            rescheduledFrom: null,
            rescheduleType: null,
            rescheduleCount: 0,
          },
        });
      }
    }

    return NextResponse.json(
      {
        id: primaryTask.id,
        userId: primaryTask.userId,
        title: primaryTask.title,
        description: primaryTask.description,
        date: primaryTask.date,
        dueTime: primaryTask.dueTime,
        completed: primaryTask.completed,
        completedAt: primaryTask.completedAt ? primaryTask.completedAt.toISOString() : null,
        priority: primaryTask.priority,
        categoryId: primaryTask.categoryId,
        recurrenceId: primaryTask.recurrenceId,
        originalDate: primaryTask.originalDate,
        rescheduledFrom: primaryTask.rescheduledFrom,
        rescheduleType: primaryTask.rescheduleType,
        rescheduleCount: primaryTask.rescheduleCount,
        createdAt: primaryTask.createdAt.toISOString(),
        updatedAt: primaryTask.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error('Error creating task:', err);
    return internalServerErrorResponse('/api/tasks');
  }
}
