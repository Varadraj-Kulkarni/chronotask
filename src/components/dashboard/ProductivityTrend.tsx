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

export interface ProductivityTrendProps {
  data: TrendDataItem[];
  period: string;
}

export function ProductivityTrend({ data, period }: ProductivityTrendProps) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-md p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">Completion Trend</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Completed vs Total volume across the {period} timeframe
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94A3B8" strokeOpacity={0.2} />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={{ stroke: "#94A3B8", strokeOpacity: 0.3 }}
              tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "monospace" }}
            />
            <YAxis
              tickLine={false}
              axisLine={{ stroke: "#94A3B8", strokeOpacity: 0.3 }}
              tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "monospace" }}
              allowDecimals={false}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md rounded p-2 text-xs font-mono">
                      <p className="font-semibold text-slate-800 dark:text-slate-200 mb-1">{label}</p>
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
              wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
              iconType="square"
              iconSize={8}
            />
            <Bar
              dataKey="total"
              name="Total Tasks"
              fill="#94A3B8"
              radius={[2, 2, 0, 0]}
            />
            <Bar
              dataKey="completed"
              name="Completed"
              fill="#3B82F6"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
