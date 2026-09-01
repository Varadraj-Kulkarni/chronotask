"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Task, Category, PriorityLevel, CreateTaskRequest, EditScope } from "@/lib/types";
import { api } from "@/lib/api";
import { TaskItem } from "@/components/tasks/TaskItem";
import { CompletionModal } from "@/components/tasks/CompletionModal";
import { TaskFormModal } from "@/components/tasks/TaskFormModal";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { toCalendarDateString } from "@/lib/dateUtils";
import { Search, Plus, Filter, ListChecks } from "lucide-react";

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // Modals state
  const [confirmingTask, setConfirmingTask] = useState<Task | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

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

  const handleConfirmComplete = async () => {
    if (!confirmingTask) return;
    setIsCompleting(true);
    try {
      await api.completeTask(confirmingTask.id);
      setConfirmingTask(null);
      await fetchTasks();
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

  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesDesc) return false;
      }

      if (priorityFilter !== "ALL" && task.priority !== priorityFilter) {
        return false;
      }

      if (statusFilter === "COMPLETED" && !task.completed) return false;
      if (statusFilter === "INCOMPLETE" && task.completed) return false;

      return true;
    });
  }, [tasks, searchQuery, priorityFilter, statusFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Task Registry
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Unified chronological task backlog and filter engine
          </p>
        </div>

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
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            placeholder="Search by title or details..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs border border-slate-300 dark:border-slate-700 rounded focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
            <span>Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="h-8 px-2 border border-slate-300 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400"
            >
              <option value="ALL">All Priorities</option>
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300">
            <span>Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-8 px-2 border border-slate-300 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400"
            >
              <option value="ALL">All Statuses</option>
              <option value="INCOMPLETE">Incomplete</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2.5">
        {isLoading && tasks.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">Loading tasks...</div>
        ) : filteredTasks.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-10 text-center">
            <ListChecks className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No tasks found</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
              Adjust your search filters or schedule a new task.
            </p>
          </div>
        ) : (
          filteredTasks.map((task) => (
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
              onDelete={(t) => {
                setDeletingTask(t);
                setDeleteScope("single");
              }}
            />
          ))
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

      {/* Task Form Modal */}
      <TaskFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleFormSubmit}
        initialDate={toCalendarDateString(new Date())}
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
