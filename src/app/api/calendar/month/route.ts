import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invalidQueryParamsResponse, internalServerErrorResponse } from '@/lib/errors';
import { MonthQuerySchema } from '@/lib/validations/calendar';
import { formatDateString } from '@/lib/recurrence';

export async function GET(req: NextRequest) {
  const path = '/api/calendar/month';
  const { searchParams } = new URL(req.url);

  const yearParam = searchParams.get('year');
  const monthParam = searchParams.get('month');

  const parsed = MonthQuerySchema.safeParse({
    year: yearParam,
    month: monthParam,
  });

  if (!parsed.success) {
    return invalidQueryParamsResponse(
      "Query parameters 'year' (2000-2100) and 'month' (1-12) must be valid integers.",
      path,
      {
        year: yearParam,
        month: monthParam,
        issues: parsed.error.flatten().fieldErrors,
      }
    );
  }

  const { year, month } = parsed.data;

  try {
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const startDate = formatDateString(year, month, 1);
    const endDate = formatDateString(year, month, daysInMonth);

    const tasks = await db.task.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });

    // Map tasks by date
    const tasksByDate = new Map<string, { total: number; completed: number }>();

    for (const t of tasks) {
      const current = tasksByDate.get(t.date) || { total: 0, completed: 0 };
      current.total++;
      if (t.completed) {
        current.completed++;
      }
      tasksByDate.set(t.date, current);
    }

    const days = [];
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = formatDateString(year, month, d);
      const counts = tasksByDate.get(dateStr) || { total: 0, completed: 0 };

      let status: 'no_tasks' | 'none_completed' | 'partially_completed' | 'all_completed';
      let colorCode: 'neutral' | 'red' | 'yellow' | 'blue';

      if (counts.total === 0) {
        status = 'no_tasks';
        colorCode = 'neutral';
      } else if (counts.completed === 0) {
        status = 'none_completed';
        colorCode = 'red';
      } else if (counts.completed < counts.total) {
        status = 'partially_completed';
        colorCode = 'yellow';
      } else {
        status = 'all_completed';
        colorCode = 'blue';
      }

      days.push({
        date: dateStr,
        totalTasks: counts.total,
        completedTasks: counts.completed,
        status,
        colorCode,
      });
    }

    return NextResponse.json({
      year,
      month,
      days,
    });
  } catch (err) {
    console.error('Error computing month calendar status:', err);
    return internalServerErrorResponse(path);
  }
}
