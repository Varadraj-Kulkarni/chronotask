import React, { useState, useEffect, useCallback } from "react";
import { Task, Category, CreateTaskRequest, EditScope } from "@/lib/types";
import { formatDateDisplay, formatToDDMMYYYY } from "@/lib/dateUtils";
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
    <div className="flex flex-col h-full bg-[#FAFAF9] dark:bg-[#121214] border border-neutral-200/90 dark:border-neutral-800 rounded-lg shadow-sm overflow-hidden transition-colors">
      {/* Header */}
      <div className="p-3.5 sm:p-4 border-b border-neutral-200/80 dark:border-neutral-800 bg-[#F4F4F5]/60 dark:bg-neutral-900/50">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-[10px] sm:text-[11px] font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Daily Agenda
            </span>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 mt-0.5">
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
                className="lg:hidden p-1.5 text-neutral-400 dark:text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-200 rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 transition-colors"
                aria-label="Close panel"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Bar & Metric */}
        <div className="mt-3 sm:mt-4 pt-3 border-t border-neutral-200/70 dark:border-neutral-800">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-neutral-600 dark:text-neutral-400 font-medium">Completion Progress</span>
            <span className="font-mono tabular-nums text-neutral-900 dark:text-neutral-100 font-semibold">
              {completedTasks}/{totalTasks}{" "}
              <span className="text-neutral-400 dark:text-neutral-500 font-normal text-[11px]">
                ({completionPercentage}%)
              </span>
            </span>
          </div>
          <div className="h-1.5 w-full bg-neutral-100 dark:bg-neutral-800 rounded-full overflow-hidden border border-neutral-200 dark:border-neutral-700">
            <div
              className="h-full bg-neutral-900 dark:bg-white transition-all duration-300 rounded-full"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Task List Content */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto space-y-2.5 max-h-[520px]">
        {isLoading && tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 text-neutral-400 text-xs">
            Loading tasks...
          </div>
        ) : tasks.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-48 border border-dashed border-neutral-200 dark:border-neutral-800 rounded-md p-6 text-center">
            <ListTodo className="w-8 h-8 text-neutral-300 dark:text-neutral-600 mb-2 stroke-[1.5]" />
            <p className="text-xs font-medium text-neutral-700 dark:text-neutral-300">No tasks for this day</p>
            <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mt-1 max-w-[200px]">
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
      <div className="p-3 border-t border-neutral-100 dark:border-neutral-800 bg-[#F4F4F5]/70 dark:bg-neutral-900/60 text-[11px] text-neutral-500 dark:text-neutral-400 font-mono flex items-center justify-between">
        <span>Date: {formatToDDMMYYYY(dateStr)}</span>
        <span className="flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-neutral-400 dark:text-neutral-500" />
          <span>ChronoTask Precision</span>
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
            <div className="border border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded text-xs space-y-2">
              <span className="font-semibold text-neutral-900 dark:text-neutral-100 block">
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
                    className="text-neutral-900 dark:text-neutral-100"
                  />
                  <span className="text-neutral-700 dark:text-neutral-300">Delete only this task</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteScope"
                    value="future"
                    checked={deleteScope === "future"}
                    onChange={() => setDeleteScope("future")}
                    className="text-neutral-900 dark:text-neutral-100"
                  />
                  <span className="text-neutral-700 dark:text-neutral-300">Delete this and future occurrences</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="deleteScope"
                    value="all"
                    checked={deleteScope === "all"}
                    onChange={() => setDeleteScope("all")}
                    className="text-neutral-900 dark:text-neutral-100"
                  />
                  <span className="text-neutral-700 dark:text-neutral-300">Delete all occurrences</span>
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
