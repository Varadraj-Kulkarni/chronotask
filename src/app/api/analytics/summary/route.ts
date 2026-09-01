import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { invalidQueryParamsResponse, internalServerErrorResponse } from '@/lib/errors';
import { AnalyticsQuerySchema } from '@/lib/validations/analytics';
import { computeAnalytics } from '@/lib/analytics';

export async function GET(req: NextRequest) {
  const path = '/api/analytics/summary';
  const { searchParams } = new URL(req.url);

  const periodParam = searchParams.get('period');
  const dateParam = searchParams.get('date');

  const parsed = AnalyticsQuerySchema.safeParse({
    period: periodParam,
    date: dateParam,
  });

  if (!parsed.success) {
    return invalidQueryParamsResponse(
      "Query parameters 'period' (daily|weekly|monthly|yearly) and 'date' (YYYY-MM-DD) are required.",
      path,
      {
        period: periodParam,
        date: dateParam,
        issues: parsed.error.flatten().fieldErrors,
      }
    );
  }

  const { period, date } = parsed.data;

  try {
    const tasks = await db.task.findMany({
      select: {
        id: true,
        title: true,
        date: true,
        completed: true,
        completedAt: true,
        priority: true,
      },
    });

    const summary = computeAnalytics(period, date, tasks);

    return NextResponse.json(summary);
  } catch (err) {
    console.error('Error computing analytics summary:', err);
    return internalServerErrorResponse(path);
  }
}
