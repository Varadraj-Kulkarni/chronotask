import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { CalendarDays, CheckSquare, BarChart3, Activity } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export const metadata: Metadata = {
  title: "ChronoTask — Calendar-Based Task Manager",
  description:
    "Restrained, technical, editorial calendar task manager inspired by Jane Street visual philosophy.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                const theme = localStorage.getItem('theme');
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (theme === 'dark' || (!theme && prefersDark)) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen flex flex-col antialiased bg-[#F8FAFC] dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">
        {/* Editorial Top Navigation Header */}
        <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 transition-colors duration-150">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <div className="flex items-center gap-6">
              {/* Brand */}
              <Link href="/calendar" className="flex items-center gap-2 group">
                <div className="w-7 h-7 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded flex items-center justify-center font-mono font-bold text-xs shadow-sm">
                  CT
                </div>
                <div className="flex flex-col">
                  <span className="font-semibold text-sm tracking-tight text-slate-900 dark:text-slate-100 leading-none">
                    ChronoTask
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 leading-none mt-0.5">
                    Platform v1.0.0
                  </span>
                </div>
              </Link>

              {/* Navigation Links */}
              <nav className="flex items-center gap-1">
                <Link
                  href="/calendar"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>Calendar</span>
                </Link>

                <Link
                  href="/tasks"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Tasks</span>
                </Link>

                <Link
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Analytics</span>
                </Link>
              </nav>
            </div>

            {/* Right Status Indicator & Theme Toggle */}
            <div className="flex items-center gap-2.5">
              <div className="hidden sm:flex items-center gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-mono text-slate-600 dark:text-slate-300">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span>SPEC v1.0.0 ACTIVE</span>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>
      </body>
    </html>
  );
}
