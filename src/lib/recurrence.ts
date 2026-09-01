export interface RecurrenceInput {
  frequency: 'DAILY' | 'WEEKDAYS' | 'WEEKLY' | 'MONTHLY';
  interval?: number;
  byWeekdays?: number[] | null;
  untilDate?: string | null;
}

export function parseDateString(dateStr: string): { year: number; month: number; day: number } {
  const [y, m, d] = dateStr.split('-').map(Number);
  return { year: y, month: m, day: d };
}

export function formatDateString(year: number, month: number, day: number): string {
  const mm = String(month).padStart(2, '0');
  const dd = String(day).padStart(2, '0');
  return `${year}-${mm}-${dd}`;
}

export function addDays(dateStr: string, days: number): string {
  const { year, month, day } = parseDateString(dateStr);
  const d = new Date(Date.UTC(year, month - 1, day + days));
  return formatDateString(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function addMonths(dateStr: string, months: number): string {
  const { year, month, day } = parseDateString(dateStr);
  const d = new Date(Date.UTC(year, month - 1 + months, day));
  return formatDateString(d.getUTCFullYear(), d.getUTCMonth() + 1, d.getUTCDate());
}

export function getDayOfWeek(dateStr: string): number {
  const { year, month, day } = parseDateString(dateStr);
  const d = new Date(Date.UTC(year, month - 1, day));
  const dayIndex = d.getUTCDay(); // 0 is Sunday, 1 is Monday ... 6 is Saturday
  return dayIndex === 0 ? 7 : dayIndex; // 1 = Mon, 7 = Sun
}

export function generateRecurrenceDates(
  startDateStr: string,
  config: RecurrenceInput,
  maxInstances: number = 60
): string[] {
  const dates: string[] = [];
  const interval = Math.max(1, config.interval ?? 1);
  const until = config.untilDate;

  let current = startDateStr;
  let count = 0;

  while (count < maxInstances) {
    if (until && current > until) {
      break;
    }

    if (config.frequency === 'DAILY') {
      dates.push(current);
      current = addDays(current, interval);
    } else if (config.frequency === 'WEEKDAYS') {
      const dow = getDayOfWeek(current);
      if (dow >= 1 && dow <= 5) {
        dates.push(current);
      }
      current = addDays(current, 1);
    } else if (config.frequency === 'WEEKLY') {
      if (config.byWeekdays && config.byWeekdays.length > 0) {
        const dow = getDayOfWeek(current);
        if (config.byWeekdays.includes(dow)) {
          dates.push(current);
        }
        current = addDays(current, 1);
      } else {
        dates.push(current);
        current = addDays(current, 7 * interval);
      }
    } else if (config.frequency === 'MONTHLY') {
      dates.push(current);
      current = addMonths(current, interval);
    } else {
      dates.push(current);
      break;
    }

    count++;
  }

  return Array.from(new Set(dates)).sort();
}
