import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { notFoundResponse, validationFailedResponse, internalServerErrorResponse } from '@/lib/errors';
import { UpdateTaskSchema } from '@/lib/validations/tasks';
import { EditScopeEnum } from '@/lib/validations/common';

interface Params {
  params: { id: string };
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = params;
  const path = `/api/tasks/${id}`;

  try {
    const task = await db.task.findUnique({
      where: { id },
    });

    if (!task) {
      return notFoundResponse(`Task with ID '${id}' was not found.`, path);
    }

    return NextResponse.json({
      id: task.id,
      userId: task.userId,
      title: task.title,
      description: task.description,
      date: task.date,
      dueTime: task.dueTime,
      completed: task.completed,
      completedAt: task.completedAt ? task.completedAt.toISOString() : null,
      priority: task.priority,
      categoryId: task.categoryId,
      recurrenceId: task.recurrenceId,
      originalDate: task.originalDate,
      rescheduledFrom: task.rescheduledFrom,
      rescheduleType: task.rescheduleType,
      rescheduleCount: task.rescheduleCount,
      createdAt: task.createdAt.toISOString(),
      updatedAt: task.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error(`Error fetching task ${id}:`, err);
    return internalServerErrorResponse(path);
  }
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = params;
  const path = `/api/tasks/${id}`;
  const { searchParams } = new URL(req.url);
  const scopeParam = searchParams.get('editScope') ?? 'single';

  const parsedScope = EditScopeEnum.safeParse(scopeParam);
  const editScope = parsedScope.success ? parsedScope.data : 'single';

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return validationFailedResponse('Invalid JSON payload in request body.', path, {
      field: 'body',
      issue: 'Malformed JSON payload.',
    });
  }

  const parsed = UpdateTaskSchema.safeParse(body);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue.path.length > 0 ? issue.path.join('.') : 'body';
    return validationFailedResponse('Validation failed on one or more fields.', path, {
      field,
      issue: issue.message,
    });
  }

  const updateData = parsed.data;

  try {
    const existing = await db.task.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFoundResponse(`Task with ID '${id}' was not found.`, path);
    }

    // Build update payload
    const dataToUpdate: Record<string, unknown> = {};
    if (updateData.title !== undefined) dataToUpdate.title = updateData.title;
    if (updateData.description !== undefined) dataToUpdate.description = updateData.description;
    if (updateData.date !== undefined) dataToUpdate.date = updateData.date;
    if (updateData.dueTime !== undefined) dataToUpdate.dueTime = updateData.dueTime;
    if (updateData.priority !== undefined) dataToUpdate.priority = updateData.priority;
    if (updateData.categoryId !== undefined) dataToUpdate.categoryId = updateData.categoryId;

    if (existing.recurrenceId && editScope !== 'single') {
      const scopeWhere: Record<string, unknown> = {
        recurrenceId: existing.recurrenceId,
      };

      if (editScope === 'future') {
        scopeWhere.date = { gte: existing.date };
      }

      // If updating date across multiple recurring tasks, do not overwrite distinct dates
      const multiUpdateData = { ...dataToUpdate };
      delete multiUpdateData.date;

      if (Object.keys(multiUpdateData).length > 0) {
        await db.task.updateMany({
          where: scopeWhere,
          data: multiUpdateData,
        });
      }
    }

    // Update the specific instance
    const updated = await db.task.update({
      where: { id },
      data: dataToUpdate,
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
    console.error(`Error updating task ${id}:`, err);
    return internalServerErrorResponse(path);
  }
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const { id } = params;
  const path = `/api/tasks/${id}`;
  const { searchParams } = new URL(req.url);
  const scopeParam = searchParams.get('scope') ?? 'single';

  const parsedScope = EditScopeEnum.safeParse(scopeParam);
  const scope = parsedScope.success ? parsedScope.data : 'single';

  try {
    const existing = await db.task.findUnique({
      where: { id },
    });

    if (!existing) {
      return notFoundResponse(`Task with ID '${id}' was not found.`, path);
    }

    if (existing.recurrenceId && scope !== 'single') {
      const scopeWhere: Record<string, unknown> = {
        recurrenceId: existing.recurrenceId,
      };

      if (scope === 'future') {
        scopeWhere.date = { gte: existing.date };
      }

      await db.task.deleteMany({
        where: scopeWhere,
      });
    } else {
      await db.task.delete({
        where: { id },
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error(`Error deleting task ${id}:`, err);
    return internalServerErrorResponse(path);
  }
}
