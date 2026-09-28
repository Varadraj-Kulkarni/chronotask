"use client";

import React, { useEffect, useState } from "react";
import { getStoredTheme, getStoredWallpaper, getStoredGlassTint, ThemeMode } from "@/lib/theme";

export function WallpaperBackdrop() {
  const [theme, setTheme] = useState<ThemeMode>("dark");
  const [wallpaper, setWallpaper] = useState<string>("");
  const [tint, setTint] = useState<number>(50);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTheme(getStoredTheme());
    setWallpaper(getStoredWallpaper());
    setTint(getStoredGlassTint());

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: ThemeMode }>;
      if (customEvent.detail?.theme) {
        setTheme(customEvent.detail.theme);
      }
    };

    const handleWallpaperChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ wallpaper: string }>;
      if (customEvent.detail?.wallpaper) {
        setWallpaper(customEvent.detail.wallpaper);
      }
    };

    const handleTintChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ tint: number }>;
      if (typeof customEvent.detail?.tint === "number") {
        setTint(customEvent.detail.tint);
      }
    };

    window.addEventListener("theme-change", handleThemeChange);
    window.addEventListener("wallpaper-change", handleWallpaperChange);
    window.addEventListener("glass-tint-change", handleTintChange);

    return () => {
      window.removeEventListener("theme-change", handleThemeChange);
      window.removeEventListener("wallpaper-change", handleWallpaperChange);
      window.removeEventListener("glass-tint-change", handleTintChange);
    };
  }, []);

  if (!mounted || theme !== "custom") return null;

  const tintOpacity = tint / 100;

  return (
    <div
      aria-hidden="true"
      className="fixed inset-0 pointer-events-none -z-50 overflow-hidden transition-all duration-300"
    >
      {/* Base Wallpaper Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500 scale-105"
        style={{
          backgroundImage: `url(${wallpaper})`,
          filter: "brightness(0.95)",
        }}
      />

      {/* Adaptive Tint Overlay to guarantee razor-sharp content contrast */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          backgroundColor: `rgba(9, 9, 14, ${tintOpacity})`,
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
        }}
      />

      {/* Subtle Vignette Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/50" />
    </div>
  );
}
