import { describe, it, expect } from "vitest";
import { getMonthRange, getWeekRange, formatToDDMMYYYY } from "@/lib/dateUtils";
import { Task } from "@/lib/types";

describe("Tasks Date Horizons & Grouped Repetition Logic", () => {
  it("computes month range accurately for 30-day and 28-day months", () => {
    const sepRange = getMonthRange("2026-09-15");
    expect(sepRange.start).toBe("2026-09-01");
    expect(sepRange.end).toBe("2026-09-30");

    const febRange = getMonthRange("2026-02-10");
    expect(febRange.start).toBe("2026-02-01");
    expect(febRange.end).toBe("2026-02-28");
  });

  it("filters tasks within current week range correctly", () => {
    const week = getWeekRange("2026-09-02"); // Wednesday: 2026-08-31 to 2026-09-06
    const sampleTasks: Partial<Task>[] = [
      { id: "1", date: "2026-09-01", title: "In Week Task" },
      { id: "2", date: "2026-09-05", title: "Weekend Task" },
      { id: "3", date: "2026-09-08", title: "Next Week Task" },
      { id: "4", date: "2026-08-25", title: "Past Week Task" },
    ];

    const inWeek = sampleTasks.filter(
      (t) => t.date! >= week.start && t.date! <= week.end
    );
    expect(inWeek.length).toBe(2);
    expect(inWeek.map((t) => t.id)).toEqual(["1", "2"]);
  });

  it("groups repeated series into a unified range summary while preserving occurrence data", () => {
    const repeatedSeries: Task[] = [
      {
        id: "t1",
        userId: "u1",
        title: "Morning Exercise",
        description: "Cardio",
        date: "2026-09-01",
        completed: true,
        priority: "HIGH",
        recurrenceId: "rec-cardio",
        createdAt: "2026-09-01T00:00:00Z",
        updatedAt: "2026-09-01T00:00:00Z",
      },
      {
        id: "t2",
        userId: "u1",
        title: "Morning Exercise",
        description: "Cardio",
        date: "2026-09-03",
        completed: false,
        priority: "HIGH",
        recurrenceId: "rec-cardio",
        createdAt: "2026-09-01T00:00:00Z",
        updatedAt: "2026-09-01T00:00:00Z",
      },
      {
        id: "t3",
        userId: "u1",
        title: "Morning Exercise",
        description: "Cardio",
        date: "2026-09-05",
        completed: false,
        priority: "HIGH",
        recurrenceId: "rec-cardio",
        createdAt: "2026-09-01T00:00:00Z",
        updatedAt: "2026-09-01T00:00:00Z",
      },
    ];

    const sorted = [...repeatedSeries].sort((a, b) => a.date.localeCompare(b.date));
    const startFormatted = formatToDDMMYYYY(sorted[0].date);
    const endFormatted = formatToDDMMYYYY(sorted[sorted.length - 1].date);
    const rangeLabel = `Repeated: ${startFormatted} to ${endFormatted}`;

    expect(rangeLabel).toBe("Repeated: 01-09-2026 to 05-09-2026");

    const completed = sorted.filter((t) => t.completed).length;
    expect(completed).toBe(1);
    expect(sorted.length).toBe(3);
  });
});
