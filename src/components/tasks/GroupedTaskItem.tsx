"use client";

import React, { useState } from "react";
import { Task, Category } from "@/lib/types";
import { TaskItem } from "./TaskItem";
import { Badge } from "@/components/ui/Badge";
import { formatToDDMMYYYY } from "@/lib/dateUtils";
import { Repeat, ChevronDown, ChevronUp, CheckCircle2, Circle } from "lucide-react";
import { clsx } from "clsx";

export interface GroupedTaskItemProps {
  tasks: Task[];
  category?: Category;
  onInitiateComplete: (task: Task) => void;
  onUncomplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function GroupedTaskItem({
  tasks,
  category,
  onInitiateComplete,
  onUncomplete,
  onEdit,
  onDelete,
}: GroupedTaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Sort occurrences chronologically
  const sortedTasks = [...tasks].sort((a, b) => a.date.localeCompare(b.date));
  const firstTask = sortedTasks[0];
  const lastTask = sortedTasks[sortedTasks.length - 1];

  const totalCount = sortedTasks.length;
  const completedCount = sortedTasks.filter((t) => t.completed).length;
  const isAllCompleted = completedCount === totalCount;
  const isPartiallyCompleted = completedCount > 0 && !isAllCompleted;

  const startDateFormatted = formatToDDMMYYYY(firstTask.date);
  const endDateFormatted = formatToDDMMYYYY(lastTask.date);
  const dateRangeLabel =
    firstTask.date === lastTask.date
      ? startDateFormatted
      : `${startDateFormatted} to ${endDateFormatted}`;

  return (
    <div
      className={clsx(
        "bg-[#FAFAF9] dark:bg-[#141416] border rounded-lg transition-all shadow-sm overflow-hidden",
        isAllCompleted
          ? "border-neutral-200 dark:border-neutral-800 opacity-80"
          : isPartiallyCompleted
          ? "border-amber-300 dark:border-amber-800/80"
          : "border-neutral-200 dark:border-neutral-800"
      )}
    >
      {/* Main Group Header Row */}
      <div
        onClick={() => setIsExpanded((prev) => !prev)}
        className="p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer hover:bg-neutral-100/50 dark:hover:bg-neutral-800/40 transition-colors select-none"
      >
        <div className="flex items-start gap-3 min-w-0">
          {/* Status glyph */}
          <div className="mt-0.5 flex-shrink-0">
            {isAllCompleted ? (
              <CheckCircle2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            ) : isPartiallyCompleted ? (
              <div className="w-4 h-4 rounded-full border-2 border-amber-500 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
              </div>
            ) : (
              <Circle className="w-4 h-4 text-neutral-400 dark:text-neutral-500" />
            )}
          </div>

          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span
                className={clsx(
                  "font-semibold text-xs sm:text-sm text-neutral-900 dark:text-neutral-100 truncate",
                  isAllCompleted && "line-through text-neutral-400 dark:text-neutral-500"
                )}
              >
                {firstTask.title}
              </span>

              {category && (
                <span
                  className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded font-medium border"
                  style={{
                    backgroundColor: category.color ? `${category.color}15` : undefined,
                    borderColor: category.color ? `${category.color}40` : undefined,
                    color: category.color || undefined,
                  }}
                >
                  {category.name}
                </span>
              )}

              <Badge variant="priority" priority={firstTask.priority} />
            </div>

            {/* Repetition Schedule Information */}
            <div className="flex items-center gap-2 text-xs text-neutral-600 dark:text-neutral-400 flex-wrap">
              <span className="inline-flex items-center gap-1 font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200/80 dark:border-blue-900/50">
                <Repeat className="w-3 h-3 flex-shrink-0" />
                Repeated: {dateRangeLabel}
              </span>

              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">
                ({completedCount}/{totalCount} completed)
              </span>
            </div>

            {firstTask.description && (
              <p className="text-xs text-neutral-500 dark:text-neutral-400 line-clamp-1 pt-0.5">
                {firstTask.description}
              </p>
            )}
          </div>
        </div>

        {/* Expand / Collapse Control */}
        <div className="flex items-center justify-between sm:justify-end gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-neutral-100 dark:border-neutral-800">
          <span className="text-[11px] text-neutral-500 dark:text-neutral-400 font-medium">
            {isExpanded ? "Hide occurrences" : `View all ${totalCount} occurrences`}
          </span>
          <button
            type="button"
            className="p-1 rounded text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200 hover:bg-neutral-200/60 dark:hover:bg-neutral-700 transition-colors"
            aria-label={isExpanded ? "Collapse occurrences" : "Expand occurrences"}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Expanded Occurrences List */}
      {isExpanded && (
        <div className="border-t border-neutral-200/70 dark:border-neutral-800/80 p-2.5 sm:p-3 bg-neutral-50/50 dark:bg-neutral-900/30 space-y-2">
          <div className="text-[11px] font-medium text-neutral-500 dark:text-neutral-400 px-1">
            Series Occurrences:
          </div>
          {sortedTasks.map((occurrence) => (
            <TaskItem
              key={occurrence.id}
              task={occurrence}
              category={category}
              showDate={true}
              onInitiateComplete={onInitiateComplete}
              onUncomplete={onUncomplete}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
