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
      LOW: "bg-neutral-200/70 dark:bg-neutral-800 custom:bg-white/10 text-neutral-700 dark:text-neutral-300 custom:text-neutral-200 border-neutral-300 dark:border-neutral-700 custom:border-transparent",
      MEDIUM: "bg-blue-100/80 dark:bg-blue-950/50 custom:bg-blue-950/60 text-blue-800 dark:text-blue-300 custom:text-blue-300 border-blue-300 dark:border-blue-900/60 custom:border-blue-500/30",
      HIGH: "bg-amber-100/80 dark:bg-amber-950/50 custom:bg-amber-950/60 text-amber-900 dark:text-amber-300 custom:text-amber-300 border-amber-300 dark:border-amber-900/60 custom:border-amber-500/30",
      URGENT: "bg-red-100/80 dark:bg-red-950/50 custom:bg-red-950/60 text-red-800 dark:text-red-300 custom:text-red-300 border-red-300 dark:border-red-900/60 custom:border-red-500/30 font-semibold",
    };
    return (
      <span className={twMerge(clsx(base, priorityStyles[priority], className))} {...props}>
        {priority}
      </span>
    );
  }

  const defaultStyles = "bg-[#E4E6EB] dark:bg-neutral-800 custom:bg-white/10 text-neutral-800 dark:text-neutral-200 custom:text-white border-neutral-300/80 dark:border-neutral-700 custom:border-transparent";
  return (
    <span className={twMerge(clsx(base, defaultStyles, className))} {...props}>
      {children}
    </span>
  );
}
