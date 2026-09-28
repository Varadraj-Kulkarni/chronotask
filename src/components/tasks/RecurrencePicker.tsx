import React from "react";
import { RecurrenceConfig, RecurrenceFrequency } from "@/lib/types";
import { clsx } from "clsx";

import { formatToDDMMYYYY } from "@/lib/dateUtils";

export interface RecurrencePickerProps {
  value: RecurrenceConfig | null;
  onChange: (value: RecurrenceConfig | null) => void;
  startDate?: string;
}

export function RecurrencePicker({ value, onChange, startDate }: RecurrencePickerProps) {
  const isEnabled = value !== null;

  const handleToggle = (enabled: boolean) => {
    if (enabled) {
      onChange({
        frequency: "DAILY",
        interval: 1,
        byWeekdays: null,
        untilDate: null,
      });
    } else {
      onChange(null);
    }
  };

  const handleFrequencyChange = (freq: RecurrenceFrequency) => {
    if (!value) return;
    onChange({
      ...value,
      frequency: freq,
      byWeekdays: freq === "WEEKLY" ? [1, 2, 3, 4, 5] : null,
    });
  };

  const handleIntervalChange = (val: number) => {
    if (!value) return;
    onChange({
      ...value,
      interval: Math.max(1, val || 1),
    });
  };

  const handleWeekdayToggle = (dayNum: number) => {
    if (!value || value.frequency !== "WEEKLY") return;
    const current = value.byWeekdays || [];
    const updated = current.includes(dayNum)
      ? current.filter((d) => d !== dayNum)
      : [...current, dayNum].sort();
    onChange({
      ...value,
      byWeekdays: updated.length > 0 ? updated : [dayNum],
    });
  };

  const weekdays = [
    { label: "M", value: 1 },
    { label: "T", value: 2 },
    { label: "W", value: 3 },
    { label: "T", value: 4 },
    { label: "F", value: 5 },
    { label: "S", value: 6 },
    { label: "S", value: 7 },
  ];

  return (
    <div className="border border-neutral-300/80 dark:border-neutral-800 custom:border-transparent rounded-md p-3 bg-[#EAEBF0]/60 dark:bg-neutral-800/40 custom:bg-black/30 space-y-3 text-neutral-900 dark:text-neutral-100 custom:text-white">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-800 dark:text-neutral-200 custom:text-white">Repeat schedule</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-8 h-4 bg-neutral-300 dark:bg-neutral-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 dark:after:border-neutral-600 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-neutral-900 dark:peer-checked:bg-blue-600" />
        </label>
      </div>

      {isEnabled && value && (
        <div className="space-y-3 pt-2 border-t border-neutral-300/80 dark:border-neutral-700 custom:border-transparent text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 custom:text-neutral-300 mb-1">Frequency</label>
              <select
                value={value.frequency}
                onChange={(e) => handleFrequencyChange(e.target.value as RecurrenceFrequency)}
                className="w-full h-7 px-2 border border-neutral-300 dark:border-neutral-700 custom:border-transparent rounded text-xs bg-[#FAFBFD] dark:bg-neutral-800 custom:bg-[#0A0A0E]/90 text-neutral-900 dark:text-neutral-100 custom:text-white focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKDAYS">Weekdays (Mon-Fri)</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 custom:text-neutral-300 mb-1">Every (Interval)</label>
              <input
                type="number"
                min="1"
                max="99"
                value={value.interval}
                onChange={(e) => handleIntervalChange(parseInt(e.target.value, 10))}
                className="w-full h-7 px-2 border border-neutral-300 dark:border-neutral-700 custom:border-transparent rounded text-xs bg-[#FAFBFD] dark:bg-neutral-800 custom:bg-[#0A0A0E]/90 text-neutral-900 dark:text-neutral-100 custom:text-white font-mono focus:outline-none focus:ring-1 focus:ring-neutral-900 dark:focus:ring-neutral-400"
              />
            </div>
          </div>

          {value.frequency === "WEEKLY" && (
            <div>
              <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 custom:text-neutral-300 mb-1">Days of week</label>
              <div className="flex gap-1">
                {weekdays.map((d) => {
                  const active = value.byWeekdays?.includes(d.value);
                  return (
                    <button
                      key={d.value}
                      type="button"
                      onClick={() => handleWeekdayToggle(d.value)}
                      className={clsx(
                        "w-6 h-6 rounded text-[11px] font-mono font-medium border flex items-center justify-center transition-colors",
                        active
                          ? "bg-neutral-900 dark:bg-neutral-100 custom:bg-white text-white dark:text-neutral-900 custom:text-neutral-900 border-neutral-900 dark:border-neutral-100 font-semibold"
                          : "bg-[#FAFBFD] dark:bg-neutral-800 custom:bg-white/10 text-neutral-700 dark:text-neutral-300 custom:text-neutral-300 border-neutral-300 dark:border-neutral-700 custom:border-transparent hover:border-neutral-400 dark:hover:border-neutral-600"
                      )}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] text-neutral-600 dark:text-neutral-400 custom:text-neutral-300 mb-1">
              Until Date <span className="text-neutral-400 dark:text-neutral-500">(Optional)</span>
            </label>
            <input
              type="date"
              min={startDate}
              value={value.untilDate || ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  untilDate: e.target.value || null,
                })
              }
              className={clsx(
                "w-full h-7 px-2 border rounded text-xs bg-[#FAFBFD] dark:bg-neutral-800 custom:bg-[#0A0A0E]/90 text-neutral-900 dark:text-neutral-100 custom:text-white font-mono focus:outline-none focus:ring-1",
                value.untilDate && startDate && value.untilDate < startDate
                  ? "border-rose-500 focus:ring-rose-500"
                  : "border-neutral-300 dark:border-neutral-700 custom:border-transparent focus:ring-neutral-900 dark:focus:ring-neutral-400"
              )}
            />
            {value.untilDate && startDate && value.untilDate < startDate && (
              <p className="text-[11px] text-rose-500 dark:text-rose-400 mt-1 font-medium">
                Until date must be on or after the task date ({formatToDDMMYYYY(startDate)}).
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
