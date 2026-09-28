"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
} from "recharts";
import { TrendDataItem } from "@/lib/types";
import { formatToDDMMYYYY } from "@/lib/dateUtils";
import { clsx } from "clsx";
import { BarChart3, LineChart as LineChartIcon, Activity, CheckCheck, AlertCircle, ChevronLeft, ChevronRight } from "lucide-react";

export type AnalyticsGraphType =
  | "TREND"
  | "RATE"
  | "VOLUME"
  | "CREATED_VS_COMPLETED"
  | "INCOMPLETE";

export interface ProductivityTrendProps {
  data: (TrendDataItem & { completionRate?: number; pending?: number })[];
  period: string;
}

export function ProductivityTrend({ data, period }: ProductivityTrendProps) {
  const [selectedGraph, setSelectedGraph] = useState<AnalyticsGraphType>("TREND");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollBounds = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 6);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
    }
  }, []);

  useEffect(() => {
    checkScrollBounds();
    window.addEventListener("resize", checkScrollBounds);
    return () => window.removeEventListener("resize", checkScrollBounds);
  }, [checkScrollBounds]);

  useEffect(() => {
    if (activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        inline: "center",
        block: "nearest",
      });
    }
    checkScrollBounds();
  }, [selectedGraph, checkScrollBounds]);

  const scrollByAmount = (offset: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: offset, behavior: "smooth" });
      setTimeout(checkScrollBounds, 250);
    }
  };

  // Enrich data if completionRate or pending are not present
  const enrichedData = data.map((d) => {
    const total = d.total || 0;
    const completed = d.completed || 0;
    const rate = d.completionRate !== undefined ? d.completionRate : total > 0 ? Math.round((completed / total) * 100) : 0;
    const pending = d.pending !== undefined ? d.pending : Math.max(0, total - completed);
    return {
      ...d,
      total,
      completed,
      completionRate: rate,
      pending,
    };
  });

  const graphOptions: {
    id: AnalyticsGraphType;
    label: string;
    icon: React.ReactNode;
    description: string;
  }[] = [
    {
      id: "TREND",
      label: "Completion Trend",
      icon: <BarChart3 className="w-3.5 h-3.5" />,
      description: `Completed vs Total volume across the ${period} timeframe`,
    },
    {
      id: "RATE",
      label: "Completion Rate (%)",
      icon: <LineChartIcon className="w-3.5 h-3.5" />,
      description: `Percentage efficiency trajectory over the ${period} timeline`,
    },
    {
      id: "VOLUME",
      label: "Completion Volume",
      icon: <CheckCheck className="w-3.5 h-3.5" />,
      description: `Cumulative delivered tasks completed throughout ${period}`,
    },
    {
      id: "CREATED_VS_COMPLETED",
      label: "Created vs Completed",
      icon: <Activity className="w-3.5 h-3.5" />,
      description: `Inflow of scheduled tasks compared directly with execution velocity`,
    },
    {
      id: "INCOMPLETE",
      label: "Incomplete Backlog",
      icon: <AlertCircle className="w-3.5 h-3.5" />,
      description: `Pending and overdue task backlog progression across the timeline`,
    },
  ];

  const currentOption = graphOptions.find((g) => g.id === selectedGraph) || graphOptions[0];

  return (
    <div className="bg-[#F5F6F8] dark:bg-[#121214] custom:bg-[#121218]/75 custom:backdrop-blur-xl border border-neutral-300/80 dark:border-neutral-800 custom:border-transparent rounded-xl p-3.5 sm:p-5 shadow-sm transition-all">
      {/* Header with Title and Segmented Metric Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4 pb-3 border-b border-neutral-300/70 dark:border-neutral-800/80 custom:border-transparent">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded bg-blue-100/70 dark:bg-blue-950/50 custom:bg-blue-900/40 text-blue-700 dark:text-blue-400 custom:text-blue-300">
              {currentOption.icon}
            </span>
            <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100 custom:text-white">
              {currentOption.label}
            </h3>
          </div>
          <p className="text-xs text-neutral-600 dark:text-neutral-400 custom:text-neutral-300 mt-0.5">
            {currentOption.description}
          </p>
        </div>

        {/* Multi-metric Segmented Control with Overflow Indicators & Smooth Scroll */}
        <div className="relative flex items-center max-w-full group/selector">
          {/* Left scroll indicator button */}
          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByAmount(-140)}
              aria-label="Scroll options left"
              className="absolute left-0 z-20 h-7 w-6 flex items-center justify-center bg-gradient-to-r from-neutral-200 via-neutral-200/90 to-transparent dark:from-neutral-900 dark:via-neutral-900/90 custom:from-black/90 custom:via-black/70 text-neutral-700 dark:text-neutral-300 custom:text-white rounded-l-lg hover:text-neutral-950 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}

          {/* Scrollable track */}
          <div
            ref={scrollContainerRef}
            onScroll={checkScrollBounds}
            className="flex items-center gap-1 p-1 bg-[#E4E6EB] dark:bg-neutral-900 custom:bg-black/60 border border-neutral-300 dark:border-neutral-800 custom:border-transparent rounded-lg overflow-x-auto no-scrollbar max-w-full scroll-smooth"
          >
            {graphOptions.map((opt) => {
              const active = selectedGraph === opt.id;
              return (
                <button
                  key={opt.id}
                  ref={active ? activeTabRef : null}
                  type="button"
                  onClick={() => setSelectedGraph(opt.id)}
                  className={clsx(
                    "flex items-center gap-1.5 px-3 py-1 text-xs rounded-md whitespace-nowrap transition-all touch-manipulation select-none",
                    active
                      ? "bg-[#FAFBFD] dark:bg-[#1e1e24] custom:bg-white/20 text-neutral-950 dark:text-white custom:text-white shadow font-semibold ring-1 ring-neutral-300 dark:ring-neutral-700 custom:ring-transparent"
                      : "text-neutral-600 dark:text-neutral-400 custom:text-neutral-300 hover:text-neutral-900 dark:hover:text-neutral-200 hover:bg-neutral-300/60 dark:hover:bg-neutral-800/60 custom:hover:bg-white/10 font-medium"
                  )}
                >
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Right scroll indicator button */}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByAmount(140)}
              aria-label="Scroll options right"
              className="absolute right-0 z-20 h-7 w-6 flex items-center justify-center bg-gradient-to-l from-neutral-200 via-neutral-200/90 to-transparent dark:from-neutral-900 dark:via-neutral-900/90 custom:from-black/90 custom:via-black/70 text-neutral-700 dark:text-neutral-300 custom:text-white rounded-r-lg hover:text-neutral-950 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Chart Visualization Area */}
      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {selectedGraph === "TREND" ? (
            /* 1. COMPLETION TREND: Vibrant Indigo + Emerald Dual Bars */
            <BarChart data={enrichedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="totalBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#818CF8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#4F46E5" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="completedBarGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#34D399" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#059669" stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#71717A" strokeOpacity={0.15} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: "#71717A", strokeOpacity: 0.25 }}
                tick={{ fill: "#71717A", fontSize: 10, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}
                tickFormatter={(val: string) => (val && val.includes("-") && val.length === 10 ? formatToDDMMYYYY(val).substring(0, 5) : val)}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: "#71717A", strokeOpacity: 0.25 }}
                tick={{ fill: "#71717A", fontSize: 10, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const displayLabel = label && label.includes("-") && label.length === 10 ? formatToDDMMYYYY(label) : label;
                    return (
                      <div className="bg-[#FAFBFD] dark:bg-neutral-900 custom:bg-[#0E0E14]/95 border border-neutral-300 dark:border-neutral-700 custom:border-transparent shadow-xl rounded-lg p-3 text-xs">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5">{displayLabel}</p>
                        <div className="space-y-1">
                          <p className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            Total Tasks: <span className="font-mono font-bold">{payload[0]?.value}</span>
                          </p>
                          <p className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Completed: <span className="font-mono font-bold">{payload[1]?.value}</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }} />
              <Bar dataKey="total" name="Total Tasks" fill="url(#totalBarGrad)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Completed" fill="url(#completedBarGrad)" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : selectedGraph === "RATE" ? (
            /* 2. COMPLETION RATE: Vibrant Emerald Glowing Line with Gradient Fill */
            <AreaChart data={enrichedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="rateAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10B981" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="#10B981" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#71717A" strokeOpacity={0.15} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: "#71717A", strokeOpacity: 0.25 }}
                tick={{ fill: "#71717A", fontSize: 10, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}
                tickFormatter={(val: string) => (val && val.includes("-") && val.length === 10 ? formatToDDMMYYYY(val).substring(0, 5) : val)}
              />
              <YAxis
                domain={[0, 100]}
                unit="%"
                tickLine={false}
                axisLine={{ stroke: "#71717A", strokeOpacity: 0.25 }}
                tick={{ fill: "#71717A", fontSize: 10, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}
              />
              <ReferenceLine y={100} stroke="#10B981" strokeDasharray="3 3" strokeOpacity={0.4} />
              <ReferenceLine y={50} stroke="#71717A" strokeDasharray="2 2" strokeOpacity={0.2} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0]?.payload;
                    const displayLabel = label && label.includes("-") && label.length === 10 ? formatToDDMMYYYY(label) : label;
                    return (
                      <div className="bg-[#FAFBFD] dark:bg-neutral-900 custom:bg-[#0E0E14]/95 border border-neutral-300 dark:border-neutral-700 custom:border-transparent shadow-xl rounded-lg p-3 text-xs">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{displayLabel}</p>
                        <p className="text-emerald-600 dark:text-emerald-400 font-bold text-sm">
                          {item?.completionRate}% Complete
                        </p>
                        <p className="text-[11px] text-neutral-500 dark:text-neutral-400 mt-1">
                          {item?.completed} of {item?.total} tasks delivered
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }} />
              <Area
                type="monotone"
                dataKey="completionRate"
                name="Completion Rate (%)"
                stroke="#10B981"
                strokeWidth={2.5}
                fill="url(#rateAreaGrad)"
                activeDot={{ r: 6, fill: "#059669", stroke: "#ECFDF5", strokeWidth: 2 }}
              />
            </AreaChart>
          ) : selectedGraph === "VOLUME" ? (
            /* 3. COMPLETION VOLUME: Vibrant Cyan & Blue Gradient Area Chart */
            <AreaChart data={enrichedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="volumeAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#06B6D4" stopOpacity={0.6} />
                  <stop offset="50%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#71717A" strokeOpacity={0.15} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: "#71717A", strokeOpacity: 0.25 }}
                tick={{ fill: "#71717A", fontSize: 10, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}
                tickFormatter={(val: string) => (val && val.includes("-") && val.length === 10 ? formatToDDMMYYYY(val).substring(0, 5) : val)}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: "#71717A", strokeOpacity: 0.25 }}
                tick={{ fill: "#71717A", fontSize: 10, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const displayLabel = label && label.includes("-") && label.length === 10 ? formatToDDMMYYYY(label) : label;
                    return (
                      <div className="bg-[#FAFBFD] dark:bg-neutral-900 custom:bg-[#0E0E14]/95 border border-neutral-300 dark:border-neutral-700 custom:border-transparent shadow-xl rounded-lg p-3 text-xs">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{displayLabel}</p>
                        <p className="text-cyan-600 dark:text-cyan-400 font-bold text-sm">
                          {payload[0]?.value} Tasks Executed
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }} />
              <Area
                type="monotone"
                dataKey="completed"
                name="Delivered Volume"
                stroke="#06B6D4"
                strokeWidth={2.5}
                fill="url(#volumeAreaGrad)"
                activeDot={{ r: 6, fill: "#0891B2", stroke: "#CFFAFE", strokeWidth: 2 }}
              />
            </AreaChart>
          ) : selectedGraph === "CREATED_VS_COMPLETED" ? (
            /* 4. CREATED VS COMPLETED: Vibrant Sky Blue vs Vivid Emerald Double-Bar */
            <BarChart data={enrichedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="createdGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38BDF8" stopOpacity={0.9} />
                  <stop offset="100%" stopColor="#0284C7" stopOpacity={0.8} />
                </linearGradient>
                <linearGradient id="completedExecGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#4ADE80" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#16A34A" stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#71717A" strokeOpacity={0.15} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: "#71717A", strokeOpacity: 0.25 }}
                tick={{ fill: "#71717A", fontSize: 10, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}
                tickFormatter={(val: string) => (val && val.includes("-") && val.length === 10 ? formatToDDMMYYYY(val).substring(0, 5) : val)}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: "#71717A", strokeOpacity: 0.25 }}
                tick={{ fill: "#71717A", fontSize: 10, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const displayLabel = label && label.includes("-") && label.length === 10 ? formatToDDMMYYYY(label) : label;
                    return (
                      <div className="bg-[#FAFBFD] dark:bg-neutral-900 custom:bg-[#0E0E14]/95 border border-neutral-300 dark:border-neutral-700 custom:border-transparent shadow-xl rounded-lg p-3 text-xs">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1.5">{displayLabel}</p>
                        <div className="space-y-1">
                          <p className="flex items-center gap-2 text-sky-600 dark:text-sky-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-sky-500" />
                            Created/Due: <span className="font-mono font-bold">{payload[0]?.value}</span>
                          </p>
                          <p className="flex items-center gap-2 text-green-600 dark:text-green-400 font-medium">
                            <span className="w-2 h-2 rounded-full bg-green-500" />
                            Completed: <span className="font-mono font-bold">{payload[1]?.value}</span>
                          </p>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }} />
              <Bar dataKey="total" name="Scheduled Inflow" fill="url(#createdGrad)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Delivered Outflow" fill="url(#completedExecGrad)" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : (
            /* 5. INCOMPLETE / OVERDUE BACKLOG: Glowing Amber & Rose Warning Gradient */
            <BarChart data={enrichedData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="pendingGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FB7185" stopOpacity={0.95} />
                  <stop offset="100%" stopColor="#E11D48" stopOpacity={0.85} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#71717A" strokeOpacity={0.15} />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={{ stroke: "#71717A", strokeOpacity: 0.25 }}
                tick={{ fill: "#71717A", fontSize: 10, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}
                tickFormatter={(val: string) => (val && val.includes("-") && val.length === 10 ? formatToDDMMYYYY(val).substring(0, 5) : val)}
              />
              <YAxis
                tickLine={false}
                axisLine={{ stroke: "#71717A", strokeOpacity: 0.25 }}
                tick={{ fill: "#71717A", fontSize: 10, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }}
                allowDecimals={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const displayLabel = label && label.includes("-") && label.length === 10 ? formatToDDMMYYYY(label) : label;
                    return (
                      <div className="bg-[#FAFBFD] dark:bg-neutral-900 custom:bg-[#0E0E14]/95 border border-neutral-300 dark:border-neutral-700 custom:border-transparent shadow-xl rounded-lg p-3 text-xs">
                        <p className="font-semibold text-neutral-900 dark:text-neutral-100 mb-1">{displayLabel}</p>
                        <p className="text-rose-600 dark:text-rose-400 font-bold text-sm">
                          {payload[0]?.value} Pending / Overdue
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10, fontFamily: "'SF Pro Display', -apple-system, sans-serif" }} />
              <Bar dataKey="pending" name="Pending / Overdue Items" fill="url(#pendingGrad)" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
