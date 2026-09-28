import type { Metadata, Viewport } from "next";
import Link from "next/link";
import "./globals.css";
import { CalendarDays, CheckSquare, BarChart3 } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Logo } from "@/components/ui/Logo";
import { WallpaperBackdrop } from "@/components/ui/WallpaperBackdrop";

export const metadata: Metadata = {
  title: "ChronoTask — Calendar-Based Task Manager",
  description:
    "Precision calendar task manager with deliberate completion tracking & analytics.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#EAEBF0" },
    { media: "(prefers-color-scheme: dark)", color: "#09090b" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="dark">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const root = document.documentElement;
                root.classList.remove('dark', 'custom');
                if (theme === 'light') {
                  // Light theme active
                } else if (theme === 'custom') {
                  root.classList.add('custom');
                } else {
                  root.classList.add('dark');
                }
              } catch (e) {
                document.documentElement.classList.add('dark');
              }
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-[#EAEBF0] dark:bg-[#09090B] custom:bg-transparent text-neutral-900 dark:text-neutral-100 custom:text-white transition-colors duration-150 selection:bg-neutral-800 selection:text-white">
        {/* Wallpaper Layer for Custom Glass Mode */}
        <WallpaperBackdrop />

        {/* Editorial Top Navigation Header */}
        <header className="sticky top-0 z-40 bg-[#F5F6F8]/95 dark:bg-[#121214]/90 custom:bg-[#0D0D14]/75 backdrop-blur-xl border-b border-neutral-300/80 dark:border-neutral-800 custom:border-transparent transition-all duration-150 shadow-sm">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-2">
            <div className="flex items-center gap-3 sm:gap-6 min-w-0">
              {/* Brand with Modern Minimal Logo */}
              <Link href="/calendar" className="flex items-center gap-2 group flex-shrink-0">
                <Logo size="md" />
                <div className="flex flex-col">
                  <span className="font-semibold text-sm tracking-tight text-neutral-900 dark:text-neutral-100 custom:text-white leading-none group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    ChronoTask
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-mono text-neutral-500 dark:text-neutral-500 custom:text-neutral-400 leading-none mt-0.5">
                    Platform v1.0
                  </span>
                </div>
              </Link>

              {/* Navigation Links - Mobile Touch Optimized */}
              <nav className="flex items-center gap-0.5 sm:gap-1">
                <Link
                  href="/calendar"
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 custom:text-neutral-200 hover:text-neutral-900 dark:hover:text-white custom:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/80 custom:hover:bg-white/10 rounded-md transition-colors"
                >
                  <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden xs:inline sm:inline">Calendar</span>
                </Link>

                <Link
                  href="/tasks"
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 custom:text-neutral-200 hover:text-neutral-900 dark:hover:text-white custom:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/80 custom:hover:bg-white/10 rounded-md transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden xs:inline sm:inline">Tasks</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 custom:text-neutral-200 hover:text-neutral-900 dark:hover:text-white custom:hover:text-white hover:bg-neutral-200/60 dark:hover:bg-neutral-800/80 custom:hover:bg-white/10 rounded-md transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="hidden xs:inline sm:inline">Analytics</span>
                </Link>
              </nav>
            </div>

            {/* Right Status Indicator & Theme Toggle */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className="hidden md:flex items-center gap-2 px-2.5 py-1 bg-[#E4E6EB]/80 dark:bg-neutral-900 custom:bg-neutral-900/60 border border-neutral-300/80 dark:border-neutral-800 custom:border-transparent rounded text-[11px] font-mono text-neutral-600 dark:text-neutral-400 custom:text-neutral-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>IST UTC+5:30</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
