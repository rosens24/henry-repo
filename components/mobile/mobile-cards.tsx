import { getDailyBriefings } from "@/lib/agent/briefing-generator";
import { getScheduledAutomations } from "@/lib/agent/scheduler";
import { autonomyPolicySummary } from "@/lib/agent/autonomy-policy";
import { getBotConnectorStatuses } from "@/lib/bots/connectors";

export function MobileBriefingCards() {
  return (
    <>
      {getDailyBriefings().map((briefing) => (
        <article key={briefing.id} className="glass-panel rounded-lg p-4">
          <p className="text-xs uppercase tracking-[0.2em] text-yellow-100">{briefing.scheduledFor}</p>
          <h2 className="mt-2 text-xl font-semibold text-white">{briefing.title}</h2>
          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-zinc-300">
            <p>Revenue: {briefing.revenue}</p>
            <p>Bookings: {briefing.newBookings}</p>
            <p>Missed: {briefing.missedCalls}</p>
            <p>Leads: {briefing.newLeads}</p>
          </div>
          <p className="mt-3 text-sm text-zinc-400">{briefing.systemHealth}. {briefing.dataLabel}.</p>
        </article>
      ))}
    </>
  );
}

export function MobileApprovalQueue() {
  return (
    <section className="glass-panel rounded-lg p-4">
      <h2 className="text-lg font-semibold text-white">Approval queue</h2>
      {["sendText", "sendEmail", "issueRefund", "pushToGithub", "changePricing"].map((item) => (
        <div key={item} className="mt-3 rounded-lg border border-amber-200/25 bg-amber-300/10 p-3">
          <p className="font-semibold text-amber-50">{item}</p>
          <p className="mt-1 text-sm text-amber-100/80">Owner approval required. Mock mode only.</p>
        </div>
      ))}
    </section>
  );
}

export function MobileActionHistory() {
  return (
    <section className="glass-panel rounded-lg p-4">
      <h2 className="text-lg font-semibold text-white">Action history</h2>
      {getScheduledAutomations().map((job) => (
        <p key={job.id} className="mt-3 rounded-lg border border-yellow-300/15 bg-yellow-400/5 p-3 text-sm text-zinc-300">
          {job.name}: {job.status}
        </p>
      ))}
    </section>
  );
}

export function MobileSecurityPolicy() {
  return (
    <section className="glass-panel rounded-lg p-4">
      <h2 className="text-lg font-semibold text-white">Autonomy policy</h2>
      {autonomyPolicySummary().map((item) => (
        <p key={item} className="mt-2 text-sm text-zinc-300">{item}</p>
      ))}
    </section>
  );
}

export function MobileBotStatus() {
  return (
    <section className="glass-panel rounded-lg p-4">
      <h2 className="text-lg font-semibold text-white">Bot connectors</h2>
      {getBotConnectorStatuses().map((bot) => (
        <p key={bot.name} className="mt-2 text-sm text-zinc-300">{bot.name}: {bot.detail}</p>
      ))}
    </section>
  );
}
