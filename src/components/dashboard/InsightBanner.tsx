import React from "react";
import { Sparkles, Info } from "lucide-react";

export interface InsightBannerProps {
  insights: string[];
}

export function InsightBanner({ insights }: InsightBannerProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-[#FAFAF9] dark:bg-[#121214] border border-neutral-200/90 dark:border-neutral-800 rounded-lg p-4 shadow-sm transition-colors">
      <div className="flex items-center gap-2 mb-2 text-neutral-800 dark:text-neutral-200">
        <Sparkles className="w-4 h-4 text-neutral-700 dark:text-amber-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wider font-mono">
          Productivity Insights
        </h4>
      </div>
      <ul className="space-y-1.5 text-xs text-neutral-700 dark:text-neutral-300">
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
