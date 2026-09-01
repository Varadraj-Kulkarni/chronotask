import React from "react";
import { RecurrenceConfig, RecurrenceFrequency } from "@/lib/types";
import { clsx } from "clsx";

export interface RecurrencePickerProps {
  value: RecurrenceConfig | null;
  onChange: (value: RecurrenceConfig | null) => void;
}

export function RecurrencePicker({ value, onChange }: RecurrencePickerProps) {
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
    <div className="border border-slate-200 dark:border-slate-800 rounded-md p-3 bg-slate-50/50 dark:bg-slate-800/40 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-slate-800 dark:text-slate-200">Repeat schedule</span>
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={isEnabled}
            onChange={(e) => handleToggle(e.target.checked)}
            className="sr-only peer"
          />
          <div className="w-8 h-4 bg-slate-200 dark:bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 dark:after:border-slate-600 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-slate-900 dark:peer-checked:bg-blue-600" />
        </label>
      </div>

      {isEnabled && value && (
        <div className="space-y-3 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Frequency</label>
              <select
                value={value.frequency}
                onChange={(e) => handleFrequencyChange(e.target.value as RecurrenceFrequency)}
                className="w-full h-7 px-2 border border-slate-300 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400"
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKDAYS">Weekdays (Mon-Fri)</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Every (Interval)</label>
              <input
                type="number"
                min="1"
                max="99"
                value={value.interval}
                onChange={(e) => handleIntervalChange(parseInt(e.target.value, 10))}
                className="w-full h-7 px-2 border border-slate-300 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400"
              />
            </div>
          </div>

          {value.frequency === "WEEKLY" && (
            <div>
              <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">Days of week</label>
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
                          ? "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 border-slate-900 dark:border-slate-100"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
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
            <label className="block text-[11px] text-slate-500 dark:text-slate-400 mb-1">
              Until Date <span className="text-slate-400 dark:text-slate-500">(Optional)</span>
            </label>
            <input
              type="date"
              value={value.untilDate || ""}
              onChange={(e) =>
                onChange({
                  ...value,
                  untilDate: e.target.value || null,
                })
              }
              className="w-full h-7 px-2 border border-slate-300 dark:border-slate-700 rounded text-xs bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-mono focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400"
            />
          </div>
        </div>
      )}
    </div>
  );
}
