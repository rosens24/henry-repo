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
        ? "bg-black saturate-75"
        : "bg-black";

  return (
    <div className={`jarvis-grid relative flex min-h-svh flex-col overflow-x-hidden text-zinc-100 ${themeClass}`}>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(250,204,21,0.18),transparent_30%),radial-gradient(circle_at_82%_58%,rgba(244,244,245,0.12),transparent_25%),linear-gradient(180deg,rgba(5,5,5,0.1),rgba(3,3,3,0.94))]" />
      <div className="relative z-10 flex min-h-svh flex-col">{children}</div>
    </div>
  );
}
