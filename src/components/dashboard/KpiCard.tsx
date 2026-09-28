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
    <div className="bg-[#F5F6F8] dark:bg-[#121214] custom:bg-[#121218]/75 custom:backdrop-blur-xl border border-neutral-300/80 dark:border-neutral-800 custom:border-transparent rounded-xl p-3.5 sm:p-4 shadow-sm flex flex-col justify-between transition-all text-neutral-900 dark:text-neutral-100 custom:text-white">
      <div className="text-[10px] sm:text-[11px] font-mono font-medium text-neutral-600 dark:text-neutral-400 custom:text-neutral-300 uppercase tracking-wider">
        {label}
      </div>
      <div className="mt-1.5 sm:mt-2 text-xl sm:text-2xl font-bold font-mono tracking-tight text-neutral-900 dark:text-neutral-100 custom:text-white tabular-nums">
        {value}
      </div>
      {(subtext || trend) && (
        <div className="mt-2 pt-2 border-t border-neutral-200/90 dark:border-neutral-800/80 custom:border-transparent flex items-center justify-between text-xs text-neutral-600 dark:text-neutral-400 custom:text-neutral-300">
          <span className="text-[11px] sm:text-xs">{subtext}</span>
          {trend && (
            <span
              className={clsx(
                "font-medium font-mono text-[10px] sm:text-[11px]",
                trend.positive ? "text-emerald-700 dark:text-emerald-400 custom:text-emerald-300" : "text-red-700 dark:text-red-400 custom:text-red-300"
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
