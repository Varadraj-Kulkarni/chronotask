import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { PriorityLevel } from "@/lib/types";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "outline" | "priority" | "status";
  priority?: PriorityLevel;
}

export function Badge({
  className,
  variant = "default",
  priority,
  children,
  ...props
}: BadgeProps) {
  const base =
    "inline-flex items-center text-[11px] font-medium px-2 py-0.5 rounded tracking-tight border";

  if (variant === "priority" && priority) {
    const priorityStyles: Record<PriorityLevel, string> = {
      LOW: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      MEDIUM: "bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800",
      HIGH: "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800",
      URGENT: "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800 font-semibold",
    };
    return (
      <span className={twMerge(clsx(base, priorityStyles[priority], className))} {...props}>
        {priority}
      </span>
    );
  }

  const defaultStyles = "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700";
  return (
    <span className={twMerge(clsx(base, defaultStyles, className))} {...props}>
      {children}
    </span>
  );
}
