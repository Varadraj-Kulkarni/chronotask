import { describe, it, expect } from "vitest";
import {
  toCalendarDateString,
  parseCalendarDateString,
  getMonthGrid,
  getWeekRange,
  formatToDDMMYYYY,
  formatDateDisplay,
  getTodayDateString,
} from "@/lib/dateUtils";

describe("Deliverable 4.1: Strict Calendar Date Utilities", () => {
  it("formats local Date accurately to YYYY-MM-DD string without UTC shift", () => {
    const testDate = new Date(2026, 8, 1); // September is month index 8
    expect(toCalendarDateString(testDate)).toBe("2026-09-01");
  });

  it("parses calendar date string accurately", () => {
    const parsed = parseCalendarDateString("2026-09-01");
    expect(parsed.getFullYear()).toBe(2026);
    expect(parsed.getMonth()).toBe(8);
    expect(parsed.getDate()).toBe(1);
  });

  it("generates 7-column month grid containing all days in September 2026", () => {
    const grid = getMonthGrid(2026, 9);
    // Multiples of 7
    expect(grid.length % 7).toBe(0);
    // Must contain 2026-09-01 and 2026-09-30
    expect(grid.some((c) => c.dateStr === "2026-09-01" && c.isCurrentMonth)).toBe(true);
    expect(grid.some((c) => c.dateStr === "2026-09-30" && c.isCurrentMonth)).toBe(true);
  });

  it("computes standard Monday to Sunday week range correctly", () => {
    const week = getWeekRange("2026-09-01"); // Tuesday
    expect(week.days.length).toBe(7);
    expect(week.start).toBe("2026-08-31"); // Monday
    expect(week.end).toBe("2026-09-06"); // Sunday
  });

  it("formats dates strictly to dd-mm-yyyy representation", () => {
    expect(formatToDDMMYYYY("2026-09-02")).toBe("02-09-2026");
    expect(formatToDDMMYYYY("2026-12-31")).toBe("31-12-2026");
    expect(formatDateDisplay("2026-09-02", { short: true })).toBe("02-09-2026");
  });

  it("resolves today date string matching YYYY-MM-DD pattern", () => {
    const today = getTodayDateString();
    expect(today).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
