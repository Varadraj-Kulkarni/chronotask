import { describe, it, expect } from "vitest";
import { computeDayStatus } from "@/lib/dateUtils";

describe("Deliverable 2.2 & 8: Calendar Day Status Color System", () => {
  it("renders blue indicator (all_completed) when all tasks are completed", () => {
    const result = computeDayStatus(3, 3);
    expect(result.status).toBe("all_completed");
    expect(result.colorCode).toBe("blue");
    expect(result.label).toBe("All tasks completed");
  });

  it("renders amber indicator (partially_completed) when some tasks are completed", () => {
    const result = computeDayStatus(3, 1);
    expect(result.status).toBe("partially_completed");
    expect(result.colorCode).toBe("yellow");
    expect(result.label).toBe("Partially completed (1 of 3)");
  });

  it("renders red indicator (none_completed) when 0 of Y tasks are completed", () => {
    const result = computeDayStatus(3, 0);
    expect(result.status).toBe("none_completed");
    expect(result.colorCode).toBe("red");
    expect(result.label).toBe("Incomplete tasks (0 of 3)");
  });

  it("renders neutral gray indicator (no_tasks) when total tasks is 0", () => {
    const result = computeDayStatus(0, 0);
    expect(result.status).toBe("no_tasks");
    expect(result.colorCode).toBe("neutral");
    expect(result.label).toBe("No tasks scheduled");
  });
});
