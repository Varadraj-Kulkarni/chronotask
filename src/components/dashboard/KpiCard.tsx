import React from "react";
import { clsx } from "clsx";

export interface KpiCardProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: {
    positive?: boolean;
    text: string;
  };
}

export function KpiCard({ label, value, subtext, trend }: KpiCardProps) {
  return (
    <div className="bg-[#FAFAF9] dark:bg-[#121214] border border-neutral-200/90 dark:border-neutral-800 rounded-lg p-3.5 sm:p-4 shadow-sm flex flex-col justify-between transition-colors">
      <div className="text-[10px] sm:text-[11px] font-mono font-medium text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
        {label}
      </div>
      <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 tabular-nums">
        {value}
      </div>
      {(subtext || trend) && (
        <div className="mt-2 pt-2 border-t border-neutral-100 dark:border-neutral-800/80 flex items-center justify-between text-xs text-neutral-500 dark:text-neutral-400">
          <span className="text-[11px] sm:text-xs">{subtext}</span>
          {trend && (
            <span
              className={clsx(
                "font-medium font-mono text-[10px] sm:text-[11px]",
                trend.positive ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
              )}
            >
              {trend.text}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
