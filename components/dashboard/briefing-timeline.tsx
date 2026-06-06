import type { Briefing } from "@/lib/agent/types";

export function BriefingTimeline({ briefings }: { briefings: Briefing[] }) {
  return (
    <section className="glass-panel control-room-panel mt-3 w-full max-w-2xl rounded-md p-3">
      <div className="relative z-10">
        <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-yellow-100">Daily Briefing Timeline</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {briefings.map((briefing) => (
            <article key={briefing.id} className="rounded-md border border-yellow-300/20 bg-black/45 p-2.5">
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-100">{briefing.scheduledFor}</p>
              <p className="mt-1.5 text-xs font-semibold text-white">{briefing.title}</p>
              <p className="mt-1.5 text-[11px] leading-4 text-zinc-400">
                {briefing.revenue} revenue, {briefing.newBookings} bookings, {briefing.missedCalls} missed calls. {briefing.dataLabel}.
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
