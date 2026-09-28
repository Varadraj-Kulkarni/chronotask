"use client";

import React, { useEffect, useState, useRef } from "react";
import { Sun, Moon, Sparkles, Image as ImageIcon, RotateCcw, X, SlidersHorizontal, Check } from "lucide-react";
import {
  ThemeMode,
  getStoredTheme,
  applyTheme,
  getStoredWallpaper,
  setStoredWallpaper,
  DEFAULT_WALLPAPER,
  getStoredGlassTint,
  setStoredGlassTint,
  compressImage,
} from "@/lib/theme";
import { clsx } from "clsx";

export function ThemeToggle() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [mounted, setMounted] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [currentWallpaper, setCurrentWallpaper] = useState("");
  const [currentTint, setCurrentTint] = useState(50);
  const [isUploading, setIsUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const active = getStoredTheme();
    setTheme(active);
    setCurrentWallpaper(getStoredWallpaper());
    setCurrentTint(getStoredGlassTint());

    // Sync on external events
    const handleThemeEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: ThemeMode }>;
      if (customEvent.detail?.theme) setTheme(customEvent.detail.theme);
    };
    const handleWallpaperEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ wallpaper: string }>;
      if (customEvent.detail?.wallpaper) setCurrentWallpaper(customEvent.detail.wallpaper);
    };

    window.addEventListener("theme-change", handleThemeEvent);
    window.addEventListener("wallpaper-change", handleWallpaperEvent);

    return () => {
      window.removeEventListener("theme-change", handleThemeEvent);
      window.removeEventListener("wallpaper-change", handleWallpaperEvent);
    };
  }, []);

  // Close settings popup when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowSettings(false);
      }
    };
    if (showSettings) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showSettings]);

  const handleSelectTheme = (newTheme: ThemeMode) => {
    setTheme(newTheme);
    applyTheme(newTheme);
    if (newTheme === "custom") {
      setShowSettings(true);
    } else {
      setShowSettings(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const compressed = await compressImage(file);
      setStoredWallpaper(compressed);
      setCurrentWallpaper(compressed);
    } catch (err) {
      console.error("Failed to process wallpaper:", err);
      alert("Failed to load image. Please select a PNG or JPG file.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleResetWallpaper = () => {
    setStoredWallpaper(DEFAULT_WALLPAPER);
    setCurrentWallpaper(DEFAULT_WALLPAPER);
  };

  const handleTintChange = (pct: number) => {
    setCurrentTint(pct);
    setStoredGlassTint(pct);
  };

  if (!mounted) {
    return (
      <div className="w-28 h-8 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-[#FAFBFD] dark:bg-neutral-900" />
    );
  }

  return (
    <div className="relative inline-flex items-center" ref={dropdownRef}>
      {/* 3-Way Segmented Theme Controller */}
      <div className="flex items-center p-0.5 rounded-lg border border-neutral-300/80 dark:border-neutral-800 custom:border-transparent bg-[#E4E6EB]/80 dark:bg-neutral-900/90 custom:bg-neutral-900/60 backdrop-blur-md shadow-sm">
        {/* Light Option */}
        <button
          type="button"
          onClick={() => handleSelectTheme("light")}
          title="Light Mode (Soft & Calm)"
          aria-label="Switch to Light theme"
          className={clsx(
            "p-1.5 rounded-md transition-all flex items-center justify-center min-w-[28px] min-h-[28px]",
            theme === "light"
              ? "bg-[#FAFBFD] text-neutral-900 shadow-sm font-semibold"
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          )}
        >
          <Sun className="w-3.5 h-3.5 text-amber-500" />
        </button>

        {/* Dark Option */}
        <button
          type="button"
          onClick={() => handleSelectTheme("dark")}
          title="Dark Mode (Neutral Charcoal)"
          aria-label="Switch to Dark theme"
          className={clsx(
            "p-1.5 rounded-md transition-all flex items-center justify-center min-w-[28px] min-h-[28px]",
            theme === "dark"
              ? "bg-[#1E1E24] text-white shadow-sm font-semibold"
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          )}
        >
          <Moon className="w-3.5 h-3.5 text-blue-400" />
        </button>

        {/* Custom Glass Option */}
        <button
          type="button"
          onClick={() => {
            if (theme === "custom") {
              setShowSettings((prev) => !prev);
            } else {
              handleSelectTheme("custom");
            }
          }}
          title="Custom Mode (Liquid Glass & Wallpaper)"
          aria-label="Switch to Custom Liquid Glass theme"
          className={clsx(
            "p-1.5 rounded-md transition-all flex items-center justify-center min-w-[28px] min-h-[28px] gap-1",
            theme === "custom"
              ? "bg-white/20 text-white shadow-sm font-semibold ring-1 ring-transparent"
              : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          )}
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
        </button>
      </div>

      {/* Hidden File Input for Wallpaper Upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png, image/jpeg, image/webp, image/jpg"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Custom Theme Settings Dropdown / Popover */}
      {showSettings && (
        <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-[#FAFBFD] dark:bg-[#121216] custom:bg-[#121218]/95 border border-neutral-300 dark:border-neutral-800 custom:border-transparent rounded-xl shadow-2xl backdrop-blur-2xl z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-neutral-200/80 dark:border-neutral-800 custom:border-transparent">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                Custom Glass Theme
              </h4>
            </div>
            <button
              type="button"
              onClick={() => setShowSettings(false)}
              className="text-neutral-400 hover:text-neutral-700 dark:hover:text-white p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Wallpaper Preview & Upload */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
              <span>Backdrop Wallpaper</span>
              {currentWallpaper !== DEFAULT_WALLPAPER && (
                <button
                  type="button"
                  onClick={handleResetWallpaper}
                  className="text-[10px] text-blue-500 hover:underline flex items-center gap-0.5"
                >
                  <RotateCcw className="w-2.5 h-2.5" /> Reset
                </button>
              )}
            </div>

            {/* Thumbnail */}
            <div
              className="w-full h-20 rounded-lg border border-neutral-300 dark:border-neutral-700 custom:border-transparent bg-cover bg-center relative overflow-hidden shadow-inner flex items-end p-2"
              style={{ backgroundImage: `url(${currentWallpaper})` }}
            >
              <div className="absolute inset-0 bg-black/30" />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="relative z-10 w-full py-1 px-2 rounded bg-white/85 dark:bg-black/75 hover:bg-white text-neutral-900 dark:text-white text-[11px] font-medium flex items-center justify-center gap-1.5 shadow backdrop-blur-sm transition-all"
              >
                <ImageIcon className="w-3 h-3 text-indigo-500" />
                <span>{isUploading ? "Uploading..." : "Upload Wallpaper"}</span>
              </button>
            </div>
          </div>

          {/* Adaptive Tint / Glass Intensity Selector */}
          <div className="mt-3.5 pt-3 border-t border-neutral-200/80 dark:border-neutral-800 custom:border-transparent space-y-2">
            <div className="flex items-center justify-between text-[11px] font-medium text-neutral-600 dark:text-neutral-300">
              <span className="flex items-center gap-1">
                <SlidersHorizontal className="w-3 h-3" />
                <span>Readability Tint</span>
              </span>
              <span className="font-mono text-[10px] text-neutral-500">{currentTint}%</span>
            </div>

            <div className="grid grid-cols-3 gap-1.5 text-center">
              {[
                { label: "Subtle", val: 35 },
                { label: "Balanced", val: 50 },
                { label: "High", val: 65 },
              ].map((opt) => (
                <button
                  key={opt.val}
                  type="button"
                  onClick={() => handleTintChange(opt.val)}
                  className={clsx(
                    "py-1 px-1.5 rounded text-[10px] font-medium transition-all",
                    currentTint === opt.val
                      ? "bg-indigo-600 text-white shadow-sm font-semibold"
                      : "bg-neutral-200/80 dark:bg-neutral-800/80 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-300/80"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
