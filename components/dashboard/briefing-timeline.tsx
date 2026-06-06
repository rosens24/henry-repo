import { getDailyBriefings } from "@/lib/agent/briefing-generator";

export function BriefingTimeline() {
  return (
    <section className="glass-panel control-room-panel mt-4 w-full max-w-3xl rounded-lg p-4">
      <div className="relative z-10">
        <h2 className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-100">Daily Briefing Timeline</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {getDailyBriefings().map((briefing) => (
            <article key={briefing.id} className="rounded-lg border border-cyan-300/20 bg-slate-950/45 p-3">
              <p className="text-xs uppercase tracking-[0.18em] text-fuchsia-100">{briefing.scheduledFor}</p>
              <p className="mt-2 text-sm font-semibold text-white">{briefing.title}</p>
              <p className="mt-2 text-xs text-slate-400">
                {briefing.revenue} revenue, {briefing.newBookings} bookings, {briefing.missedCalls} missed calls. Mock data.
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
