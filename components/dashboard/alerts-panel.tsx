import { TriangleAlert } from "lucide-react";
import type { AlertItem } from "@/lib/mock-data/dashboard";

type AlertsPanelProps = {
  alerts: AlertItem[];
};

export function AlertsPanel({ alerts }: AlertsPanelProps) {
  return (
    <section className="glass-panel rounded-lg p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-yellow-100">Alerts</h2>
      {alerts.length === 0 ? (
        <p className="mt-3 text-sm text-zinc-400">No mock alerts active.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {alerts.map((alert) => (
            <article key={alert.id} className="rounded-lg border border-amber-200/20 bg-amber-300/10 p-3">
              <p className="flex items-center gap-2 text-sm font-semibold text-amber-50">
                <TriangleAlert className="size-4" />
                {alert.title}
              </p>
              <p className="mt-1 text-xs text-amber-100/80">{alert.detail}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
