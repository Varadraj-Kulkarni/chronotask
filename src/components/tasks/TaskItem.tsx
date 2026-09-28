import React from "react";
import { Task, Category } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { formatToDDMMYYYY, getTodayDateString } from "@/lib/dateUtils";
import { Clock, Repeat, Trash2, Edit2, Check, Calendar, CalendarClock } from "lucide-react";
import { clsx } from "clsx";

export interface TaskItemProps {
  task: Task;
  category?: Category;
  showDate?: boolean;
  onInitiateComplete: (task: Task) => void;
  onUncomplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
  onReschedule?: (task: Task) => void;
}

export function TaskItem({
  task,
  category,
  showDate = false,
  onInitiateComplete,
  onUncomplete,
  onEdit,
  onDelete,
  onReschedule,
}: TaskItemProps) {
  const todayStr = getTodayDateString();
  const isOverdue = !task.completed && task.date < todayStr;
  const isDueToday = !task.completed && task.date === todayStr;
  const isUpcoming = !task.completed && task.date > todayStr;

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Strict two-step interaction rule:
    // If not completed, initiate confirmation modal!
    if (!task.completed) {
      onInitiateComplete(task);
    } else {
      // Reverting a completed task can be done directly via uncomplete endpoint
      onUncomplete(task);
    }
  };

  return (
    <div
      className={clsx(
        "group relative flex items-start gap-3 p-3 border rounded-xl transition-all",
        task.completed
          ? "border-neutral-200 dark:border-neutral-800 custom:border-transparent bg-neutral-100/50 dark:bg-neutral-950/40 custom:bg-white/[0.03] text-neutral-400 dark:text-neutral-500 custom:text-neutral-400"
          : isOverdue
          ? "border-red-300/80 dark:border-red-900/40 custom:border-red-500/30 bg-red-100/30 dark:bg-red-950/20 custom:bg-red-950/30 hover:border-red-400 dark:hover:border-red-800/60 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          : isDueToday
          ? "border-red-300/80 dark:border-red-900/40 custom:border-red-500/30 bg-red-100/30 dark:bg-red-950/20 custom:bg-red-950/30 hover:border-red-400 dark:hover:border-red-800/60 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          : isUpcoming
          ? "border-pink-300/80 dark:border-pink-900/40 custom:border-pink-500/30 bg-pink-100/30 dark:bg-pink-950/20 custom:bg-pink-950/30 hover:border-pink-400 dark:hover:border-pink-800/60 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          : "border-neutral-300/80 dark:border-neutral-800 custom:border-transparent bg-[#FAFBFD] dark:bg-[#141416] custom:bg-[#1A1A22]/80 custom:backdrop-blur-md hover:border-neutral-400 dark:hover:border-neutral-700 custom:hover:border-white/20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
      )}
    >
      {/* Interactive Checkbox - Touch optimized min 28px tap target */}
      <button
        type="button"
        role="checkbox"
        aria-checked={task.completed}
        aria-label={`Mark task ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
        onClick={handleCheckboxClick}
        className={clsx(
          "mt-0.5 flex-shrink-0 w-4 h-4 rounded-[3px] border flex items-center justify-center transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400",
          task.completed
            ? "bg-neutral-800 dark:bg-blue-600 custom:bg-blue-500 border-neutral-800 dark:border-blue-600 custom:border-blue-500 text-white"
            : isOverdue || isDueToday
            ? "border-red-400 dark:border-red-500 custom:border-red-400 bg-[#FAFBFD] dark:bg-neutral-900 custom:bg-neutral-950 hover:border-red-600"
            : isUpcoming
            ? "border-pink-400 dark:border-pink-500 custom:border-pink-400 bg-[#FAFBFD] dark:bg-neutral-900 custom:bg-neutral-950 hover:border-pink-600"
            : "border-neutral-300 dark:border-neutral-600 custom:border-transparent hover:border-neutral-500 dark:hover:border-neutral-400 bg-[#FAFBFD] dark:bg-neutral-800 custom:bg-neutral-950/70"
        )}
      >
        {task.completed && <Check className="w-3 h-3 stroke-[3]" />}
      </button>

      {/* Task Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h4
            className={clsx(
              "text-xs font-medium leading-snug break-words",
              task.completed ? "line-through text-neutral-400 dark:text-neutral-500" : "text-neutral-900 dark:text-neutral-100"
            )}
          >
            {task.title}
          </h4>

          {/* Recurrence indicator */}
          {task.recurrenceId && (
            <span
              title="Recurring task"
              className="inline-flex items-center text-[10px] text-neutral-400 dark:text-neutral-500 gap-0.5"
            >
              <Repeat className="w-3 h-3" />
            </span>
          )}
        </div>

        {task.description && (
          <p
            className={clsx(
              "mt-1 text-[11px] leading-relaxed line-clamp-2",
              task.completed ? "text-neutral-400 dark:text-neutral-500" : "text-neutral-500 dark:text-neutral-400"
            )}
          >
            {task.description}
          </p>
        )}

        {/* Metadata badges */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <Badge variant="priority" priority={task.priority} />

          {/* Date indicator with strict dd-mm-yyyy and status color logic */}
          <span
            className={clsx(
              "inline-flex items-center gap-1 text-[11px] font-mono px-1.5 py-0.5 rounded border",
              task.completed
                ? "text-neutral-400 dark:text-neutral-500 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
                : isOverdue
                ? "text-red-700 dark:text-red-400 bg-red-100/60 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 font-semibold"
                : isDueToday
                ? "text-red-700 dark:text-red-400 bg-red-100/60 dark:bg-red-950/40 border-red-200 dark:border-red-900/50 font-semibold"
                : isUpcoming
                ? "text-pink-700 dark:text-pink-300 bg-pink-100/60 dark:bg-pink-950/40 border-pink-200 dark:border-pink-900/50 font-medium"
                : "text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-800 border-neutral-200 dark:border-neutral-700"
            )}
            title={
              task.completed
                ? "Completed"
                : isOverdue
                ? "Overdue task (Past date)"
                : isDueToday
                ? "Due today"
                : "Upcoming scheduled task"
            }
          >
            <Calendar className="w-3 h-3 flex-shrink-0" />
            <span>{formatToDDMMYYYY(task.date)}</span>
            {!task.completed && isOverdue && (
              <span className="text-[9px] uppercase tracking-wider font-bold">Overdue</span>
            )}
            {!task.completed && isDueToday && (
              <span className="text-[9px] uppercase tracking-wider font-bold">Today</span>
            )}
            {!task.completed && isUpcoming && (
              <span className="text-[9px] uppercase tracking-wider font-medium opacity-80">Upcoming</span>
            )}
          </span>

          {task.dueTime && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-neutral-600 dark:text-neutral-400 custom:text-neutral-300 bg-[#EAEBF0] dark:bg-neutral-800 custom:bg-white/10 px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 custom:border-transparent">
              <Clock className="w-3 h-3" />
              {task.dueTime}
            </span>
          )}

          {category && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium text-neutral-700 dark:text-neutral-300 custom:text-white bg-[#EAEBF0] dark:bg-neutral-800 custom:bg-white/10 px-1.5 py-0.5 rounded border border-neutral-300 dark:border-neutral-700 custom:border-transparent"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: category.color || "#71717a" }}
              />
              {category.name}
            </span>
          )}

          {/* Reschedule Note Badge (Requirement 3, 4, 5, 6) */}
          {task.rescheduledFrom && (
            <span
              className={clsx(
                "inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded border",
                task.rescheduleType === "POSTPONED" || task.rescheduleType === "OVERDUE_COMPLETED" || task.date > task.rescheduledFrom
                  ? "bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50"
                  : "bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50"
              )}
              title={
                task.originalDate && task.originalDate !== task.rescheduledFrom
                  ? `Originally scheduled for ${formatToDDMMYYYY(task.originalDate)} (rescheduled ${task.rescheduleCount || 1}x)`
                  : undefined
              }
            >
              <CalendarClock className="w-3 h-3 flex-shrink-0" />
              <span>
                {task.rescheduleType === "POSTPONED" || task.rescheduleType === "OVERDUE_COMPLETED" || task.date > task.rescheduledFrom
                  ? `Postponed from ${formatToDDMMYYYY(task.rescheduledFrom)}`
                  : `Preponed from ${formatToDDMMYYYY(task.rescheduledFrom)}`}
              </span>
              {Boolean(task.rescheduleCount && task.rescheduleCount > 1) && (
                <span className="opacity-75 text-[9px]">({task.rescheduleCount}x)</span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons - Touch friendly on mobile */}
      <div className="opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity flex items-center gap-1 -mr-1">
        {!task.completed && onReschedule && (
          <button
            type="button"
            onClick={() => onReschedule(task)}
            aria-label="Reschedule task"
            title="Reschedule (Postpone or Prepone)"
            className="p-1.5 sm:p-1 text-neutral-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
          >
            <CalendarClock className="w-3.5 h-3.5" />
          </button>
        )}
        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label="Edit task"
          className="p-1.5 sm:p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          aria-label="Delete task"
          className="p-1.5 sm:p-1 text-neutral-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 rounded transition-colors min-w-[28px] min-h-[28px] flex items-center justify-center"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
