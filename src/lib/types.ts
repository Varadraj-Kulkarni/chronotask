export type PriorityLevel = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type DayState = "all_completed" | "partially_completed" | "none_completed" | "future_incomplete" | "no_tasks";

export type ColorCode = "blue" | "yellow" | "red" | "pink" | "neutral";

export type RecurrenceFrequency = "DAILY" | "WEEKDAYS" | "WEEKLY" | "MONTHLY";

export interface RecurrenceConfig {
  frequency: RecurrenceFrequency;
  interval: number;
  byWeekdays?: number[] | null;
  untilDate?: string | null;
}

export interface Task {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  date: string; // YYYY-MM-DD
  dueTime: string | null; // HH:mm
  completed: boolean;
  completedAt: string | null;
  priority: PriorityLevel;
  categoryId: string | null;
  recurrenceId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  date: string;
  dueTime?: string | null;
  priority?: PriorityLevel;
  categoryId?: string | null;
  recurrenceConfig?: RecurrenceConfig | null;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  date?: string;
  dueTime?: string | null;
  priority?: PriorityLevel;
  categoryId?: string | null;
}

export type EditScope = "single" | "future" | "all";

export interface DayStatusSummary {
  date: string;
  totalTasks: number;
  completedTasks: number;
  status: DayState;
  colorCode: ColorCode;
}

export interface MonthStatusResponse {
  year: number;
  month: number;
  days: DayStatusSummary[];
}

export type AnalyticsPeriod = "daily" | "weekly" | "monthly" | "yearly";

export interface PriorityBreakdownItem {
  total: number;
  completed: number;
}

export interface TrendDataItem {
  label: string;
  date: string;
  total: number;
  completed: number;
}

export interface AnalyticsSummaryResponse {
  period: AnalyticsPeriod;
  anchorDate: string;
  startDate: string;
  endDate: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  mostProductiveDay: string | null;
  missedTasks: number;
  priorityBreakdown: Record<PriorityLevel, PriorityBreakdownItem>;
  trendData: TrendDataItem[];
  insights: string[];
}

export interface Category {
  id: string;
  userId: string;
  name: string;
  color?: string | null;
}

export interface StandardError {
  code: string;
  message: string;
  details?: unknown;
  timestamp: string;
  path: string;
}
