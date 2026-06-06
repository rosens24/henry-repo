import { ArrowUpRight, Minus, Sparkles } from "lucide-react";
import type { DashboardMetric } from "@/lib/ai/types";

type StatCardProps = {
  metric: DashboardMetric;
};

export function StatCard({ metric }: StatCardProps) {
  return (
    <article className="data-rail rounded-md border border-yellow-300/15 bg-black/48 p-3">
      <div className="flex items-start justify-between gap-3">
        <span className="servo-pulse flex size-9 shrink-0 items-center justify-center rounded-md border border-yellow-300/25 bg-yellow-300/10 text-yellow-100">
          <Sparkles className="size-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="hud-title">{metric.label}</p>
          <p className="machine-text mt-1 text-xl font-semibold text-yellow-50">{metric.value}</p>
        </div>
        <span className="rounded-md border border-zinc-100/20 bg-zinc-100/10 p-1.5 text-zinc-200">
          {metric.trend === "flat" ? <Minus className="size-4" /> : <ArrowUpRight className="size-4" />}
        </span>
      </div>
      <div className="mt-3 flex h-7 items-end gap-1">
        {[28, 34, 24, 46, 42, 58, 49, 66, 71, 84].map((height, index) => (
          <span
            key={`${metric.id}-${index}`}
            className="flex-1 rounded-t bg-gradient-to-t from-yellow-500/40 to-zinc-100/80 shadow-[0_0_8px_rgba(250,204,21,0.32)]"
            style={{ height: `${Math.max(12, (height * metric.intensity) / 100)}%` }}
          />
        ))}
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-zinc-900/90">
        <div
          className="h-full rounded-full bg-gradient-to-r from-yellow-300 via-zinc-100 to-zinc-300"
          style={{ width: `${metric.intensity}%` }}
        />
      </div>
      <p className="mt-2 text-xs text-zinc-400">{metric.detail}</p>
    </article>
  );
}
