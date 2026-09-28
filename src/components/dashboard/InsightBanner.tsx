import React from "react";
import { Sparkles, Info } from "lucide-react";

export interface InsightBannerProps {
  insights: string[];
}

export function InsightBanner({ insights }: InsightBannerProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-[#F5F6F8] dark:bg-[#121214] custom:bg-[#121218]/75 custom:backdrop-blur-xl border border-neutral-300/80 dark:border-neutral-800 custom:border-transparent rounded-xl p-4 shadow-sm transition-all text-neutral-900 dark:text-neutral-100 custom:text-white">
      <div className="flex items-center gap-2 mb-2 text-neutral-800 dark:text-neutral-200 custom:text-amber-300">
        <Sparkles className="w-4 h-4 text-amber-500 dark:text-amber-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wider font-mono">
          Productivity Insights
        </h4>
      </div>
      <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300 custom:text-neutral-200">
        {insights.map((insight, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-neutral-400 dark:text-neutral-500 mt-0.5">•</span>
            <span className="leading-relaxed">{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
