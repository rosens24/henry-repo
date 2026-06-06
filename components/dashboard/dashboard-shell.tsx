import type { ReactNode } from "react";
import type { DashboardTheme } from "@/components/dashboard/settings-panel";

type DashboardShellProps = {
  children: ReactNode;
  theme?: DashboardTheme;
};

export function DashboardShell({ children, theme = "neon" }: DashboardShellProps) {
  const themeClass =
    theme === "contrast"
      ? "bg-black contrast-125"
      : theme === "midnight"
        ? "bg-slate-950 saturate-75"
        : "bg-slate-950";

  return (
    <div className={`jarvis-grid relative flex min-h-screen flex-col overflow-hidden text-slate-100 ${themeClass}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(245,158,11,0.18),transparent_30%),radial-gradient(circle_at_82%_58%,rgba(59,130,246,0.13),transparent_25%),linear-gradient(180deg,rgba(5,5,7,0.1),rgba(5,5,7,0.94))]" />
      <div className="relative z-10 flex min-h-screen flex-col">{children}</div>
    </div>
  );
}
