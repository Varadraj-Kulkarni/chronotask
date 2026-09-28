"use client";

import React, { useState, useEffect } from "react";
import { AnalyticsPeriod, AnalyticsSummaryResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { toCalendarDateString, formatDateDisplay, formatToDDMMYYYY, getTodayDateString } from "@/lib/dateUtils";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { ProductivityTrend } from "@/components/dashboard/ProductivityTrend";
import { PriorityDistribution } from "@/components/dashboard/PriorityDistribution";
import { InsightBanner } from "@/components/dashboard/InsightBanner";
import { Button } from "@/components/ui/Button";
import { Calendar, RefreshCw } from "lucide-react";
import { clsx } from "clsx";

export default function DashboardPage() {
  const [period, setPeriod] = useState<AnalyticsPeriod>("weekly");
  const [activeDate, setActiveDate] = useState<string>(() =>
    getTodayDateString()
  );
  const [data, setData] = useState<AnalyticsSummaryResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAnalyticsSummary(period, activeDate);
      setData(res);
    } catch (err) {
      console.error("Failed to load analytics summary", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, [period, activeDate]);

  const periods: Array<{ id: AnalyticsPeriod; label: string }> = [
    { id: "daily", label: "Daily" },
    { id: "weekly", label: "Weekly" },
    { id: "monthly", label: "Monthly" },
    { id: "yearly", label: "Yearly" },
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header & Timescale Segmented Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pb-3 sm:pb-4 border-b border-neutral-300/80 dark:border-neutral-800 custom:border-transparent">
        <div>
          <h1 className="text-lg sm:text-xl font-bold tracking-tight text-neutral-900 dark:text-neutral-100 custom:text-white">
            Productivity Analytics
          </h1>
          <p className="text-[11px] sm:text-xs text-neutral-600 dark:text-neutral-400 custom:text-neutral-300">
            Deterministic velocity metrics across multi-timescale horizons
          </p>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
          {/* Segmented Control */}
          <div className="flex items-center p-1 bg-[#E4E6EB] dark:bg-neutral-800/80 custom:bg-black/60 border border-neutral-300 dark:border-neutral-700 custom:border-transparent rounded-lg">
            {periods.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={clsx(
                  "px-2.5 sm:px-3 py-1 text-xs font-medium rounded-md transition-all",
                  period === p.id
                    ? "bg-[#FAFBFD] dark:bg-[#121214] custom:bg-white/20 text-neutral-950 dark:text-neutral-100 custom:text-white shadow-sm font-semibold ring-1 ring-neutral-300/80 dark:ring-neutral-700 custom:ring-transparent"
                    : "text-neutral-700 dark:text-neutral-400 custom:text-neutral-300 hover:text-neutral-950 dark:hover:text-neutral-100 hover:bg-neutral-300/50 dark:hover:bg-neutral-800/60 custom:hover:bg-white/10"
                )}
              >
                {p.label}
              </button>
            ))}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={fetchAnalytics}
            disabled={isLoading}
            aria-label="Refresh metrics"
          >
            <RefreshCw className={clsx("w-3.5 h-3.5", isLoading && "animate-spin")} />
          </Button>
        </div>
      </div>

      {/* Date Horizon Callout with dd-mm-yyyy formatting */}
      {data && (
        <div className="flex items-center gap-2 text-xs font-mono text-neutral-500 dark:text-neutral-400 flex-wrap">
          <Calendar className="w-3.5 h-3.5 flex-shrink-0" />
          <span>
            Active Horizon: <span className="text-neutral-700 dark:text-neutral-300 font-semibold">{formatToDDMMYYYY(data.startDate)}</span> &mdash; <span className="text-neutral-700 dark:text-neutral-300 font-semibold">{formatToDDMMYYYY(data.endDate)}</span> (Anchor:{" "}
            <span className="text-neutral-700 dark:text-neutral-300 font-semibold">{formatToDDMMYYYY(data.anchorDate)}</span>)
          </span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Tasks"
          value={data?.totalTasks ?? 0}
          subtext="Volume scheduled in period"
        />
        <KpiCard
          label="Completed Tasks"
          value={data?.completedTasks ?? 0}
          subtext="Executed items"
          trend={{
            positive: true,
            text: `${data?.completionRate ?? 0}% completed`,
          }}
        />
        <KpiCard
          label="Completion Velocity"
          value={`${data?.completionRate ?? 0}%`}
          subtext="Overall efficiency"
        />
        <KpiCard
          label="Peak Productivity"
          value={data?.mostProductiveDay || "—"}
          subtext={
            data?.missedTasks ? `${data.missedTasks} tasks incomplete` : "Optimal velocity"
          }
        />
      </div>

      {/* Contextual Insights */}
      {data?.insights && <InsightBanner insights={data.insights} />}

      {/* Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Trend Bar Chart */}
        <div className="lg:col-span-8">
          <ProductivityTrend
            data={data?.trendData || []}
            period={period}
          />
        </div>

        {/* Priority Urgency Distribution */}
        <div className="lg:col-span-4">
          <PriorityDistribution
            data={
              data?.priorityBreakdown || {
                LOW: { total: 0, completed: 0 },
                MEDIUM: { total: 0, completed: 0 },
                HIGH: { total: 0, completed: 0 },
                URGENT: { total: 0, completed: 0 },
              }
            }
          />
        </div>
      </div>
    </div>
  );
}
