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
      bg: "bg-blue-50/70 hover:bg-blue-100/70 dark:bg-blue-950/25 dark:hover:bg-blue-950/40 custom:bg-blue-950/35 custom:hover:bg-blue-900/45",
      border: "border-blue-300/70 dark:border-blue-900/50 custom:border-blue-400/30",
      dot: "bg-blue-600 dark:bg-blue-500 custom:bg-blue-400",
      counter: "text-blue-800 dark:text-blue-300 custom:text-blue-300 font-semibold",
    },
    partially_completed: {
      bg: "bg-amber-50/70 hover:bg-amber-100/70 dark:bg-amber-950/25 dark:hover:bg-amber-950/40 custom:bg-amber-950/35 custom:hover:bg-amber-900/45",
      border: "border-amber-300/70 dark:border-amber-900/50 custom:border-amber-400/30",
      dot: "bg-amber-500 dark:bg-amber-400 custom:bg-amber-400",
      counter: "text-amber-900 dark:text-amber-300 custom:text-amber-300 font-semibold",
    },
    future_incomplete: {
      bg: "bg-pink-50/70 hover:bg-pink-100/70 dark:bg-pink-950/25 dark:hover:bg-pink-950/40 custom:bg-pink-950/35 custom:hover:bg-pink-900/45",
      border: "border-pink-300/70 dark:border-pink-900/50 custom:border-pink-400/30",
      dot: "bg-pink-500 dark:bg-pink-400 custom:bg-pink-400",
      counter: "text-pink-800 dark:text-pink-300 custom:text-pink-300 font-semibold",
    },
    none_completed: {
      bg: "bg-red-50/70 hover:bg-red-100/70 dark:bg-red-950/25 dark:hover:bg-red-950/40 custom:bg-red-950/35 custom:hover:bg-red-900/45",
      border: "border-red-300/70 dark:border-red-900/50 custom:border-red-400/30",
      dot: "bg-red-600 dark:bg-red-500 custom:bg-red-400",
      counter: "text-red-800 dark:text-red-400 custom:text-red-300 font-semibold",
    },
    no_tasks: {
      bg: "bg-neutral-100/50 hover:bg-neutral-200/50 dark:bg-transparent dark:hover:bg-neutral-800/40 custom:bg-white/[0.02] custom:hover:bg-white/[0.06]",
      border: "border-neutral-200/90 dark:border-neutral-800/60 custom:border-transparent",
      dot: "bg-neutral-300 dark:bg-neutral-700 custom:bg-white/20",
      counter: "text-neutral-400 dark:text-neutral-500 custom:text-neutral-400",
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
          "relative min-h-[74px] sm:min-h-[92px] p-1.5 sm:p-2 flex flex-col justify-between text-left border transition-all rounded-md backdrop-blur-[2px]",
          "focus:outline-none focus:z-10",
          isCurrentMonth ? "text-neutral-900 dark:text-neutral-100 custom:text-white" : "text-neutral-400 dark:text-neutral-600 custom:text-neutral-500 opacity-60 bg-neutral-200/30 dark:bg-neutral-950/40 custom:bg-black/30",
          currentTheme.border,
          currentTheme.bg,
          isToday && "ring-1 ring-neutral-900 dark:ring-neutral-400 custom:ring-indigo-400/60",
          isSelected && "ring-2 ring-blue-600 dark:ring-blue-500 custom:ring-blue-400 shadow-sm z-10"
        )
      )}
    >
      <div className="flex items-center justify-between w-full">
        <span
          className={twMerge(
            clsx(
              "text-[11px] sm:text-xs font-mono font-medium tabular-nums",
              isToday ? "px-1 sm:px-1.5 py-0.5 bg-neutral-900 dark:bg-white custom:bg-white text-white dark:text-neutral-950 custom:text-neutral-950 rounded-[3px] font-semibold" : ""
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
