"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Task, Category, PriorityLevel, CreateTaskRequest, EditScope } from "@/lib/types";
import { api } from "@/lib/api";
import { TaskItem } from "@/components/tasks/TaskItem";
import { GroupedTaskItem } from "@/components/tasks/GroupedTaskItem";
import { CompletionModal } from "@/components/tasks/CompletionModal";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { RescheduleModal } from "@/components/tasks/RescheduleModal";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import {
  getTodayDateString,
  getWeekRange,
  getMonthRange,
  formatToDDMMYYYY,
  formatDateDisplay,
} from "@/lib/dateUtils";
import { Search, Plus, Filter, ListChecks, Calendar } from "lucide-react";
import { clsx } from "clsx";

export type TaskHorizon = "TODAY" | "THIS_WEEK" | "THIS_MONTH";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Date Range Horizon Filter (Today default as required)
  const [horizon, setHorizon] = useState<TaskHorizon>("TODAY");

  // Existing Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals state
  const [confirmingTask, setConfirmingTask] = useState<Task | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const [reschedulingTask, setReschedulingTask] = useState<Task | null>(null);
  const [isRescheduling, setIsRescheduling] = useState(false);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deleteScope, setDeleteScope] = useState<EditScope>("single");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const [tasksRes, catsRes] = await Promise.all([
        api.getTasks(),
        api.getCategories(),
      ]);
      setTasks(tasksRes);
      setCategories(catsRes);
    } catch (err) {
      console.error("Failed to load tasks", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleInitiateComplete = (task: Task) => {
    setConfirmingTask(task);
  };

  const handleConfirmComplete = async (postponeToToday = false) => {
    if (!confirmingTask) return;
    setIsCompleting(true);
    try {
      await api.completeTask(confirmingTask.id, postponeToToday);
      setConfirmingTask(null);
      await fetchTasks();
    } catch (err: any) {
      alert(err?.message || "Failed to complete task");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleReschedule = async (
    task: Task,
    newDate: string,
    actionType: "POSTPONE" | "PREPONE" = "POSTPONE",
    dueTime?: string | null
  ) => {
    setIsRescheduling(true);
    try {
      await api.rescheduleTask(task.id, { newDate, dueTime, actionType });
      setReschedulingTask(null);
      await fetchTasks();
    } catch (err: any) {
      alert(err?.message || "Failed to reschedule task");
      throw err;
    } finally {
      setIsRescheduling(false);
    }
  };

  const handleUncomplete = async (task: Task) => {
    try {
      await api.uncompleteTask(task.id);
      await fetchTasks();
    } catch (err: any) {
      alert(err?.message || "Failed to uncomplete task");
    }
  };

  const handleFormSubmit = async ({
    payload,
    id,
    editScope,
  }: {
    payload: CreateTaskRequest;
    id?: string;
    editScope?: EditScope;
  }) => {
    if (id) {
      await api.updateTask(id, payload, editScope);
    } else {
      await api.createTask(payload);
    }
    await fetchTasks();
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await api.deleteTask(deletingTask.id, deleteScope);
      setDeletingTask(null);
      await fetchTasks();
    } catch (err: any) {
      alert(err?.message || "Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const categoryMap = useMemo(
    () => new Map(categories.map((c) => [c.id, c])),
    [categories]
  );

  const todayStr = useMemo(() => getTodayDateString(), []);
  const weekRange = useMemo(() => getWeekRange(todayStr), [todayStr]);
  const monthRange = useMemo(() => getMonthRange(todayStr), [todayStr]);

  // Counts for each horizon tab
  const horizonCounts = useMemo(() => {
    let todayCount = 0;
    let weekCount = 0;
    let monthCount = 0;

    for (const t of tasks) {
      if (t.date === todayStr) todayCount++;
      if (t.date >= weekRange.start && t.date <= weekRange.end) weekCount++;
      if (t.date >= monthRange.start && t.date <= monthRange.end) monthCount++;
    }

    return { todayCount, weekCount, monthCount };
  }, [tasks, todayStr, weekRange, monthRange]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Horizon Filter (Today is default)
      if (horizon === "TODAY") {
        if (task.date !== todayStr) return false;
      } else if (horizon === "THIS_WEEK") {
        if (task.date < weekRange.start || task.date > weekRange.end) return false;
      } else if (horizon === "THIS_MONTH") {
        if (task.date < monthRange.start || task.date > monthRange.end) return false;
      }

      // 2. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      // 3. Priority Filter
      if (priorityFilter !== "ALL" && task.priority !== priorityFilter) {
        return false;
      }

      // 4. Status Filter
      if (statusFilter === "COMPLETED" && !task.completed) return false;
      if (statusFilter === "INCOMPLETE" && task.completed) return false;

      return true;
    });
  }, [tasks, horizon, todayStr, weekRange, monthRange, searchQuery, priorityFilter, statusFilter]);

  // Group repeated tasks for "This Week" and "This Month" views
  type TaskDisplayEntry =
    | { type: "single"; task: Task }
    | { type: "grouped"; key: string; tasks: Task[] };

  const displayEntries = useMemo<TaskDisplayEntry[]>(() => {
    if (horizon === "TODAY") {
      // In Today's view, show individual tasks directly
      return filteredTasks.map((t) => ({ type: "single", task: t }));
    }

    // In This Week & This Month: group repeated tasks to prevent duplicate clutter
    const groups = new Map<string, Task[]>();
    const singles: Task[] = [];

    for (const task of filteredTasks) {
      // Group by recurrenceId if available, or by title + category if recurring
      const groupKey = task.recurrenceId
        ? `rec-${task.recurrenceId}`
        : task.title
        ? `title-${task.title.toLowerCase().trim()}:::${task.categoryId || ""}`
        : null;

      if (groupKey) {
        const existing = groups.get(groupKey) || [];
        existing.push(task);
        groups.set(groupKey, existing);
      } else {
        singles.push(task);
      }
    }

    const result: TaskDisplayEntry[] = [];

    // Any group with > 1 occurrence becomes a GroupedTaskItem
    groups.forEach((groupTasks, key) => {
      if (groupTasks.length > 1) {
        result.push({ type: "grouped", key, tasks: groupTasks });
      } else if (groupTasks.length === 1) {
        result.push({ type: "single", task: groupTasks[0] });
      }
    });

    for (const s of singles) {
      result.push({ type: "single", task: s });
    }

    // Sort chronologically by date
    result.sort((a, b) => {
      const dateA = a.type === "single" ? a.task.date : a.tasks[0]?.date || "";
      const dateB = b.type === "single" ? b.task.date : b.tasks[0]?.date || "";
      return dateA.localeCompare(dateB);
    });

    return result;
  }, [filteredTasks, horizon]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-neutral-300/80 dark:border-neutral-800 custom:border-transparent">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 custom:text-white">
            Task Registry
          </h1>
          <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 custom:text-neutral-300">
            Unified chronological task backlog, date range horizons, and multi-filter engine
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            setEditingTask(null);
            setIsFormOpen(true);
          }}
          className="self-start sm:self-auto"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Task</span>
        </Button>
      </div>

      {/* Date Range Selector Segmented Control (Today / This Week / This Month) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-1">
        <div className="flex items-center p-1 bg-[#E4E6EB] dark:bg-neutral-800/80 custom:bg-black/60 border border-neutral-300 dark:border-neutral-700 custom:border-transparent rounded-lg w-full sm:w-auto">
          {(
            [
              { id: "TODAY", label: "Today", count: horizonCounts.todayCount },
              { id: "THIS_WEEK", label: "This Week", count: horizonCounts.weekCount },
              { id: "THIS_MONTH", label: "This Month", count: horizonCounts.monthCount },
            ] as const
          ).map((tab) => {
            const isActive = horizon === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setHorizon(tab.id)}
                className={clsx(
                  "flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 sm:px-4 py-1.5 text-xs font-medium rounded-md transition-all",
                  isActive
                    ? "bg-[#FAFBFD] dark:bg-[#141416] custom:bg-white/20 text-neutral-950 dark:text-neutral-100 custom:text-white shadow-sm font-semibold ring-1 ring-neutral-300/80 dark:ring-neutral-700 custom:ring-transparent"
                    : "text-neutral-700 dark:text-neutral-400 custom:text-neutral-300 hover:text-neutral-950 dark:hover:text-neutral-100 hover:bg-neutral-300/50 dark:hover:bg-neutral-800/60 custom:hover:bg-white/10"
                )}
              >
                <span>{tab.label}</span>
                <span
                  className={clsx(
                    "text-[10px] px-1.5 py-0.2 rounded-full font-mono",
                    isActive
                      ? "bg-neutral-200 dark:bg-neutral-800 custom:bg-white/20 text-neutral-900 dark:text-neutral-200 custom:text-white font-semibold"
                      : "bg-neutral-300/60 dark:bg-neutral-700/50 custom:bg-white/10 text-neutral-600 dark:text-neutral-400 custom:text-neutral-300"
                  )}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Date horizon callout */}
        <div className="flex items-center gap-1.5 text-xs text-neutral-600 dark:text-neutral-400 custom:text-neutral-300">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            {horizon === "TODAY" && `Today (${formatDateDisplay(todayStr)})`}
            {horizon === "THIS_WEEK" &&
              `Week: ${formatToDDMMYYYY(weekRange.start)} — ${formatToDDMMYYYY(weekRange.end)}`}
            {horizon === "THIS_MONTH" &&
              `Month: ${formatToDDMMYYYY(monthRange.start)} — ${formatToDDMMYYYY(monthRange.end)}`}
          </span>
        </div>
      </div>

      {/* Filter Bar - Mobile responsive stack */}
      <div className="bg-[#F5F6F8] dark:bg-[#121214] custom:bg-[#121218]/75 custom:backdrop-blur-xl border border-neutral-300/80 dark:border-neutral-800 custom:border-transparent rounded-xl p-3 sm:p-4 shadow-sm flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between transition-all text-neutral-900 dark:text-neutral-100 custom:text-white">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 text-neutral-400 dark:text-neutral-500" />
          <input
            type="text"
            placeholder="Search by title or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-9 pl-8 pr-3 text-xs border border-neutral-300 dark:border-neutral-700 custom:border-transparent rounded-md focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400 bg-[#FAFBFD] dark:bg-neutral-800 custom:bg-[#0A0A0E]/90 text-neutral-900 dark:text-neutral-100 custom:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:bg-white dark:focus:bg-neutral-800 custom:focus:bg-[#0A0A0E]"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 custom:text-neutral-200 flex-1 sm:flex-initial">
            <Filter className="w-3.5 h-3.5 text-neutral-400 dark:text-neutral-500 flex-shrink-0" />
            <span className="hidden xs:inline">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full sm:w-auto h-9 px-2 border border-neutral-300 dark:border-neutral-700 custom:border-transparent rounded-md text-xs bg-[#FAFBFD] dark:bg-neutral-800 custom:bg-[#0A0A0E]/90 text-neutral-800 dark:text-neutral-100 custom:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400 focus:bg-white dark:focus:bg-neutral-800 custom:focus:bg-[#0A0A0E]"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-neutral-700 dark:text-neutral-300 custom:text-neutral-200 flex-1 sm:flex-initial">
            <span className="hidden xs:inline">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full sm:w-auto h-9 px-2 border border-neutral-300 dark:border-neutral-700 custom:border-transparent rounded-md text-xs bg-[#FAFBFD] dark:bg-neutral-800 custom:bg-[#0A0A0E]/90 text-neutral-800 dark:text-neutral-100 custom:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400 focus:bg-white dark:focus:bg-neutral-800 custom:focus:bg-[#0A0A0E]"
            >
              <option value="ALL">All Statuses</option>
              <option value="INCOMPLETE">Incomplete</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List (With Grouped Repeated Tasks for Week/Month) */}
      <div className="space-y-2.5">
        {isLoading && tasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-neutral-500 dark:text-neutral-400">
            Loading tasks...
          </div>
        ) : displayEntries.length === 0 ? (
          <div className="bg-[#F5F6F8] dark:bg-[#121214] custom:bg-[#121218]/75 custom:backdrop-blur-xl border border-neutral-300/80 dark:border-neutral-800 custom:border-transparent rounded-xl p-8 sm:p-10 text-center transition-all text-neutral-900 dark:text-neutral-100 custom:text-white">
            <ListChecks className="w-8 h-8 text-neutral-400 dark:text-neutral-600 custom:text-neutral-500 mx-auto mb-2" />
            <p className="text-xs font-semibold text-neutral-800 dark:text-neutral-300 custom:text-white">
              {horizon === "TODAY"
                ? "No tasks scheduled for today"
                : horizon === "THIS_WEEK"
                ? "No tasks found for this week"
                : "No tasks found for this month"}
            </p>
            <p className="text-[11px] text-neutral-500 dark:text-neutral-500 custom:text-neutral-400 mt-1">
              Adjust your search filters or schedule a new task.
            </p>
          </div>
        ) : (
          displayEntries.map((entry) => {
            if (entry.type === "grouped") {
              const first = entry.tasks[0];
              const category = first?.categoryId ? categoryMap.get(first.categoryId) : undefined;
              return (
                <GroupedTaskItem
                  key={entry.key}
                  tasks={entry.tasks}
                  category={category}
                  onInitiateComplete={handleInitiateComplete}
                  onUncomplete={handleUncomplete}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setIsFormOpen(true);
                  }}
                  onDelete={(t) => {
                    setDeletingTask(t);
                    setDeleteScope(t.recurrenceId ? "all" : "single");
                  }}
                  onReschedule={(t) => setReschedulingTask(t)}
                />
              );
            }

            const task = entry.task;
            return (
              <TaskItem
                key={task.id}
                task={task}
                category={task.categoryId ? categoryMap.get(task.categoryId) : undefined}
                showDate={horizon !== "TODAY"}
                onInitiateComplete={handleInitiateComplete}
                onUncomplete={handleUncomplete}
                onEdit={(t) => {
                  setEditingTask(t);
                  setIsFormOpen(true);
                }}
                onDelete={(t) => {
                  setDeletingTask(t);
                  setDeleteScope("single");
                }}
                onReschedule={(t) => setReschedulingTask(t)}
              />
            );
          })
        )}
      </div>

      {/* Two-Step Completion Confirmation Dialog */}
      <CompletionModal
        task={confirmingTask}
        isOpen={Boolean(confirmingTask)}
        onConfirm={handleConfirmComplete}
        onCancel={() => setConfirmingTask(null)}
        isLoading={isCompleting}
      />

      {/* Reschedule Modal (Postpone & Prepone) */}
      <RescheduleModal
        task={reschedulingTask}
        isOpen={Boolean(reschedulingTask)}
        onClose={() => setReschedulingTask(null)}
        onReschedule={handleReschedule}
        isLoading={isRescheduling}
      />

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialDate={todayStr}
        initialTask={editingTask}
        categories={categories}
      />

      {/* Delete Modal */}
      <Modal
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        title="Delete Task?"
        description={`Are you sure you want to delete "${deletingTask?.title}"?`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          {deletingTask?.recurrenceId && (
            <div className="border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 p-3 rounded text-xs space-y-2">
              <span className="font-semibold text-slate-900 dark:text-slate-100 block">
                Recurring Task Scope:
              </span>
              <div className="space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteScope"
                    value="single"
                    checked={deleteScope === "single"}
                    onChange={() => setDeleteScope("single")}
                    className="text-slate-900 dark:text-slate-100"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Delete only this task</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteScope"
                    value="future"
                    checked={deleteScope === "future"}
                    onChange={() => setDeleteScope("future")}
                    className="text-slate-900 dark:text-slate-100"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Delete this and future occurrences</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteScope"
                    value="all"
                    checked={deleteScope === "all"}
                    onChange={() => setDeleteScope("all")}
                    className="text-slate-900 dark:text-slate-100"
                  />
                  <span className="text-slate-700 dark:text-slate-300">Delete all occurrences</span>
                </label>
              </div>
            </div>
          )}

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingTask(null)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
