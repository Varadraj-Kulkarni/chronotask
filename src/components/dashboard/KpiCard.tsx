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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 shadow-sm flex flex-col justify-between">
      <div className="text-[11px] font-mono font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-100 tabular-nums">
        {value}
      </div>
      {(subtext || trend) && (
        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{subtext}</span>
          {trend && (
            <span
              className={clsx(
                "font-medium font-mono text-[11px]",
                trend.positive ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400"
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
