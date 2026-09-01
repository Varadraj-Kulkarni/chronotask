import React from "react";
import { Sparkles, Info } from "lucide-react";

export interface InsightBannerProps {
  insights: string[];
}

export function InsightBanner({ insights }: InsightBannerProps) {
  if (!insights || insights.length === 0) return null;

  return (
    <div className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-2 text-slate-800 dark:text-slate-200">
        <Sparkles className="w-4 h-4 text-slate-700 dark:text-amber-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wider font-mono">
          Productivity Insights
        </h4>
      </div>
      <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
        {insights.map((insight, idx) => (
          <li key={idx} className="flex items-start gap-2">
            <span className="text-slate-400 dark:text-slate-500 mt-0.5">•</span>
            <span className="leading-relaxed">{insight}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
