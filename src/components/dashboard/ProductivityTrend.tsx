import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { TrendDataItem } from "@/lib/types";
import { formatToDDMMYYYY } from "@/lib/dateUtils";

export interface ProductivityTrendProps {
  data: TrendDataItem[];
  period: string;
}

export function ProductivityTrend({ data, period }: ProductivityTrendProps) {
  return (
    <div className="bg-[#FAFAF9] dark:bg-[#121214] border border-neutral-200/90 dark:border-neutral-800 rounded-lg p-3.5 sm:p-5 shadow-sm transition-colors">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">Completion Trend</h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400">
            Completed vs Total volume across the {period} timeframe
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#71717A" strokeOpacity={0.15} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "#71717A", strokeOpacity: 0.25 }}
              tick={{ fill: "#71717A", fontSize: 10, fontFamily: "Inter, -apple-system, sans-serif" }}
              tickFormatter={(val: string) => {
                if (val && val.includes("-") && val.length === 10) {
                  return formatToDDMMYYYY(val).substring(0, 5); // display dd-mm for compact mobile bar chart
                }
                return val;
              }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#71717A", strokeOpacity: 0.25 }}
              tick={{ fill: "#71717A", fontSize: 10, fontFamily: "Inter, -apple-system, sans-serif" }}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const displayLabel = label && label.includes("-") && label.length === 10 ? formatToDDMMYYYY(label) : label;
                  return (
                    <div className="bg-[#FAFAF9] dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 shadow-lg rounded-lg p-2.5 text-xs">
                      <p className="font-semibold text-neutral-800 dark:text-neutral-200 mb-1">{displayLabel}</p>
                      {payload.map((entry: any) => (
                        <p key={entry.dataKey} style={{ color: entry.color }}>
                          {entry.name}: {entry.value}
                        </p>
                      ))}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: 11, paddingTop: 10, fontFamily: "Inter, -apple-system, sans-serif" }}
              iconType="square"
              iconSize={8}
            />
            <Bar
              dataKey="total"
              name="Total Tasks"
              fill="#A1A1AA"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="completed"
              name="Completed"
              fill="#2563EB"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
