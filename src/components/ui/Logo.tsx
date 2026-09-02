import React from "react";

export interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function Logo({ className = "", size = "md" }: LogoProps) {
  const sizeMap = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  return (
    <div
      className={`relative flex items-center justify-center rounded-lg bg-neutral-900 dark:bg-white text-white dark:text-neutral-950 shadow-sm transition-all group-hover:scale-105 ${sizeMap[size]} ${className}`}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4"
      >
        {/* Outer chronometer continuum ring */}
        <circle
          cx="12"
          cy="12"
          r="8.5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeDasharray="4 2.5"
          className="opacity-75"
        />
        {/* Precision core: clock tick & deliberate task completion marker */}
        <path
          d="M12 7V12L15.5 14"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Chrono apex point */}
        <circle cx="12" cy="12" r="1.25" fill="currentColor" />
        <circle cx="12" cy="3.5" r="1" fill="currentColor" />
      </svg>
    </div>
  );
}
