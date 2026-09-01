import React from "react";
import { PriorityLevel, PriorityBreakdownItem } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

export interface PriorityDistributionProps {
  data: Record<PriorityLevel, PriorityBreakdownItem>;
}

export function PriorityDistribution({ data }: PriorityDistributionProps) {
  const priorities: PriorityLevel[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Priority Distribution</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Completion rates segmented by urgency level
        </p>
      </div>

      <div className="space-y-3">
        {priorities.map((p) => {
          const stats = data?.[p] || { total: 0, completed: 0 };
          const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

          return (
            <div key={p} className="p-2.5 border border-slate-100 dark:border-slate-800 rounded-md bg-slate-50/40 dark:bg-slate-800/40">
              <div className="flex items-center justify-between mb-1.5">
                <Badge variant="priority" priority={p} />
                <span className="text-xs font-mono tabular-nums text-slate-700 dark:text-slate-300">
                  {stats.completed}/{stats.total} ({pct}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-200/80 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-slate-900 dark:bg-slate-100 rounded-full transition-all duration-300"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
