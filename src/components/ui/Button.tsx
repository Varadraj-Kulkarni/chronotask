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
      primary: "bg-neutral-900 dark:bg-white custom:bg-white text-white dark:text-neutral-950 custom:text-neutral-950 hover:bg-neutral-800 dark:hover:bg-neutral-100 custom:hover:bg-neutral-100 active:bg-black dark:active:bg-neutral-200 custom:active:bg-neutral-200 border border-transparent shadow-sm font-semibold",
      secondary: "bg-[#E4E6EB] dark:bg-neutral-800 custom:bg-white/10 text-neutral-900 dark:text-neutral-100 custom:text-white hover:bg-[#D8DBE0] dark:hover:bg-neutral-700 custom:hover:bg-white/15 border border-neutral-300/80 dark:border-neutral-700 custom:border-transparent shadow-sm",
      outline: "border border-neutral-300/90 dark:border-neutral-800 custom:border-transparent bg-[#FAFBFD] dark:bg-neutral-900 custom:bg-neutral-950/60 hover:bg-[#EAEBF0] dark:hover:bg-neutral-800 custom:hover:bg-white/10 text-neutral-800 dark:text-neutral-200 custom:text-white hover:text-neutral-950 dark:hover:text-white shadow-sm",
      ghost: "text-neutral-700 dark:text-neutral-400 custom:text-neutral-300 hover:text-neutral-950 dark:hover:text-neutral-100 custom:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/70 custom:hover:bg-white/10 border border-transparent",
      danger: "bg-red-600 text-white hover:bg-red-700 active:bg-red-800 border border-transparent shadow-sm font-semibold",
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
