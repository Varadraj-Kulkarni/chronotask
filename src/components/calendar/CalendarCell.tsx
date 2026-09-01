import React from "react";
import { DayStatusSummary } from "@/lib/types";
import { computeDayStatus } from "@/lib/dateUtils";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface CalendarCellProps {
  dateStr: string;
  dayNumber: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  isSelected: boolean;
  daySummary?: DayStatusSummary;
  onSelectDate: (dateStr: string) => void;
}

export function CalendarCell({
  dateStr,
  dayNumber,
  isCurrentMonth,
  isToday,
  isSelected,
  daySummary,
  onSelectDate,
}: CalendarCellProps) {
  const total = daySummary?.totalTasks ?? 0;
  const completed = daySummary?.completedTasks ?? 0;
  const { status, label } = computeDayStatus(total, completed);

  // Contract Tailwind tokens:
  // All Completed: Dot: bg-blue-600, Border: border-blue-200, Bg: bg-blue-50/40
  // Partially Completed: Dot: bg-amber-500, Border: border-amber-200, Bg: bg-amber-50/40
  // None Completed: Dot: bg-rose-500, Border: border-rose-200, Bg: bg-rose-50/30
  // No Tasks: Dot: bg-slate-300, Border: border-transparent, Bg: bg-transparent
  const statusStyles = {
    all_completed: {
      bg: "bg-blue-50/40 hover:bg-blue-50/70 dark:bg-blue-950/25 dark:hover:bg-blue-950/40",
      border: "border-blue-200 dark:border-blue-900/60",
      dot: "bg-blue-600 dark:bg-blue-500",
      counter: "text-blue-700 dark:text-blue-300 font-medium",
    },
    partially_completed: {
      bg: "bg-amber-50/40 hover:bg-amber-50/70 dark:bg-amber-950/25 dark:hover:bg-amber-950/40",
      border: "border-amber-200 dark:border-amber-900/60",
      dot: "bg-amber-500 dark:bg-amber-400",
      counter: "text-amber-800 dark:text-amber-300 font-medium",
    },
    none_completed: {
      bg: "bg-rose-50/30 hover:bg-rose-50/60 dark:bg-rose-950/20 dark:hover:bg-rose-950/35",
      border: "border-rose-200 dark:border-rose-900/60",
      dot: "bg-rose-500 dark:bg-rose-400",
      counter: "text-rose-700 dark:text-rose-300 font-medium",
    },
    no_tasks: {
      bg: "bg-transparent hover:bg-slate-50/80 dark:hover:bg-slate-800/40",
      border: "border-slate-100 dark:border-slate-800/70",
      dot: "bg-slate-300 dark:bg-slate-600",
      counter: "text-slate-400 dark:text-slate-500",
    },
  };

  const currentTheme = statusStyles[status];

  return (
    <button
      type="button"
      onClick={() => onSelectDate(dateStr)}
      aria-label={`${dateStr}: ${label}`}
      className={twMerge(
        clsx(
          "relative min-h-[96px] p-2 flex flex-col justify-between text-left border transition-all rounded-sm",
          "focus:outline-none focus:z-10",
          isCurrentMonth ? "text-slate-900 dark:text-slate-100" : "text-slate-400 dark:text-slate-600 opacity-60 bg-slate-50/30 dark:bg-slate-950/40",
          currentTheme.border,
          currentTheme.bg,
          isToday && "ring-1 ring-slate-900 dark:ring-slate-400",
          isSelected && "ring-2 ring-blue-600 dark:ring-blue-500 shadow-sm z-10"
        )
      )}
    >
      <div className="flex items-center justify-between w-full">
        <span
          className={twMerge(
            clsx(
              "text-xs font-mono font-medium tabular-nums",
              isToday ? "px-1.5 py-0.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-[3px]" : ""
            )
          )}
        >
          {dayNumber}
        </span>

        {/* Status Indicator Dot */}
        <span
          className={twMerge(
            clsx("w-2 h-2 rounded-full", currentTheme.dot)
          )}
          title={label}
        />
      </div>

      <div className="mt-auto pt-2 flex items-center justify-between">
        {total > 0 ? (
          <span className={clsx("text-[11px] font-mono tabular-nums", currentTheme.counter)}>
            {completed}/{total}
          </span>
        ) : (
          <span className="text-[10px] text-slate-300 dark:text-slate-600 font-mono">—</span>
        )}

        {isToday && (
          <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
            Today
          </span>
        )}
      </div>
    </button>
  );
}
