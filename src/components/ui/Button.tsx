import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400 focus:ring-offset-1 disabled:opacity-50 disabled:pointer-events-none select-none touch-manipulation";

    const variants = {
      primary: "bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 active:bg-black dark:active:bg-neutral-200 border border-transparent shadow-sm",
      secondary: "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-100 hover:bg-neutral-200 dark:hover:bg-neutral-700 border border-neutral-200 dark:border-neutral-700",
      outline: "border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 hover:bg-neutral-50 dark:hover:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:text-neutral-900 dark:hover:text-white shadow-sm",
      ghost: "text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 hover:bg-neutral-100/70 dark:hover:bg-neutral-800/70 border border-transparent",
      danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-transparent shadow-sm",
    };

    const sizes = {
      sm: "text-xs px-2.5 py-1 min-h-[32px] gap-1.5",
      md: "text-xs px-3 py-1.5 min-h-[36px] gap-2",
      lg: "text-sm px-4 py-2 min-h-[40px] gap-2",
    };

    return (
      <button
        ref={ref}
        className={twMerge(clsx(baseStyles, variants[variant], sizes[size], className))}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
