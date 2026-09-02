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
      LOW: "bg-neutral-50 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 border-neutral-200 dark:border-neutral-700",
      MEDIUM: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/60",
      HIGH: "bg-amber-50 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/60",
      URGENT: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/60 font-semibold",
    };
    return (
      <span className={twMerge(clsx(base, priorityStyles[priority], className))} {...props}>
        {priority}
      </span>
    );
  }

  const defaultStyles = "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-200 border-neutral-200 dark:border-neutral-700";
  return (
    <span className={twMerge(clsx(base, defaultStyles, className))} {...props}>
      {children}
    </span>
  );
}
