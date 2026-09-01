"use client";

import React, { useState } from "react";
import { MonthlyCalendar } from "@/components/calendar/MonthlyCalendar";
import { DailyTaskPanel } from "@/components/tasks/DailyTaskPanel";
import { toCalendarDateString } from "@/lib/dateUtils";

export default function CalendarPage() {
  // Default anchor date: current local date, or contract default if desired
  const [selectedDate, setSelectedDate] = useState<string>(() =>
    toCalendarDateString(new Date())
  );

  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);

  const handleTasksChanged = () => {
    // Notify monthly calendar to re-fetch aggregation
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Context */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Calendar Master
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            4-tier day completion tracking & strict calendar-first workflow
          </p>
        </div>
      </div>

      {/* Main Grid & Docked Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Monthly Calendar: 7 or 8 columns on wide screens */}
        <div className="lg:col-span-8">
          <MonthlyCalendar
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* Daily Task Panel: 4 or 5 columns on wide screens */}
        <div className="lg:col-span-4 sticky top-20">
          <DailyTaskPanel
            dateStr={selectedDate}
            onTasksChanged={handleTasksChanged}
          />
        </div>
      </div>
    </div>
  );
}
