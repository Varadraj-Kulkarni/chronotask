import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Task } from "@/lib/types";
import { formatDateDisplay } from "@/lib/dateUtils";
import { CheckCircle2 } from "lucide-react";

export interface CompletionModalProps {
  task: Task | null;
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CompletionModal({
  task,
  isOpen,
  onConfirm,
  onCancel,
  isLoading = false,
}: CompletionModalProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    // Auto focus confirm button for instant Enter key execution
    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel, onConfirm]);

  if (!isOpen || !task || !mounted) return null;

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-[3px] animate-in fade-in duration-100"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="completion-dialog-title"
        aria-describedby="completion-dialog-body"
        className="w-full max-w-md bg-[#FAFAF9] dark:bg-[#141416] border border-neutral-200/90 dark:border-neutral-800 rounded-xl shadow-2xl overflow-hidden p-5 sm:p-6 animate-in zoom-in-95 duration-100"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-md border border-blue-100 dark:border-blue-900/50 mt-0.5 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <h3 id="completion-dialog-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
              Complete Task?
            </h3>
            <p id="completion-dialog-body" className="mt-2 text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Mark &ldquo;<span className="font-semibold text-neutral-900 dark:text-neutral-100">{task.title}</span>&rdquo; as completed for{" "}
              <span className="font-mono text-neutral-800 dark:text-neutral-200 font-medium">
                {formatDateDisplay(task.date, { short: true })}
              </span>
              ?
            </p>
            <p className="mt-1 text-[11px] text-neutral-400 dark:text-neutral-500">
              This action updates historical completion velocity for this calendar date.
            </p>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2 border-t border-neutral-100 dark:border-neutral-800 pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
          >
            Cancel <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono ml-1 hidden xs:inline">(Esc)</span>
          </Button>
          <Button
            ref={confirmBtnRef}
            type="button"
            variant="primary"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "Saving..." : "Confirm"}
            <span className="text-[10px] text-blue-200 font-mono ml-1 hidden xs:inline">(Enter)</span>
          </Button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
