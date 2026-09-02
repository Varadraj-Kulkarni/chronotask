import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { RecurrencePicker } from "./RecurrencePicker";
import { formatToDDMMYYYY } from "@/lib/dateUtils";
import { api } from "@/lib/api";
import { clsx } from "clsx";
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
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [customCategoryColor, setCustomCategoryColor] = useState("#8B5CF6");
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
      setIsCustomCategory(false);
      setCustomCategoryName("");
      setRecurrence(null); // Recurrence edit handled via scope
      setEditScope("single");
    } else {
      setTitle("");
      setDescription("");
      setDate(initialDate);
      setDueTime("");
      setPriority("MEDIUM");
      // Requirement 5: Default category is None ("")
      setCategoryId("");
      setIsCustomCategory(false);
      setCustomCategoryName("");
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
      let finalCategoryId: string | null = categoryId || null;

      if (isCustomCategory) {
        const trimmed = customCategoryName.trim();
        if (trimmed) {
          // Check if category already exists (case-insensitive) to prevent duplicates
          const existing = categories.find(
            (c) => c.name.toLowerCase() === trimmed.toLowerCase()
          );
          if (existing) {
            finalCategoryId = existing.id;
          } else {
            try {
              const created = await api.createCategory({
                name: trimmed,
                color: customCategoryColor,
              });
              finalCategoryId = created.id;
            } catch (catErr) {
              console.error("Failed to create custom category", catErr);
            }
          }
        } else {
          finalCategoryId = null;
        }
      } else if (finalCategoryId === "__NEW_CUSTOM__") {
        finalCategoryId = null;
      }

      const payload: CreateTaskRequest = {
        title: title.trim(),
        description: description.trim() || null,
        date,
        dueTime: dueTime || null,
        priority,
        categoryId: finalCategoryId,
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
          <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
            Description <span className="text-neutral-400 dark:text-neutral-500">(Optional)</span>
          </label>
          <textarea
            rows={2}
            maxLength={2000}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional context or notes..."
            className="w-full p-2.5 border border-neutral-300 dark:border-neutral-700 rounded text-xs bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400 resize-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300">
                Date <span className="text-red-500">*</span>
              </label>
              {date && (
                <span className="text-[11px] font-mono font-semibold text-blue-600 dark:text-blue-400">
                  {formatToDDMMYYYY(date)}
                </span>
              )}
            </div>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full h-9 px-2.5 border border-neutral-300 dark:border-neutral-700 rounded text-xs bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Due Time <span className="text-neutral-400 dark:text-neutral-500">(Optional)</span>
            </label>
            <input
              type="time"
              value={dueTime}
              onChange={(e) => setDueTime(e.target.value)}
              className="w-full h-9 px-2.5 border border-neutral-300 dark:border-neutral-700 rounded text-xs bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as PriorityLevel)}
              className="w-full h-9 px-2 border border-neutral-300 dark:border-neutral-700 rounded text-xs bg-white dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-neutral-700 dark:text-neutral-300 mb-1">
              Category
            </label>
            <select
              value={isCustomCategory ? "__NEW_CUSTOM__" : categoryId}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "__NEW_CUSTOM__") {
                  setIsCustomCategory(true);
                  setCategoryId("__NEW_CUSTOM__");
                } else {
                  setIsCustomCategory(false);
                  setCategoryId(val);
                }
              }}
              className="w-full h-9 px-2 border border-neutral-300 dark:border-neutral-700 rounded text-xs bg-[#F4F4F5] dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400 focus:bg-white dark:focus:bg-neutral-800"
            >
              <option value="">None</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
              <option value="__NEW_CUSTOM__">+ Add Custom Category...</option>
            </select>
          </div>
        </div>

        {/* Custom Category Inline Creator */}
        {isCustomCategory && (
          <div className="p-3 bg-neutral-100/70 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700 rounded-md space-y-2 animate-in fade-in duration-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-neutral-800 dark:text-neutral-200">
                New Custom Category
              </label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomCategory(false);
                  setCategoryId("");
                  setCustomCategoryName("");
                }}
                className="text-[11px] text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Cancel
              </button>
            </div>
            <input
              type="text"
              value={customCategoryName}
              onChange={(e) => setCustomCategoryName(e.target.value)}
              placeholder="e.g. Fitness, Groceries, Finance..."
              className="w-full h-8 px-2.5 border border-neutral-300 dark:border-neutral-700 rounded text-xs bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400"
              autoFocus
            />
            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] text-neutral-500 dark:text-neutral-400">Color Tag:</span>
              <div className="flex items-center gap-1.5">
                {["#8B5CF6", "#10B981", "#3B82F6", "#F59E0B", "#EC4899", "#6366F1"].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCustomCategoryColor(c)}
                    className={clsx(
                      "w-5 h-5 rounded-full border transition-all",
                      customCategoryColor === c
                        ? "ring-2 ring-offset-1 ring-neutral-900 dark:ring-neutral-200 scale-110"
                        : "border-transparent opacity-80 hover:opacity-100"
                    )}
                    style={{ backgroundColor: c }}
                    aria-label={`Select category color ${c}`}
                  />
                ))}
              </div>
            </div>
          </div>
        )}

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
