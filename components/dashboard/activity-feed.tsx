import type { ActivityItem } from "@/lib/mock-data/dashboard";

type ActivityFeedProps = {
  items: ActivityItem[];
};

export function ActivityFeed({ items }: ActivityFeedProps) {
  return (
    <section className="glass-panel rounded-lg p-4">
      <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">Activity</h2>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-slate-400">No mock activity yet.</p>
      ) : (
        <div className="mt-4 grid gap-3">
          {items.map((item) => (
            <article key={item.id} className="border-l border-cyan-300/30 pl-3">
              <p className="text-sm text-white">{item.title}</p>
              <p className="mt-1 text-xs text-slate-400">{item.time} - {item.detail}</p>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
