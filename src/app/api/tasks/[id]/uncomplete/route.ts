import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notFoundResponse, internalServerErrorResponse } from '@/lib/errors';

interface Params {
  params: { id: string };
}

export async function POST(_req: NextRequest, { params }: Params) {
  const { id } = params;
  const path = `/api/tasks/${id}/uncomplete`;

  try {
    const existing = await db.task.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFoundResponse(`Task with ID '${id}' was not found.`, path);
    }

    const updated = await db.task.update({
      where: { id },
      data: {
        completed: false,
        completedAt: null,
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
      completedAt: null,
      priority: updated.priority,
      categoryId: updated.categoryId,
      recurrenceId: updated.recurrenceId,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error(`Error uncompleting task ${id}:`, err);
    return internalServerErrorResponse(path);
  }
}
