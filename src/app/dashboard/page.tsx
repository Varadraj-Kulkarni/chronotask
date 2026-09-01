"use client";

import React, { useState, useEffect } from "react";
import { AnalyticsPeriod, AnalyticsSummaryResponse } from "@/lib/types";
import { api } from "@/lib/api";
import { toCalendarDateString, formatDateDisplay } from "@/lib/dateUtils";
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
    toCalendarDateString(new Date())
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
    <div className="space-y-6">
      {/* Header & Timescale Segmented Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Productivity Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Deterministic velocity metrics across multi-timescale horizons
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Segmented Control */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-md">
            {periods.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPeriod(p.id)}
                className={clsx(
                  "px-3 py-1 text-xs font-medium rounded transition-all",
                  period === p.id
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 shadow-sm font-semibold"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100"
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

      {/* Date Horizon Callout */}
      {data && (
        <div className="flex items-center gap-2 text-xs font-mono text-slate-500 dark:text-slate-400">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            Active Horizon: {data.startDate} &mdash; {data.endDate} (Anchor:{" "}
            {data.anchorDate})
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
