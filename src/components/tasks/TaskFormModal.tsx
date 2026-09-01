import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { RecurrencePicker } from "./RecurrencePicker";
import {
  Task,
  Category,
  CreateTaskRequest,
  PriorityLevel,
  RecurrenceConfig,
  EditScope,
} from "@/lib/types";

export interface TaskFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    payload: CreateTaskRequest;
    id?: string;
    editScope?: EditScope;
  }) => Promise<void>;
  initialDate: string;
  initialTask?: Task | null;
  categories: Category[];
}

export function TaskFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialDate,
  initialTask,
  categories,
}: TaskFormModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(initialDate);
  const [dueTime, setDueTime] = useState("");
  const [priority, setPriority] = useState<PriorityLevel>("MEDIUM");
  const [categoryId, setCategoryId] = useState<string>("");
  const [recurrence, setRecurrence] = useState<RecurrenceConfig | null>(null);
  const [editScope, setEditScope] = useState<EditScope>("single");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialTask) {
      setTitle(initialTask.title);
      setDescription(initialTask.description || "");
      setDate(initialTask.date);
      setDueTime(initialTask.dueTime || "");
      setPriority(initialTask.priority);
      setCategoryId(initialTask.categoryId || "");
      setRecurrence(null); // Recurrence edit handled via scope
      setEditScope("single");
    } else {
      setTitle("");
      setDescription("");
      setDate(initialDate);
      setDueTime("");
      setPriority("MEDIUM");
      setCategoryId(categories[0]?.id || "");
      setRecurrence(null);
      setEditScope("single");
    }
    setError(null);
  }, [initialTask, initialDate, categories, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: CreateTaskRequest = {
        title: title.trim(),
        description: description.trim() || null,
        date,
        dueTime: dueTime || null,
        priority,
        categoryId: categoryId || null,
        recurrenceConfig: initialTask ? null : recurrence,
      };

      await onSubmit({
        payload,
        id: initialTask?.id,
        editScope: initialTask?.recurrenceId ? editScope : undefined,
      });

      onClose();
    } catch (err: any) {
      setError(err?.message || "Failed to save task.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialTask ? "Edit Task" : "New Task"}
      description={
        initialTask
          ? "Update task details and recurrence scope"
          : `Schedule an item for ${date}`
      }
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-2.5 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Task Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            required
            maxLength={200}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Audit quarterly metrics"
            className="w-full h-8 px-3 border border-slate-300 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400"
            autoFocus
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Description <span className="text-slate-400 dark:text-slate-500">(Optional)</span>
          </label>
          <textarea
            rows={2}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional context or notes..."
            className="w-full p-2.5 border border-slate-300 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-8 px-2.5 border border-slate-300 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
              Due Time <span className="text-slate-400 dark:text-slate-500">(Optional)</span>
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full h-8 px-2.5 border border-slate-300 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full h-8 px-2 border border-slate-300 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full h-8 px-2 border border-slate-300 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400"
            >
              <option value="">None</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Recurrence config for new tasks */}
        {!initialTask && (
          <RecurrencePicker value={recurrence} onChange={setRecurrence} />
        )}

        {/* Edit scope for recurring tasks */}
        {initialTask && initialTask.recurrenceId && (
          <div className="border border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/20 p-3 rounded text-xs space-y-2">
            <span className="font-semibold text-amber-900 dark:text-amber-300 block">
              This task is part of a recurring series:
            </span>
            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="editScope"
                  value="single"
                  checked={editScope === "single"}
                  onChange={() => setEditScope("single")}
                  className="text-slate-900 dark:text-slate-100"
                />
                <span className="text-slate-700 dark:text-slate-300">Update only this occurrence</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="editScope"
                  value="future"
                  checked={editScope === "future"}
                  onChange={() => setEditScope("future")}
                  className="text-slate-900 dark:text-slate-100"
                />
                <span className="text-slate-700 dark:text-slate-300">Update this and future occurrences</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="editScope"
                  value="all"
                  checked={editScope === "all"}
                  onChange={() => setEditScope("all")}
                  className="text-slate-900 dark:text-slate-100"
                />
                <span className="text-slate-700 dark:text-slate-300">Update all occurrences in series</span>
              </label>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : initialTask ? "Save Changes" : "Create Task"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
