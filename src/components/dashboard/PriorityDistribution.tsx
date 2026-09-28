import React from "react";
import { PriorityLevel, PriorityBreakdownItem } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { clsx } from "clsx";

export interface PriorityDistributionProps {
  data: Record<PriorityLevel, PriorityBreakdownItem>;
}

export function PriorityDistribution({ data }: PriorityDistributionProps) {
  const priorities: PriorityLevel[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];

  return (
    <div className="bg-[#F5F6F8] dark:bg-[#121214] custom:bg-[#121218]/75 custom:backdrop-blur-xl border border-neutral-300/80 dark:border-neutral-800 custom:border-transparent rounded-xl p-3.5 sm:p-5 shadow-sm transition-all text-neutral-900 dark:text-neutral-100 custom:text-white">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 custom:text-white">Priority Distribution</h3>
        <p className="text-xs text-neutral-600 dark:text-neutral-400 custom:text-neutral-300">
          Completion rates segmented by urgency level
        </p>
      </div>

      <div className="space-y-3">
        {priorities.map((p) => {
          const stats = data?.[p] || { total: 0, completed: 0 };
          const pct = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

          const priorityBarColors: Record<PriorityLevel, string> = {
            URGENT: "bg-gradient-to-r from-rose-500 to-red-600 shadow-[0_0_8px_rgba(244,63,94,0.4)]",
            HIGH: "bg-gradient-to-r from-amber-500 to-orange-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]",
            MEDIUM: "bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_8px_rgba(59,130,246,0.4)]",
            LOW: "bg-gradient-to-r from-emerald-400 to-teal-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]",
          };

          return (
            <div key={p} className="p-2.5 border border-neutral-200/90 dark:border-neutral-800 custom:border-transparent rounded-md bg-[#FAFBFD] dark:bg-neutral-900/50 custom:bg-white/[0.04]">
              <div className="flex items-center justify-between mb-1.5">
                <Badge variant="priority" priority={p} />
                <span className="text-xs font-mono tabular-nums text-neutral-700 dark:text-neutral-300 custom:text-neutral-200">
                  {stats.completed}/{stats.total} ({pct}%)
                </span>
              </div>
              <div className="h-2 w-full bg-[#E4E6EB] dark:bg-neutral-800 custom:bg-white/10 rounded-full overflow-hidden">
                <div
                  className={clsx("h-full rounded-full transition-all duration-300", priorityBarColors[p])}
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
