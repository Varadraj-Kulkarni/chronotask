import { describe, it, expect } from "vitest";
import { CreateTaskSchema, RescheduleTaskSchema } from "@/lib/validations/tasks";
import { computeAnalytics } from "@/lib/analytics";

describe("Requirement 1: Repeat Schedule Until Date Validation", () => {
  it("rejects untilDate that falls before the task start date", () => {
    const invalidPayload = {
      title: "Team Meeting",
      date: "2026-09-10",
      recurrenceConfig: {
        frequency: "DAILY",
        interval: 1,
        untilDate: "2026-09-08", // Before task start date!
      },
    };

    const parsed = CreateTaskSchema.safeParse(invalidPayload);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      expect(issue.message).toBe("Until date must be on or after the task date.");
    }
  });

  it("accepts untilDate that is on the exact same date as the task start date", () => {
    const validPayload = {
      title: "One-day recurrence check",
      date: "2026-09-10",
      recurrenceConfig: {
        frequency: "DAILY",
        interval: 1,
        untilDate: "2026-09-10",
      },
    };

    const parsed = CreateTaskSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
  });

  it("accepts untilDate that is strictly after the task start date", () => {
    const validPayload = {
      title: "Weekly Sync",
      date: "2026-09-10",
      recurrenceConfig: {
        frequency: "WEEKLY",
        interval: 1,
        untilDate: "2026-09-30",
      },
    };

    const parsed = CreateTaskSchema.safeParse(validPayload);
    expect(parsed.success).toBe(true);
  });
});

describe("Requirement 3 & 4 & 5: Postpone and Prepone Schema Validation", () => {
  it("validates RescheduleTaskSchema actionTypes correctly", () => {
    expect(
      RescheduleTaskSchema.safeParse({
        newDate: "2026-09-15",
        actionType: "POSTPONE",
      }).success
    ).toBe(true);

    expect(
      RescheduleTaskSchema.safeParse({
        newDate: "2026-09-15",
        actionType: "PREPONE",
      }).success
    ).toBe(true);

    expect(
      RescheduleTaskSchema.safeParse({
        newDate: "2026-09-15",
        actionType: "INVALID_ACTION",
      }).success
    ).toBe(false);
  });

  it("rejects malformed date in reschedule schema", () => {
    const res = RescheduleTaskSchema.safeParse({
      newDate: "15-09-2026", // Not YYYY-MM-DD
      actionType: "POSTPONE",
    });
    expect(res.success).toBe(false);
  });
});

describe("Requirement 2: Expanded Dashboard Analytics Computations", () => {
  it("computes completionRate and pending for intervals without dividing by zero", () => {
    const mockTasks = [
      {
        id: "t1",
        title: "Task 1",
        date: "2026-09-01",
        completed: true,
        completedAt: new Date("2026-09-01T10:00:00Z"),
        priority: "HIGH",
      },
      {
        id: "t2",
        title: "Task 2",
        date: "2026-09-01",
        completed: false,
        completedAt: null,
        priority: "MEDIUM",
      },
    ];

    const result = computeAnalytics("weekly", "2026-09-01", mockTasks);
    expect(result.trendData.length).toBe(7);

    // Tuesday 2026-09-01 (index 1 of Monday-Sunday week)
    const tue = result.trendData.find((d) => d.date === "2026-09-01");
    expect(tue).toBeDefined();
    expect(tue?.total).toBe(2);
    expect(tue?.completed).toBe(1);
    expect(tue?.completionRate).toBe(50);
    expect(tue?.pending).toBe(1);

    // Empty day (e.g. Wednesday 2026-09-02)
    const wed = result.trendData.find((d) => d.date === "2026-09-02");
    expect(wed).toBeDefined();
    expect(wed?.total).toBe(0);
    expect(wed?.completed).toBe(0);
    expect(wed?.completionRate).toBe(0);
    expect(wed?.pending).toBe(0);
  });
});
