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
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md text-slate-800 dark:text-slate-200">
          <CalendarIcon className="w-4 h-4" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
            <span>{monthNames[month - 1]}</span>
            <span className="font-mono text-slate-500 dark:text-slate-400 font-normal">{year}</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monthly schedule and completion velocity rollup
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Editorial Legend */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 px-2.5 py-1 rounded-md">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" /> All Done
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" /> Partial
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> Incomplete
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-600" /> No Tasks
          </span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <Button variant="outline" size="sm" onClick={onToday}>
            Today
          </Button>
          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-md bg-white dark:bg-slate-900">
            <button
              onClick={onPrevMonth}
              aria-label="Previous month"
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors rounded-l-md"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-700" />
            <button
              onClick={onNextMonth}
              aria-label="Next month"
              className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors rounded-r-md"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
