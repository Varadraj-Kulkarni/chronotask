import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notFoundResponse, validationFailedResponse, internalServerErrorResponse } from '@/lib/errors';
import { RescheduleTaskSchema } from '@/lib/validations/tasks';
import { toCalendarDateString } from '@/lib/dateUtils';

interface Params {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = params;
  const path = `/api/tasks/${id}/reschedule`;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return validationFailedResponse('Invalid JSON payload in request body.', path, {
      field: 'body',
      issue: 'Malformed JSON payload.',
    });
  }

  const parsed = RescheduleTaskSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue.path.length > 0 ? issue.path.join('.') : 'body';
    return validationFailedResponse('Validation failed on one or more fields.', path, {
      field,
      issue: issue.message,
    });
  }

  const { newDate, dueTime, actionType } = parsed.data;

  try {
    const existing = await db.task.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFoundResponse(`Task with ID '${id}' was not found.`, path);
    }

    if (existing.completed) {
      return NextResponse.json(
        {
          code: 'TASK_ALREADY_COMPLETED',
          message: 'Completed tasks cannot be rescheduled.',
          path,
          timestamp: new Date().toISOString(),
        },
        { status: 400 }
      );
    }

    const todayStr = toCalendarDateString(new Date());

    // 1. Postpone Validation: new_date > current_task_date
    if (actionType === 'POSTPONE') {
      if (newDate <= existing.date) {
        return validationFailedResponse(
          'A postponed task must be moved to a future date.',
          path,
          {
            field: 'newDate',
            currentDate: existing.date,
            providedDate: newDate,
          }
        );
      }
    }

    // 2. Prepone Validation: today <= new_date < current_task_date
    if (actionType === 'PREPONE') {
      if (newDate < todayStr) {
        return validationFailedResponse(
          'A task cannot be preponed to a date that has already passed.',
          path,
          {
            field: 'newDate',
            today: todayStr,
            providedDate: newDate,
          }
        );
      }

      if (newDate >= existing.date) {
        return validationFailedResponse(
          'A task cannot be preponed to its current date or a future date.',
          path,
          {
            field: 'newDate',
            currentDate: existing.date,
            providedDate: newDate,
          }
        );
      }
    }

    // Preserve original date across multiple reschedules
    const originalDate = existing.originalDate || existing.date;
    const rescheduledFrom = existing.date;
    const rescheduleType = actionType === 'POSTPONE' ? 'POSTPONED' : 'PREPONED';
    const rescheduleCount = (existing.rescheduleCount || 0) + 1;

    // Preserve existing dueTime unless user provided an explicit change
    const updatedDueTime = dueTime !== undefined ? dueTime : existing.dueTime;

    // Rescheduling an occurrence modifies ONLY this single occurrence, keeping recurrence series intact
    const updated = await db.task.update({
      where: { id },
      data: {
        date: newDate,
        dueTime: updatedDueTime,
        originalDate,
        rescheduledFrom,
        rescheduleType,
        rescheduleCount,
      },
    });

    return NextResponse.json({
      id: updated.id,
      userId: updated.userId,
      title: updated.title,
      description: updated.description,
      date: updated.date,
      dueTime: updated.dueTime,
      completed: updated.completed,
      completedAt: updated.completedAt ? updated.completedAt.toISOString() : null,
      priority: updated.priority,
      categoryId: updated.categoryId,
      recurrenceId: updated.recurrenceId,
      originalDate: updated.originalDate,
      rescheduledFrom: updated.rescheduledFrom,
      rescheduleType: updated.rescheduleType,
      rescheduleCount: updated.rescheduleCount,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error(`Error rescheduling task ${id}:`, err);
    return internalServerErrorResponse(path);
  }
}
