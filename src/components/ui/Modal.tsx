import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = "md",
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !mounted) return null;

  const maxWidths = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/60 dark:bg-black/80 backdrop-blur-[3px] animate-in fade-in duration-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? "modal-title" : undefined}
        aria-describedby={description ? "modal-description" : undefined}
        className={`w-full ${maxWidths[maxWidth]} max-h-[92vh] flex flex-col bg-[#FAFBFD] dark:bg-[#141416] custom:bg-[#0E0E14]/94 custom:backdrop-blur-2xl border border-neutral-300/90 dark:border-neutral-800 custom:border-transparent rounded-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-100 text-neutral-900 dark:text-neutral-100 custom:text-white`}
      >
        {(title || description) && (
          <div className="flex items-start justify-between px-4 sm:px-5 py-3.5 sm:py-4 border-b border-neutral-200/90 dark:border-neutral-800 custom:border-transparent flex-shrink-0 bg-[#F5F6F8]/60 dark:bg-transparent custom:bg-white/[0.02]">
            <div>
              {title && (
                <h3 id="modal-title" className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 custom:text-white">
                  {title}
                </h3>
              )}
              {description && (
                <p id="modal-description" className="mt-0.5 text-xs text-neutral-600 dark:text-neutral-400 custom:text-neutral-300">
                  {description}
                </p>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 -mr-1 text-neutral-500 dark:text-neutral-400 custom:text-neutral-300 hover:text-neutral-900 dark:hover:text-white custom:hover:text-white rounded hover:bg-neutral-200/60 dark:hover:bg-neutral-800 custom:hover:bg-white/10 transition-colors min-w-[32px] min-h-[32px] flex items-center justify-center"
              aria-label="Close dialog"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        <div className="p-4 sm:p-5 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
