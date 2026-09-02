import React, { useEffect, useState, useMemo } from "react";
import { CalendarHeader } from "./CalendarHeader";
import { CalendarCell } from "./CalendarCell";
import { getMonthGrid, toCalendarDateString, getTodayDateString } from "@/lib/dateUtils";
import { api } from "@/lib/api";
import { MonthStatusResponse } from "@/lib/types";

export interface MonthlyCalendarProps {
  selectedDate: string;
  onSelectDate: (dateStr: string) => void;
  refreshTrigger?: number;
}

export function MonthlyCalendar({
  selectedDate,
  onSelectDate,
  refreshTrigger = 0,
}: MonthlyCalendarProps) {
  const [currentYear, setCurrentYear] = useState<number>(() => {
    return parseInt(selectedDate.split("-")[0], 10) || new Date().getFullYear();
  });
  const [currentMonth, setCurrentMonth] = useState<number>(() => {
    return parseInt(selectedDate.split("-")[1], 10) || new Date().getMonth() + 1;
  });

  const [monthData, setMonthData] = useState<MonthStatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);

    api
      .getMonthStatus(currentYear, currentMonth)
      .then((res) => {
        if (isMounted) setMonthData(res);
      })
      .catch((err) => {
        console.error("Failed to load month status", err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [currentYear, currentMonth, refreshTrigger]);

  const gridCells = useMemo(
    () => getMonthGrid(currentYear, currentMonth),
    [currentYear, currentMonth]
  );

  const dayStatusMap = useMemo(() => {
    const map = new Map<string, any>();
    if (monthData?.days) {
      for (const d of monthData.days) {
        map.set(d.date, d);
      }
    }
    return map;
  }, [monthData]);

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentYear((y) => y - 1);
      setCurrentMonth(12);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentYear((y) => y + 1);
      setCurrentMonth(1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handleToday = () => {
    const todayStr = getTodayDateString();
    const [y, m] = todayStr.split("-").map(Number);
    setCurrentYear(y);
    setCurrentMonth(m);
    onSelectDate(todayStr);
  };

  const weekdays = [
    { short: "M", full: "Mon" },
    { short: "T", full: "Tue" },
    { short: "W", full: "Wed" },
    { short: "T", full: "Thu" },
    { short: "F", full: "Fri" },
    { short: "S", full: "Sat" },
    { short: "S", full: "Sun" },
  ];

  return (
    <div className="bg-[#FAFAF9] dark:bg-[#121214] border border-neutral-200/90 dark:border-neutral-800 rounded-lg p-3 sm:p-5 shadow-sm transition-colors">
      <CalendarHeader
        year={currentYear}
        month={currentMonth}
        onPrevMonth={handlePrevMonth}
        onNextMonth={handleNextMonth}
        onToday={handleToday}
      />

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mt-3 sm:mt-4 mb-1">
        {weekdays.map((day, idx) => (
          <div
            key={idx}
            className="py-1 text-center text-[10px] sm:text-[11px] font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider"
          >
            <span className="sm:hidden">{day.short}</span>
            <span className="hidden sm:inline">{day.full}</span>
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className={`grid grid-cols-7 gap-1 transition-opacity ${isLoading ? "opacity-60" : ""}`}>
        {gridCells.map((cell) => (
          <CalendarCell
            key={cell.dateStr}
            dateStr={cell.dateStr}
            dayNumber={cell.dayNumber}
            isCurrentMonth={cell.isCurrentMonth}
            isToday={cell.isToday}
            isSelected={cell.dateStr === selectedDate}
            daySummary={dayStatusMap.get(cell.dateStr)}
            onSelectDate={onSelectDate}
          />
        ))}
      </div>
    </div>
  );
}
