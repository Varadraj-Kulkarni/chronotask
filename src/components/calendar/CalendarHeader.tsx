import React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/Button";

export interface CalendarHeaderProps {
  year: number;
  month: number;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}

export function CalendarHeader({
  year,
  month,
  onPrevMonth,
  onNextMonth,
  onToday,
}: CalendarHeaderProps) {
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-neutral-300/80 dark:border-neutral-800 custom:border-transparent">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#E4E6EB] dark:bg-neutral-800 custom:bg-white/10 border border-neutral-300 dark:border-neutral-700 custom:border-transparent rounded-md text-neutral-800 dark:text-neutral-200 custom:text-white flex-shrink-0">
          <CalendarIcon className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-neutral-900 dark:text-neutral-100 custom:text-white tracking-tight flex items-center gap-2">
            <span>{monthNames[month - 1]}</span>
            <span className="font-mono text-neutral-500 dark:text-neutral-400 custom:text-neutral-400 font-normal">{year}</span>
          </h2>
          <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 custom:text-neutral-300">
            Monthly schedule and completion velocity rollup
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-4">
        {/* Editorial Legend - responsive on all screens */}
        <div className="flex items-center flex-wrap gap-2 sm:gap-3 text-[10px] sm:text-[11px] text-neutral-700 dark:text-neutral-300 custom:text-neutral-200 border border-neutral-300/80 dark:border-neutral-800 custom:border-transparent bg-[#E4E6EB]/70 dark:bg-neutral-900/50 custom:bg-black/40 px-2 sm:px-2.5 py-1 rounded-md">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" /> Done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Partial
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-600" /> Today/Overdue
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-pink-500" /> Upcoming
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-neutral-400 dark:bg-neutral-700" /> Empty
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={onToday}>
            Today
          </Button>
          <div className="flex items-center border border-neutral-300/80 dark:border-neutral-800 custom:border-transparent rounded-md bg-[#FAFBFD] dark:bg-neutral-900 custom:bg-neutral-950/60 shadow-sm">
            <button
              onClick={onPrevMonth}
              aria-label="Previous month"
              className="p-1.5 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 custom:hover:bg-white/10 text-neutral-800 dark:text-neutral-300 custom:text-white transition-colors rounded-l-md min-w-[32px] min-h-[32px] flex items-center justify-center"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-neutral-300 dark:bg-neutral-800 custom:bg-white/15" />
            <button
              onClick={onNextMonth}
              aria-label="Next month"
              className="p-1.5 hover:bg-neutral-200/60 dark:hover:bg-neutral-800 custom:hover:bg-white/10 text-neutral-800 dark:text-neutral-300 custom:text-white transition-colors rounded-r-md min-w-[32px] min-h-[32px] flex items-center justify-center"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
