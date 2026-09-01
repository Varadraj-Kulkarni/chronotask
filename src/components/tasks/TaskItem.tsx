import React from "react";
import { Task, Category } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Clock, Repeat, Trash2, Edit2, Check } from "lucide-react";
import { clsx } from "clsx";

export interface TaskItemProps {
  task: Task;
  category?: Category;
  onInitiateComplete: (task: Task) => void;
  onUncomplete: (task: Task) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskItem({
  task,
  category,
  onInitiateComplete,
  onUncomplete,
  onEdit,
  onDelete,
}: TaskItemProps) {
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
        "group relative flex items-start gap-3 p-3 bg-white dark:bg-slate-900 border rounded-md transition-all",
        task.completed
          ? "border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 text-slate-500 dark:text-slate-400"
          : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
      )}
    >
      {/* Interactive Checkbox */}
      <button
        type="button"
        role="checkbox"
        aria-checked={task.completed}
        aria-label={`Mark task ${task.title} as ${task.completed ? "incomplete" : "complete"}`}
        onClick={handleCheckboxClick}
        className={clsx(
          "mt-0.5 flex-shrink-0 w-4 h-4 rounded-[3px] border flex items-center justify-center transition-colors focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400",
          task.completed
            ? "bg-slate-700 dark:bg-blue-600 border-slate-700 dark:border-blue-600 text-white"
            : "border-slate-300 dark:border-slate-600 hover:border-slate-500 dark:hover:border-slate-400 bg-white dark:bg-slate-800"
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
              task.completed ? "line-through text-slate-400 dark:text-slate-500" : "text-slate-900 dark:text-slate-100"
            )}
          >
            {task.title}
          </h4>

          {/* Recurrence indicator */}
          {task.recurrenceId && (
            <span
              title="Recurring task"
              className="inline-flex items-center text-[10px] text-slate-400 dark:text-slate-500 gap-0.5"
            >
              <Repeat className="w-3 h-3" />
            </span>
          )}
        </div>

        {task.description && (
          <p
            className={clsx(
              "mt-1 text-[11px] leading-relaxed line-clamp-2",
              task.completed ? "text-slate-400 dark:text-slate-500" : "text-slate-500 dark:text-slate-400"
            )}
          >
            {task.description}
          </p>
        )}

        {/* Metadata badges */}
        <div className="mt-2 flex items-center gap-2 flex-wrap">
          <Badge variant="priority" priority={task.priority} />

          {task.dueTime && (
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              <Clock className="w-3 h-3" />
              {task.dueTime}
            </span>
          )}

          {category && (
            <span
              className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700"
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{ backgroundColor: category.color || "#475569" }}
              />
              {category.name}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 -mr-1">
        <button
          type="button"
          onClick={() => onEdit(task)}
          aria-label="Edit task"
          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded transition-colors"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(task)}
          aria-label="Delete task"
          className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
