import { DayState, ColorCode } from "./types";

/**
 * Returns today's calendar date string (YYYY-MM-DD) in Asia/Kolkata (India) timezone.
 */
export function getTodayDateString(): string {
  try {
    const formatter = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    return formatter.format(new Date());
  } catch {
    return toCalendarDateString(new Date());
  }
}

/**
 * Strict calendar date string generator (YYYY-MM-DD) from local date components.
 * Guarantees zero timezone shifting compared to date.toISOString().
 */
export function toCalendarDateString(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Converts a YYYY-MM-DD string into strict DD-MM-YYYY format.
 * E.g., "2026-09-02" -> "02-09-2026"
 */
export function formatToDDMMYYYY(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3 && parts[0].length === 4) {
    return `${parts[2].padStart(2, "0")}-${parts[1].padStart(2, "0")}-${parts[0]}`;
  }
  return dateStr;
}

/**
 * Converts a DD-MM-YYYY string back to YYYY-MM-DD.
 */
export function parseDDMMYYYYToISO(dateStr: string): string {
  if (!dateStr) return "";
  const parts = dateStr.split("-");
  if (parts.length === 3 && parts[0].length <= 2 && parts[2].length === 4) {
    return `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
  }
  return dateStr;
}

/**
 * Parses a YYYY-MM-DD string into a local Date object.
 */
export function parseCalendarDateString(dateStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Returns formatted date for headers and dialogs using strict dd-mm-yyyy representation.
 * E.g., short: "02-09-2026", default: "Wednesday, 02-09-2026"
 */
export function formatDateDisplay(dateStr: string, options?: { short?: boolean }): string {
  if (!dateStr) return "";
  const d = parseCalendarDateString(dateStr);
  const ddmm = formatToDDMMYYYY(dateStr);
  if (options?.short) {
    return ddmm;
  }
  const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
  return `${weekday}, ${ddmm}`;
}

/**
 * Computes calendar day status color logic:
 * - All Completed: totalTasks > 0 and completedTasks == totalTasks -> blue
 * - Partially Completed: totalTasks > 0 and completedTasks > 0 and completedTasks < totalTasks -> yellow
 * - None Completed (Future Date): date > today -> pink (rose pink)
 * - None Completed (Today or Past Date): date <= today -> red
 * - No Tasks: totalTasks == 0 -> neutral
 */
export function computeDayStatus(
  totalTasks: number,
  completedTasks: number,
  dateStr?: string,
  todayStr?: string
): { status: DayState; colorCode: ColorCode; label: string } {
  if (totalTasks === 0) {
    return {
      status: "no_tasks",
      colorCode: "neutral",
      label: "No tasks scheduled",
    };
  }

  if (completedTasks === totalTasks) {
    return {
      status: "all_completed",
      colorCode: "blue",
      label: "All tasks completed",
    };
  }

  if (completedTasks > 0 && completedTasks < totalTasks) {
    return {
      status: "partially_completed",
      colorCode: "yellow",
      label: `Partially completed (${completedTasks} of ${totalTasks})`,
    };
  }

  // When all tasks are incomplete (completedTasks === 0):
  const today = todayStr || getTodayDateString();
  if (dateStr && dateStr > today) {
    return {
      status: "future_incomplete",
      colorCode: "pink",
      label: `Upcoming tasks scheduled (0 of ${totalTasks})`,
    };
  }

  return {
    status: "none_completed",
    colorCode: "red",
    label: `Incomplete tasks (0 of ${totalTasks})`,
  };
}

export interface CalendarGridCell {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
}

/**
 * Generates a standard 7-column calendar grid starting on Monday.
 */
export function getMonthGrid(year: number, month: number): CalendarGridCell[] {
  const firstDay = new Date(year, month - 1, 1);
  const lastDay = new Date(year, month, 0);
  const totalDays = lastDay.getDate();

  const todayStr = getTodayDateString();

  // Monday = 0, Sunday = 6 in European/ISO standard week
  // JS getDay(): 0 is Sunday, 1 is Monday...
  let firstDayOfWeek = (firstDay.getDay() + 6) % 7;

  const cells: CalendarGridCell[] = [];

  // Previous month trailing days
  const prevMonthLastDay = new Date(year, month - 1, 0).getDate();
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonthLastDay - i;
    const prevMonth = month - 1 === 0 ? 12 : month - 1;
    const prevYear = month - 1 === 0 ? year - 1 : year;
    const dateStr = `${prevYear}-${String(prevMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  // Current month days
  for (let day = 1; day <= totalDays; day++) {
    const dateStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: true,
      isToday: dateStr === todayStr,
    });
  }

  // Next month leading days to complete grid (multiples of 7)
  const remaining = (7 - (cells.length % 7)) % 7;
  for (let day = 1; day <= remaining; day++) {
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const dateStr = `${nextYear}-${String(nextMonth).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    cells.push({
      dateStr,
      dayNumber: day,
      isCurrentMonth: false,
      isToday: dateStr === todayStr,
    });
  }

  return cells;
}

/**
 * Returns Monday to Sunday dates for a given anchor date string.
 */
export function getWeekRange(dateStr: string): { start: string; end: string; days: string[] } {
  const d = parseCalendarDateString(dateStr);
  const dayOfWeek = (d.getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const monday = new Date(d);
  monday.setDate(d.getDate() - dayOfWeek);

  const days: string[] = [];
  for (let i = 0; i < 7; i++) {
    const current = new Date(monday);
    current.setDate(monday.getDate() + i);
    days.push(toCalendarDateString(current));
  }

  return {
    start: days[0],
    end: days[6],
    days,
  };
}

/**
 * Returns start and end dates for a given anchor date's calendar month.
 */
export function getMonthRange(dateStr: string): { start: string; end: string } {
  const [yearStr, monthStr] = dateStr.split("-");
  const year = Number(yearStr);
  const month = Number(monthStr);
  const lastDay = new Date(year, month, 0).getDate();
  return {
    start: `${year}-${String(month).padStart(2, "0")}-01`,
    end: `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`,
  };
}
