import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notFoundResponse, conflictResponse, internalServerErrorResponse } from '@/lib/errors';

interface Params {
  params: { id: string };
}

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = params;
  const path = `/api/tasks/${id}/complete`;

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

    const updated = await db.task.update({
      where: { id },
      data: {
        completed: true,
        completedAt: new Date(),
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
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error(`Error completing task ${id}:`, err);
    return internalServerErrorResponse(path);
  }
}
