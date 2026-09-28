"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Task } from "@/lib/types";
import { formatDateDisplay, formatToDDMMYYYY, toCalendarDateString } from "@/lib/dateUtils";
import { CheckCircle2, History, ArrowRight } from "lucide-react";

export interface CompletionModalProps {
  task: Task | null;
  isOpen: boolean;
  onConfirm: (postponeToToday?: boolean) => void;
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

  const todayStr = toCalendarDateString(new Date());
  const isPastOverdueTask = task ? task.date < todayStr : false;

  useEffect(() => {
    if (!isOpen) return;

    const timer = setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCancel();
      } else if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onConfirm(isPastOverdueTask);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onCancel, onConfirm, isPastOverdueTask]);

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
        className="w-full max-w-lg bg-[#FAFBFD] dark:bg-[#141416] custom:bg-[#0E0E14]/94 custom:backdrop-blur-2xl border border-neutral-300/90 dark:border-neutral-800 custom:border-transparent rounded-xl shadow-2xl overflow-hidden p-5 sm:p-6 animate-in zoom-in-95 duration-100 text-neutral-900 dark:text-neutral-100 custom:text-white"
      >
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100/80 dark:bg-blue-950/40 custom:bg-blue-900/40 text-blue-700 dark:text-blue-400 custom:text-blue-300 rounded-md border border-blue-200 dark:border-blue-900/50 custom:border-blue-500/30 mt-0.5 flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 id="completion-dialog-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 custom:text-white">
              {isPastOverdueTask ? "Complete Overdue Task?" : "Complete Task?"}
            </h3>

            {isPastOverdueTask ? (
              <div id="completion-dialog-body" className="mt-2 space-y-2 text-xs text-neutral-700 dark:text-neutral-300 custom:text-neutral-200">
                <p>
                  &ldquo;<span className="font-semibold text-neutral-900 dark:text-neutral-100 custom:text-white">{task.title}</span>&rdquo; was scheduled for{" "}
                  <strong className="text-neutral-900 dark:text-neutral-100 custom:text-white font-mono">
                    {formatDateDisplay(task.date, { short: true })}
                  </strong>
                  .
                </p>
                <div className="p-2.5 bg-[#EAEBF0]/70 dark:bg-neutral-900/60 custom:bg-white/10 border border-neutral-300/80 dark:border-neutral-800 custom:border-transparent rounded-md space-y-1 text-[11px]">
                  <p className="text-neutral-800 dark:text-neutral-200 custom:text-white font-medium">How would you like to record its completion?</p>
                  <ul className="space-y-1 list-disc list-inside text-neutral-600 dark:text-neutral-400 custom:text-neutral-300">
                    <li>
                      <strong>Complete & Postpone to Today</strong>: Marks the task completed for {formatToDDMMYYYY(task.date)} and logs a completed occurrence for today noting &ldquo;Postponed from {formatToDDMMYYYY(task.date)}&rdquo;.
                    </li>
                    <li>
                      <strong>Complete for Original Date</strong>: Simply marks historical completion on {formatToDDMMYYYY(task.date)}.
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <p id="completion-dialog-body" className="mt-2 text-xs text-neutral-700 dark:text-neutral-300 custom:text-neutral-200 leading-relaxed">
                Mark &ldquo;<span className="font-semibold text-neutral-900 dark:text-neutral-100 custom:text-white">{task.title}</span>&rdquo; as completed for{" "}
                <span className="font-mono text-neutral-900 dark:text-neutral-200 custom:text-white font-medium">
                  {formatDateDisplay(task.date, { short: true })}
                </span>
                ?
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 border-t border-neutral-200/80 dark:border-neutral-800 custom:border-transparent pt-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
            disabled={isLoading}
            className="order-last sm:order-first"
          >
            Cancel <span className="text-[10px] text-neutral-400 ml-1 hidden xs:inline">(Esc)</span>
          </Button>

          {isPastOverdueTask ? (
            <>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onConfirm(false)}
                disabled={isLoading}
                className="text-neutral-700 dark:text-neutral-300"
              >
                <History className="w-3.5 h-3.5 mr-1" />
                Complete for {formatToDDMMYYYY(task.date)}
              </Button>
              <Button
                ref={confirmBtnRef}
                type="button"
                variant="primary"
                size="sm"
                onClick={() => onConfirm(true)}
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium"
              >
                <ArrowRight className="w-3.5 h-3.5 mr-1" />
                Complete & Postpone to Today
              </Button>
            </>
          ) : (
            <Button
              ref={confirmBtnRef}
              type="button"
              variant="primary"
              size="sm"
              onClick={() => onConfirm(false)}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isLoading ? "Saving..." : "Confirm"}
              <span className="text-[10px] text-blue-200 font-mono ml-1 hidden xs:inline">(Enter)</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
