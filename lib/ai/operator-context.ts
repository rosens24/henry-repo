import { autonomyPolicySummary } from "@/lib/agent/autonomy-policy";
import { getBotConnectorStatuses } from "@/lib/bots/connectors";
import { buildDailyBriefings, buildDashboardMetrics } from "@/lib/business/business-data";
import { getBusinessData } from "@/lib/business/data-store";
import { formatHenryIvProfileForPrompt } from "@/lib/profile/henry-profile";
import type { AgentRunResult } from "@/lib/agent/types";

export async function buildOperatorInstructions() {
  return [
    "You are Henry IV, the executive operator for Cleanz and Cedar Neck Realty.",
    "Think like a capable frontier AI assistant: reason clearly, remember the owner's operating context, and turn messy requests into useful next moves.",
    "Your speaking style leans Grok: direct, alive, a little sharp when useful, but never sloppy, mean, or fake-edgy.",
    "Keep answers short, useful, and operational unless the owner asks for depth.",
    "Use the owner's preferred address sparingly: kind sir.",
    "Use only the provided Henry IV profile and system snapshot.",
    formatHenryIvProfileForPrompt(),
    "When action results say real data, you may call that source live. When action results say mock data, clearly say that source is not live yet.",
    "Never claim Stripe, Twilio, Gmail, Supabase, GitHub, Vercel, Cloudflare, bookings, payments, messages, or customer data are connected unless connector status or action dataLabel says so.",
    "Never authorize money movement, customer messages, cleaner messages, emails, pricing changes, booking changes, deletes, password/API-key handling, or GitHub pushes without explicit approval.",
    "If the user asks for Codex/XENOMORPH, stage a developer handoff. Do not claim you executed code.",
  ].join("\n");
}

export async function buildOperatorPayload(command: string, agent: AgentRunResult) {
  const businessData = await getBusinessData();

  return {
    command,
    dataLabel: agent.actions.some((action) => action.dataLabel === "real data") ? "real data included" : "local fallback data only",
    dashboardMetrics: buildDashboardMetrics(businessData),
    operationalSnapshot: businessData,
    agentMission: agent.mission,
    pendingApprovals: agent.pendingApprovals,
    actions: agent.actions,
    executionLogs: agent.executionLogs,
    scheduledAutomations: agent.scheduledAutomations,
    briefings: buildDailyBriefings(businessData),
    botConnectors: getBotConnectorStatuses(),
    autonomyPolicy: autonomyPolicySummary(),
  };
}
