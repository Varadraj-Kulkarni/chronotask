import React from "react";
import { PriorityLevel, PriorityBreakdownItem } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

export interface PriorityDistributionProps {
  data: Record<PriorityLevel, PriorityBreakdownItem>;
}

export function PriorityDistribution({ data }: PriorityDistributionProps) {
  const priorities: PriorityLevel[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];

  return (
    <div className="bg-[#FAFAF9] dark:bg-[#121214] border border-neutral-200/90 dark:border-neutral-800 rounded-lg p-3.5 sm:p-5 shadow-sm transition-colors">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Priority Distribution</h3>
        <p className="text-xs text-neutral-500 dark:text-neutral-400">
          Completion rates segmented by urgency level
        </p>
      </div>

      <div className="space-y-3">
        {priorities.map((p) => {
          const stats = data?.[p] || { total: 0, completed: 0 };
          const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

          return (
            <div key={p} className="p-2.5 border border-neutral-100 dark:border-neutral-800 rounded-md bg-neutral-50/50 dark:bg-neutral-900/50">
              <div className="flex items-center justify-between mb-1.5">
                <Badge variant="priority" priority={p} />
                <span className="text-xs font-mono tabular-nums text-neutral-700 dark:text-neutral-300">
                  {stats.completed}/{stats.total} ({pct}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-neutral-200/80 dark:bg-neutral-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-neutral-900 dark:bg-white rounded-full transition-all duration-300"
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
