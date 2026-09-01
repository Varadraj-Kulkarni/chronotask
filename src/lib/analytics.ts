import { parseDateString, formatDateString, addDays, getDayOfWeek } from './recurrence';

export interface PriorityCount {
  total: number;
  completed: number;
}

export interface TrendItem {
  label: string;
  date: string;
  total: number;
  completed: number;
}

export interface AnalyticsResult {
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  anchorDate: string;
  startDate: string;
  endDate: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  mostProductiveDay: string | null;
  missedTasks: number;
  priorityBreakdown: {
    LOW: PriorityCount;
    MEDIUM: PriorityCount;
    HIGH: PriorityCount;
    URGENT: PriorityCount;
  };
  trendData: TrendItem[];
  insights: string[];
}

export interface TaskRecord {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  completedAt: Date | null;
  priority: string;
}

const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export function calculateDateRange(
  period: 'daily' | 'weekly' | 'monthly' | 'yearly',
  anchorDate: string
): { startDate: string; endDate: string } {
  const { year, month, day } = parseDateString(anchorDate);

  if (period === 'daily') {
    return { startDate: anchorDate, endDate: anchorDate };
  }

  if (period === 'weekly') {
    const dow = getDayOfWeek(anchorDate); // 1 = Mon, 7 = Sun
    const startDate = addDays(anchorDate, -(dow - 1));
    const endDate = addDays(anchorDate, 7 - dow);
    return { startDate, endDate };
  }

  if (period === 'monthly') {
    const startDate = formatDateString(year, month, 1);
    const lastDayOfMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    const endDate = formatDateString(year, month, lastDayOfMonth);
    return { startDate, endDate };
  }

  // yearly
  const startDate = formatDateString(year, 1, 1);
  const endDate = formatDateString(year, 12, 31);
  return { startDate, endDate };
}

export function computeAnalytics(
  period: 'daily' | 'weekly' | 'monthly' | 'yearly',
  anchorDate: string,
  tasks: TaskRecord[]
): AnalyticsResult {
  const { startDate, endDate } = calculateDateRange(period, anchorDate);

  // Filter tasks within the computed period
  const periodTasks = tasks.filter((t) => t.date >= startDate && t.date <= endDate);

  const totalTasks = periodTasks.length;
  const completedTasks = periodTasks.filter((t) => t.completed).length;
  const missedTasks = totalTasks - completedTasks;
  const completionRate = totalTasks === 0 ? 0 : Number(((completedTasks / totalTasks) * 100).toFixed(2));

  // Priority Breakdown
  const priorityBreakdown: Record<string, PriorityCount> = {
    LOW: { total: 0, completed: 0 },
    MEDIUM: { total: 0, completed: 0 },
    HIGH: { total: 0, completed: 0 },
    URGENT: { total: 0, completed: 0 },
  };

  for (const t of periodTasks) {
    const p = t.priority in priorityBreakdown ? t.priority : 'MEDIUM';
    priorityBreakdown[p].total++;
    if (t.completed) {
      priorityBreakdown[p].completed++;
    }
  }

  // Trend data & Most productive day
  const trendData: TrendItem[] = [];
  const dayCompletionCount: Record<string, number> = {};

  if (period === 'daily') {
    trendData.push({
      label: anchorDate,
      date: anchorDate,
      total: totalTasks,
      completed: completedTasks,
    });
    if (completedTasks > 0) {
      const dow = getDayOfWeek(anchorDate);
      dayCompletionCount[DAY_NAMES[dow - 1]] = completedTasks;
    }
  } else if (period === 'weekly') {
    let curr = startDate;
    for (let i = 0; i < 7; i++) {
      const dayTasks = periodTasks.filter((t) => t.date === curr);
      const dayCompleted = dayTasks.filter((t) => t.completed).length;
      trendData.push({
        label: DAY_LABELS[i],
        date: curr,
        total: dayTasks.length,
        completed: dayCompleted,
      });

      if (dayCompleted > 0) {
        dayCompletionCount[DAY_NAMES[i]] = dayCompleted;
      }
      curr = addDays(curr, 1);
    }
  } else if (period === 'monthly') {
    const { year, month } = parseDateString(anchorDate);
    const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
    for (let d = 1; d <= daysInMonth; d++) {
      const curr = formatDateString(year, month, d);
      const dayTasks = periodTasks.filter((t) => t.date === curr);
      const dayCompleted = dayTasks.filter((t) => t.completed).length;
      trendData.push({
        label: `${d}`,
        date: curr,
        total: dayTasks.length,
        completed: dayCompleted,
      });

      if (dayCompleted > 0) {
        const dow = getDayOfWeek(curr);
        const name = DAY_NAMES[dow - 1];
        dayCompletionCount[name] = (dayCompletionCount[name] || 0) + dayCompleted;
      }
    }
  } else {
    // yearly
    const { year } = parseDateString(anchorDate);
    for (let m = 1; m <= 12; m++) {
      const prefix = `${year}-${String(m).padStart(2, '0')}`;
      const monthTasks = periodTasks.filter((t) => t.date.startsWith(prefix));
      const monthCompleted = monthTasks.filter((t) => t.completed).length;
      trendData.push({
        label: MONTH_LABELS[m - 1],
        date: `${prefix}-01`,
        total: monthTasks.length,
        completed: monthCompleted,
      });
    }

    for (const t of periodTasks) {
      if (t.completed) {
        const dow = getDayOfWeek(t.date);
        const name = DAY_NAMES[dow - 1];
        dayCompletionCount[name] = (dayCompletionCount[name] || 0) + 1;
      }
    }
  }

  // Find most productive day
  let mostProductiveDay: string | null = null;
  let maxCompleted = 0;
  for (const [day, count] of Object.entries(dayCompletionCount)) {
    if (count > maxCompleted) {
      maxCompleted = count;
      mostProductiveDay = day;
    }
  }

  // Generate factual contextual insights
  const insights: string[] = [];
  insights.push(`You completed ${Math.round(completionRate)}% of your tasks this ${period === 'daily' ? 'day' : period === 'weekly' ? 'week' : period === 'monthly' ? 'month' : 'year'}.`);

  if (mostProductiveDay) {
    insights.push(`${mostProductiveDay} was your most productive day.`);
  }

  if (completionRate >= 80) {
    insights.push('Your completion rate is exceptionally high across prioritized deliverables.');
  } else if (missedTasks > 0) {
    insights.push(`You have ${missedTasks} pending task${missedTasks > 1 ? 's' : ''} to follow up on.`);
  } else {
    insights.push('All tasks for this period have been successfully completed.');
  }

  return {
    period,
    anchorDate,
    startDate,
    endDate,
    totalTasks,
    completedTasks,
    completionRate,
    mostProductiveDay,
    missedTasks,
    priorityBreakdown: priorityBreakdown as AnalyticsResult['priorityBreakdown'],
    trendData,
    insights,
  };
}
