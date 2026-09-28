"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Task } from "@/lib/types";
import { toCalendarDateString, formatToDDMMYYYY, formatDateDisplay } from "@/lib/dateUtils";
import { addDays } from "@/lib/recurrence";
import { CalendarClock, ArrowRight, ArrowLeft, Clock, AlertCircle } from "lucide-react";
import { clsx } from "clsx";

export interface RescheduleModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onReschedule: (
    task: Task,
    newDate: string,
    actionType: "POSTPONE" | "PREPONE",
    dueTime?: string | null
  ) => Promise<void>;
  isLoading?: boolean;
}

export function RescheduleModal({
  task,
  isOpen,
  onClose,
  onReschedule,
  isLoading = false,
}: RescheduleModalProps) {
  const [mounted, setMounted] = useState(false);
  const [actionType, setActionType] = useState<"POSTPONE" | "PREPONE">("POSTPONE");
  const [newDate, setNewDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (task && isOpen) {
      const today = toCalendarDateString(new Date());
      const isFutureTask = task.date > today;

      // Default to Prepone if task is in the future, otherwise Postpone
      const initialAction = isFutureTask ? "POSTPONE" : "POSTPONE";
      setActionType(initialAction);

      // Default postpone date to tomorrow or day after current task date
      setNewDate(addDays(task.date, 1));
      setDueTime(task.dueTime || "");
      setError(null);
    }
  }, [task, isOpen]);

  if (!isOpen || !task || !mounted) return null;

  const today = toCalendarDateString(new Date());
  const isFutureTask = task.date > today;

  // Postpone constraints: new_date > current_task_date
  const postponeMinDate = addDays(task.date, 1);

  // Prepone constraints: today <= new_date < current_task_date
  const preponeMinDate = today;
  const preponeMaxDate = addDays(task.date, -1);

  const handleActionChange = (type: "POSTPONE" | "PREPONE") => {
    setActionType(type);
    setError(null);
    if (type === "POSTPONE") {
      setNewDate(addDays(task.date, 1));
    } else {
      setNewDate(today);
    }
  };

  // Due time check if moved to today
  const now = new Date();
  const currentHHMM = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const isMovedToToday = newDate === today;
  const isTimePassedToday = isMovedToToday && dueTime && dueTime < currentHHMM;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!newDate) {
      setError("Please select a target date.");
      return;
    }

    if (actionType === "POSTPONE") {
      if (newDate <= task.date) {
        setError("A postponed task must be moved to a future date.");
        return;
      }
    } else {
      // PREPONE
      if (newDate < today) {
        setError("A task cannot be preponed to a date that has already passed.");
        return;
      }
      if (newDate >= task.date) {
        setError("A task cannot be preponed to its current date or a future date.");
        return;
      }
    }

    try {
      await onReschedule(task, newDate, actionType, dueTime || null);
      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to reschedule task.");
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-[3px] animate-in fade-in duration-100"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="reschedule-dialog-title"
        className="w-full max-w-md bg-[#FAFBFD] dark:bg-[#141416] custom:bg-[#0E0E14]/94 custom:backdrop-blur-2xl border border-neutral-300/90 dark:border-neutral-800 custom:border-transparent rounded-xl shadow-2xl overflow-hidden p-5 sm:p-6 animate-in zoom-in-95 duration-100 text-neutral-900 dark:text-neutral-100 custom:text-white"
      >
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="p-2 bg-indigo-100/80 dark:bg-indigo-950/40 custom:bg-indigo-900/40 text-indigo-700 dark:text-indigo-400 custom:text-indigo-300 rounded-md border border-indigo-200 dark:border-indigo-900/50 custom:border-indigo-500/30 mt-0.5 flex-shrink-0">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="reschedule-dialog-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 custom:text-white">
              Reschedule Task
            </h3>
            <p className="text-xs text-neutral-600 dark:text-neutral-400 custom:text-neutral-300 mt-0.5 truncate">
              {task.title} (Currently: {formatToDDMMYYYY(task.date)})
            </p>
          </div>
        </div>

        {/* Action Type Selector: Postpone vs Prepone */}
        <div className="mt-4 grid grid-cols-2 gap-1.5 p-1 bg-[#E4E6EB] dark:bg-neutral-800/80 custom:bg-black/60 border border-neutral-300 dark:border-neutral-700 custom:border-transparent rounded-lg">
          <button
            type="button"
            onClick={() => handleActionChange("POSTPONE")}
            className={clsx(
              "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all",
              actionType === "POSTPONE"
                ? "bg-[#FAFBFD] dark:bg-[#1e1e24] custom:bg-white/20 text-neutral-950 dark:text-white custom:text-white shadow-sm font-semibold"
                : "text-neutral-700 dark:text-neutral-400 custom:text-neutral-300 hover:text-neutral-950 dark:hover:text-white"
            )}
          >
            <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
            <span>Postpone (Later)</span>
          </button>

          <button
            type="button"
            onClick={() => isFutureTask && handleActionChange("PREPONE")}
            disabled={!isFutureTask}
            title={!isFutureTask ? "Only future tasks can be preponed" : undefined}
            className={clsx(
              "flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-md text-xs font-medium transition-all",
              actionType === "PREPONE"
                ? "bg-[#FAFBFD] dark:bg-[#1e1e24] custom:bg-white/20 text-neutral-950 dark:text-white custom:text-white shadow-sm font-semibold"
                : isFutureTask
                ? "text-neutral-700 dark:text-neutral-400 custom:text-neutral-300 hover:text-neutral-950 dark:hover:text-white"
                : "opacity-40 cursor-not-allowed text-neutral-400"
            )}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-emerald-500" />
            <span>Prepone (Earlier)</span>
          </button>
        </div>

        {/* Error message */}
        {error && (
          <div className="mt-3 p-2.5 bg-rose-50 dark:bg-rose-950/50 custom:bg-rose-950/40 border border-rose-200 dark:border-rose-800 custom:border-rose-500/40 rounded text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {/* Destination Date Field */}
          <div>
            <label className="block text-xs font-medium text-neutral-800 dark:text-neutral-300 custom:text-neutral-200 mb-1">
              {actionType === "POSTPONE" ? "Postpone to Date" : "Prepone to Date"}{" "}
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              min={actionType === "POSTPONE" ? postponeMinDate : preponeMinDate}
              max={actionType === "PREPONE" ? preponeMaxDate : undefined}
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full h-8 px-2.5 border border-neutral-300 dark:border-neutral-700 custom:border-transparent rounded-md text-xs bg-[#FAFBFD] dark:bg-neutral-800 custom:bg-[#0A0A0E]/90 text-neutral-900 dark:text-neutral-100 custom:text-white font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400"
            />
            <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
              {actionType === "POSTPONE"
                ? `Earliest allowed: ${formatToDDMMYYYY(postponeMinDate)} (must be strictly after current date)`
                : `Allowed range: ${formatToDDMMYYYY(preponeMinDate)} (today) to ${formatToDDMMYYYY(preponeMaxDate)}`}
            </p>
          </div>

          {/* Due Time Field (Preserves existing by default, allows adjustment) */}
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Due Time <span className="text-neutral-400 dark:text-neutral-500">(Optional)</span>
            </label>
            <div className="relative">
              <input
                type="time"
                value={dueTime}
                onChange={(e) => setDueTime(e.target.value)}
                className="w-full h-8 pl-8 pr-2.5 border border-neutral-300 dark:border-neutral-700 rounded-md text-xs bg-[#F4F4F5] dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400"
              />
              <Clock className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-neutral-400" />
            </div>
            {dueTime && (
              <button
                type="button"
                onClick={() => setDueTime("")}
                className="text-[10px] text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 mt-0.5 underline"
              >
                Clear due time
              </button>
            )}
          </div>

          {/* Warning if moved to today with due time passed */}
          {isTimePassedToday && (
            <div className="flex items-start gap-1.5 p-2 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded text-[11px] text-amber-800 dark:text-amber-300">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                Note: <strong>{dueTime}</strong> has already passed today. The task will be highlighted as overdue.
              </span>
            </div>
          )}

          {/* Recurrence scope notice if recurring */}
          {task.recurrenceId && (
            <div className="p-2 bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/40 rounded text-[11px] text-blue-700 dark:text-blue-300">
              Rescheduling this occurrence preserves all other recurring occurrences in the series.
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-5 flex items-center justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-3.5">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel <span className="text-[10px] text-neutral-400 ml-1 hidden xs:inline">(Esc)</span>
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={isLoading}
              className={actionType === "POSTPONE" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}
            >
              {isLoading ? "Rescheduling..." : actionType === "POSTPONE" ? "Confirm Postpone" : "Confirm Prepone"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
