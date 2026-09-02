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
  const { status, label } = computeDayStatus(total, completed, dateStr);

  const statusStyles = {
    all_completed: {
      bg: "bg-blue-50/40 hover:bg-blue-50/70 dark:bg-blue-950/20 dark:hover:bg-blue-950/35",
      border: "border-blue-200 dark:border-blue-900/50",
      dot: "bg-blue-600 dark:bg-blue-500",
      counter: "text-blue-700 dark:text-blue-300 font-medium",
    },
    partially_completed: {
      bg: "bg-amber-50/40 hover:bg-amber-50/70 dark:bg-amber-950/20 dark:hover:bg-amber-950/35",
      border: "border-amber-200 dark:border-amber-900/50",
      dot: "bg-amber-500 dark:bg-amber-400",
      counter: "text-amber-800 dark:text-amber-300 font-medium",
    },
    future_incomplete: {
      bg: "bg-pink-50/40 hover:bg-pink-50/70 dark:bg-pink-950/20 dark:hover:bg-pink-950/35",
      border: "border-pink-200 dark:border-pink-900/50",
      dot: "bg-pink-500 dark:bg-pink-400",
      counter: "text-pink-700 dark:text-pink-300 font-medium",
    },
    none_completed: {
      bg: "bg-red-50/40 hover:bg-red-50/70 dark:bg-red-950/20 dark:hover:bg-red-950/35",
      border: "border-red-200 dark:border-red-900/50",
      dot: "bg-red-600 dark:bg-red-500",
      counter: "text-red-700 dark:text-red-400 font-medium",
    },
    no_tasks: {
      bg: "bg-transparent hover:bg-neutral-50/80 dark:hover:bg-neutral-800/40",
      border: "border-neutral-100 dark:border-neutral-800/60",
      dot: "bg-neutral-300 dark:bg-neutral-700",
      counter: "text-neutral-400 dark:text-neutral-500",
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
          "relative min-h-[74px] sm:min-h-[92px] p-1.5 sm:p-2 flex flex-col justify-between text-left border transition-all rounded-sm",
          "focus:outline-none focus:z-10",
          isCurrentMonth ? "text-neutral-900 dark:text-neutral-100" : "text-neutral-400 dark:text-neutral-600 opacity-60 bg-neutral-50/30 dark:bg-neutral-950/40",
          currentTheme.border,
          currentTheme.bg,
          isToday && "ring-1 ring-neutral-900 dark:ring-neutral-400",
          isSelected && "ring-2 ring-blue-600 dark:ring-blue-500 shadow-sm z-10"
        )
      )}
    >
      <div className="flex items-center justify-between w-full">
        <span
          className={twMerge(
            clsx(
              "text-[11px] sm:text-xs font-mono font-medium tabular-nums",
              isToday ? "px-1 sm:px-1.5 py-0.5 bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 rounded-[3px]" : ""
            )
          )}
        >
          {dayNumber}
        </span>

        {/* Status Indicator Dot */}
        <span
          className={twMerge(
            clsx("w-2 h-2 rounded-full flex-shrink-0", currentTheme.dot)
          )}
          title={label}
        />
      </div>

      <div className="mt-auto pt-1 sm:pt-2 flex items-center justify-between w-full">
        {total > 0 ? (
          <span className={clsx("text-[10px] sm:text-[11px] font-mono tabular-nums", currentTheme.counter)}>
            {completed}/{total}
          </span>
        ) : (
          <span className="text-[10px] text-neutral-300 dark:text-neutral-700 font-mono">—</span>
        )}

        {isToday && (
          <span className="text-[8px] sm:text-[9px] uppercase tracking-wider font-semibold text-neutral-500 dark:text-neutral-400 hidden xs:inline">
            Today
          </span>
        )}
      </div>
    </button>
  );
}
