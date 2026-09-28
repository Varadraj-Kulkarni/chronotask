import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notFoundResponse, conflictResponse, internalServerErrorResponse } from '@/lib/errors';
import { toCalendarDateString } from '@/lib/dateUtils';

interface Params {
  params: { id: string };
}

export async function POST(req: NextRequest, { params }: Params) {
  const { id } = params;
  const path = `/api/tasks/${id}/complete`;

  let postponeToToday = false;
  try {
    const body = await req.json();
    if (body && typeof body === 'object' && body.postponeToToday === true) {
      postponeToToday = true;
    }
  } catch {
    // Body is optional for standard completion
  }

  try {
    const existing = await db.task.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFoundResponse(`Task with ID '${id}' was not found.`, path);
    }

    if (existing.completed) {
      return conflictResponse(
        `Task '${id}' is already marked as completed.`,
        path,
        {
          completedAt: existing.completedAt ? existing.completedAt.toISOString() : null,
        }
      );
    }

    const completedAt = new Date();

    // 1. Mark original task complete on its original date to preserve historical accuracy
    const updated = await db.task.update({
      where: { id },
      data: {
        completed: true,
        completedAt,
      },
    });

    // 2. If user chose "Complete & Postpone to Today" for an overdue task
    const todayStr = toCalendarDateString(new Date());
    let todayTask = null;

    if (postponeToToday && existing.date < todayStr) {
      todayTask = await db.task.create({
        data: {
          userId: existing.userId,
          title: existing.title,
          description: existing.description,
          date: todayStr,
          dueTime: existing.dueTime,
          priority: existing.priority,
          categoryId: existing.categoryId,
          completed: true,
          completedAt,
          originalDate: existing.originalDate || existing.date,
          rescheduledFrom: existing.date,
          rescheduleType: 'OVERDUE_COMPLETED',
          rescheduleCount: (existing.rescheduleCount || 0) + 1,
        },
      });
    }

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
      todayOccurrence: todayTask ? {
        id: todayTask.id,
        date: todayTask.date,
        rescheduledFrom: todayTask.rescheduledFrom,
      } : null,
    });
  } catch (err) {
    console.error(`Error completing task ${id}:`, err);
    return internalServerErrorResponse(path);
  }
}
