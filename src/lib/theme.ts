export type ThemeMode = "light" | "dark" | "custom";

export const DEFAULT_WALLPAPER =
  "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=2000&q=80";

// Clean aesthetic offline SVG gradient landscape fallback if external image cannot be loaded
export const FALLBACK_WALLPAPER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1920" height="1080" viewBox="0 0 1920 1080">
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#0f172a"/>
          <stop offset="50%" stop-color="#1e293b"/>
          <stop offset="100%" stop-color="#334155"/>
        </linearGradient>
        <linearGradient id="mountains1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e1b4b" stop-opacity="0.8"/>
          <stop offset="100%" stop-color="#312e81" stop-opacity="0.9"/>
        </linearGradient>
        <linearGradient id="mountains2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#090d16"/>
          <stop offset="100%" stop-color="#111827"/>
        </linearGradient>
        <radialGradient id="glow" cx="50%" cy="35%" r="60%">
          <stop offset="0%" stop-color="#6366f1" stop-opacity="0.35"/>
          <stop offset="60%" stop-color="#4338ca" stop-opacity="0.1"/>
          <stop offset="100%" stop-color="#000000" stop-opacity="0"/>
        </radialGradient>
      </defs>
      <rect width="1920" height="1080" fill="url(#sky)"/>
      <rect width="1920" height="1080" fill="url(#glow)"/>
      <path d="M0,800 L300,550 L650,750 L1000,480 L1400,720 L1750,520 L1920,680 L1920,1080 L0,1080 Z" fill="url(#mountains1)"/>
      <path d="M0,890 L400,680 L800,880 L1200,640 L1600,850 L1920,730 L1920,1080 L0,1080 Z" fill="url(#mountains2)"/>
    </svg>
  `);

export function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "dark";
  const stored = localStorage.getItem("theme");
  if (stored === "light" || stored === "dark" || stored === "custom") {
    return stored;
  }
  return "dark"; // Dark is default
}

export function applyTheme(theme: ThemeMode) {
  if (typeof window === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("dark", "custom");

  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "custom") {
    root.classList.add("custom");
  }

  localStorage.setItem("theme", theme);
  window.dispatchEvent(new CustomEvent("theme-change", { detail: { theme } }));
}

export function getStoredWallpaper(): string {
  if (typeof window === "undefined") return DEFAULT_WALLPAPER;
  return localStorage.getItem("chronotask_wallpaper") || DEFAULT_WALLPAPER;
}

export function setStoredWallpaper(url: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("chronotask_wallpaper", url);
  window.dispatchEvent(new CustomEvent("wallpaper-change", { detail: { wallpaper: url } }));
}

export function getStoredGlassTint(): number {
  if (typeof window === "undefined") return 50; // 50% opacity default
  const val = localStorage.getItem("chronotask_glass_tint");
  return val ? parseInt(val, 10) : 50;
}

export function setStoredGlassTint(pct: number) {
  if (typeof window === "undefined") return;
  localStorage.setItem("chronotask_glass_tint", String(pct));
  window.dispatchEvent(new CustomEvent("glass-tint-change", { detail: { tint: pct } }));
}

/**
 * Resizes and compresses image to max 1920x1080 JPEG at 0.82 quality
 * Guarantees storage size ~150-300KB so it safely persists in localStorage.
 */
export function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.onload = (e) => {
      const img = new Image();
      img.onerror = () => reject(new Error("Failed to load image"));
      img.onload = () => {
        const maxWidth = 1920;
        const maxHeight = 1080;
        let width = img.width;
        let height = img.height;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(e.target?.result as string);
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);
        const compressed = canvas.toDataURL("image/jpeg", 0.82);
        resolve(compressed);
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
}
