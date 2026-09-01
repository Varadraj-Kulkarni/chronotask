import React, { useState, useEffect, useCallback } from "react";
import { Task, Category, CreateTaskRequest, EditScope } from "@/lib/types";
import { formatDateDisplay } from "@/lib/dateUtils";
import { TaskItem } from "./TaskItem";
import { CompletionModal } from "./CompletionModal";
import { TaskFormModal } from "./TaskFormModal";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { api } from "@/lib/api";
import { Plus, CheckCircle2, ListTodo, X } from "lucide-react";

export interface DailyTaskPanelProps {
  dateStr: string;
  onTasksChanged?: () => void;
  onCloseMobile?: () => void;
}

export function DailyTaskPanel({
  dateStr,
  onTasksChanged,
  onCloseMobile,
}: DailyTaskPanelProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Two-step completion confirmation state
  const [confirmingTask, setConfirmingTask] = useState<Task | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  // Task creation/editing modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Delete modal state
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [deleteScope, setDeleteScope] = useState<EditScope>("single");
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tasksRes, catsRes] = await Promise.all([
        api.getTasks({ date: dateStr }),
        api.getCategories(),
      ]);
      setTasks(tasksRes);
      setCategories(catsRes);
    } catch (err) {
      console.error("Failed to load daily tasks", err);
    } finally {
      setIsLoading(false);
    }
  }, [dateStr]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Two-Step Completion Handlers
  const handleInitiateComplete = (task: Task) => {
    // Non-negotiable contract interaction rule:
    // User clicking the task checkbox MUST NOT immediately mutate state.
    // Opens confirmation dialog!
    setConfirmingTask(task);
  };

  const handleConfirmComplete = async () => {
    if (!confirmingTask) return;
    setIsCompleting(true);
    try {
      await api.completeTask(confirmingTask.id);
      setConfirmingTask(null);
      await fetchTasks();
      onTasksChanged?.();
    } catch (err: any) {
      alert(err?.message || "Failed to complete task");
    } finally {
      setIsCompleting(false);
    }
  };

  const handleUncomplete = async (task: Task) => {
    try {
      await api.uncompleteTask(task.id);
      await fetchTasks();
      onTasksChanged?.();
    } catch (err: any) {
      alert(err?.message || "Failed to uncomplete task");
    }
  };

  // Form Submit Handler (Create or Edit)
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
    onTasksChanged?.();
  };

  // Delete Handlers
  const handlePromptDelete = (task: Task) => {
    setDeletingTask(task);
    setDeleteScope("single");
  };

  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    setIsDeleting(true);
    try {
      await api.deleteTask(deletingTask.id, deleteScope);
      setDeletingTask(null);
      await fetchTasks();
      onTasksChanged?.();
    } catch (err: any) {
      alert(err?.message || "Failed to delete task");
    } finally {
      setIsDeleting(false);
    }
  };

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md shadow-sm overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Daily Agenda
            </span>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 mt-0.5">
              {formatDateDisplay(dateStr)}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingTask(null);
                setIsFormOpen(true);
              }}
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Task</span>
            </Button>
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 rounded hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Metric */}
        <div className="mt-4 pt-3 border-t border-slate-200/70 dark:border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-slate-600 dark:text-slate-400 font-medium">Completion Progress</span>
            <span className="font-mono tabular-nums text-slate-900 dark:text-slate-100 font-semibold">
              {completedTasks}/{totalTasks}{" "}
              <span className="text-slate-400 dark:text-slate-500 font-normal text-[11px]">
                ({completionPercentage}%)
              </span>
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700">
            <div
              className="h-full bg-slate-900 dark:bg-slate-100 transition-all duration-300 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task List Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-2.5">
        {isLoading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-400 text-xs">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-slate-200 dark:border-slate-800 rounded-md p-6 text-center">
            <ListTodo className="w-8 h-8 text-slate-300 dark:text-slate-600 mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300">No tasks for this day</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 max-w-[200px]">
              Days with no tasks remain strictly neutral in calendar metrics.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => {
                setEditingTask(null);
                setIsFormOpen(true);
              }}
            >
              Add first task
            </Button>
          </div>
        ) : (
          tasks.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              category={task.categoryId ? categoryMap.get(task.categoryId) : undefined}
              onInitiateComplete={handleInitiateComplete}
              onUncomplete={handleUncomplete}
              onEdit={(t) => {
                setEditingTask(t);
                setIsFormOpen(true);
              }}
              onDelete={handlePromptDelete}
            />
          ))
        )}
      </div>

      {/* Footer Info */}
      <div className="p-3 border-t border-slate-100 bg-slate-50 text-[11px] text-slate-500 font-mono flex items-center justify-between">
        <span>Date: {dateStr}</span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-slate-400" />
          Jane Street Editorial v1.0
        </span>
      </div>

      {/* Two-Step Completion Confirmation Dialog */}
      <CompletionModal
        task={confirmingTask}
        isOpen={Boolean(confirmingTask)}
        onConfirm={handleConfirmComplete}
        onCancel={() => setConfirmingTask(null)}
        isLoading={isCompleting}
      />

      {/* Task Add / Edit Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialDate={dateStr}
        initialTask={editingTask}
        categories={categories}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingTask)}
        onClose={() => setDeletingTask(null)}
        title="Delete Task?"
        description={`Are you sure you want to delete "${deletingTask?.title}"?`}
        maxWidth="sm"
      >
        <div className="space-y-4">
          {deletingTask?.recurrenceId && (
            <div className="border border-slate-200 bg-slate-50 p-3 rounded text-xs space-y-2">
              <span className="font-semibold text-slate-900 block">
                Recurring Series Delete Scope:
              </span>
              <div className="space-y-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteScope"
                    value="single"
                    checked={deleteScope === "single"}
                    onChange={() => setDeleteScope("single")}
                  />
                  <span>Delete only this task</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteScope"
                    value="future"
                    checked={deleteScope === "future"}
                    onChange={() => setDeleteScope("future")}
                  />
                  <span>Delete this and future occurrences</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteScope"
                    value="all"
                    checked={deleteScope === "all"}
                    onChange={() => setDeleteScope("all")}
                  />
                  <span>Delete all occurrences</span>
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
