// @vitest-environment jsdom
import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  getStoredTheme,
  applyTheme,
  getStoredWallpaper,
  setStoredWallpaper,
  getStoredGlassTint,
  setStoredGlassTint,
  DEFAULT_WALLPAPER,
  FALLBACK_WALLPAPER,
} from "@/lib/theme";

describe("Theme Management System", () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = "";
  });

  it("defaults to dark theme if nothing stored", () => {
    expect(getStoredTheme()).toBe("dark");
  });

  it("applies light theme properly", () => {
    applyTheme("light");
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(document.documentElement.classList.contains("custom")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("light");
    expect(getStoredTheme()).toBe("light");
  });

  it("applies dark theme properly", () => {
    applyTheme("dark");
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.documentElement.classList.contains("custom")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("dark");
    expect(getStoredTheme()).toBe("dark");
  });

  it("applies custom liquid glass theme properly", () => {
    applyTheme("custom");
    expect(document.documentElement.classList.contains("custom")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
    expect(localStorage.getItem("theme")).toBe("custom");
    expect(getStoredTheme()).toBe("custom");
  });

  it("persists wallpaper and allows changing and retrieving", () => {
    expect(getStoredWallpaper()).toBe(DEFAULT_WALLPAPER);
    const customUrl = "data:image/png;base64,samplecustomwallpaper";
    setStoredWallpaper(customUrl);
    expect(getStoredWallpaper()).toBe(customUrl);
  });

  it("persists glass tint percentage properly", () => {
    expect(getStoredGlassTint()).toBe(50);
    setStoredGlassTint(65);
    expect(getStoredGlassTint()).toBe(65);
  });
});
