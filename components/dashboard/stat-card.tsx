import { ArrowUpRight, Minus, Sparkles } from "lucide-react";
import type { DashboardMetric } from "@/lib/ai/types";

type StatCardProps = {
  metric: DashboardMetric;
};

export function StatCard({ metric }: StatCardProps) {
  return (
    <article className="data-rail rounded-md border border-cyan-300/15 bg-slate-950/48 p-3">
      <div className="flex items-start justify-between gap-3">
        <span className="servo-pulse flex size-9 shrink-0 items-center justify-center rounded-md border border-cyan-300/25 bg-cyan-300/10 text-cyan-100">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="hud-title">{metric.label}</p>
          <p className="machine-text mt-1 text-xl font-semibold text-cyan-50">{metric.value}</p>
        </div>
        <span className="rounded-md border border-emerald-300/20 bg-emerald-300/10 p-1.5 text-emerald-200">
          {metric.trend === "flat" ? <Minus className="size-4" /> : <ArrowUpRight className="size-4" />}
        </span>
      </div>
      <div className="mt-3 flex h-7 items-end gap-1">
        {[28, 34, 24, 46, 42, 58, 49, 66, 71, 84].map((height, index) => (
          <span
            key={`${metric.id}-${index}`}
            className="flex-1 rounded-t bg-gradient-to-t from-cyan-500/40 to-emerald-300/80 shadow-[0_0_8px_rgba(34,211,238,0.32)]"
            style={{ height: `${Math.max(12, (height * metric.intensity) / 100)}%` }}
          />
        ))}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-slate-800/90">
        <div
          className="h-full rounded-full bg-gradient-to-r from-cyan-300 via-emerald-300 to-fuchsia-300"
          style={{ width: `${metric.intensity}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-slate-400">{metric.detail}</p>
    </article>
  );
}
