import { buildDailyBriefings, defaultBusinessData } from "@/lib/business/business-data";
import type { Briefing } from "@/lib/agent/types";

function createBriefing(period: Briefing["period"], title: string, scheduledFor: string): Briefing {
  return buildDailyBriefings(defaultBusinessData).find((briefing) => briefing.period === period) ?? {
    ...buildDailyBriefings(defaultBusinessData)[0],
    id: `briefing-${period}`,
    title,
    period,
    scheduledFor,
  };
}

export function generateMorningBriefing() {
  return createBriefing("morning", "Morning briefing", "7:30 AM");
}

export function generateMiddayBriefing() {
  return createBriefing("midday", "Midday operations check", "12:30 PM");
}

export function generateNightlyBriefing() {
  return createBriefing("nightly", "Nightly wrap-up", "8:30 PM");
}

export function getDailyBriefings() {
  return buildDailyBriefings(defaultBusinessData);
}

export function checkSystemHealth() {
  return {
    status: "ready",
    website: "online",
    api: "online",
    integrations: "not connected",
  };
}

export function scanForOpportunities() {
  return defaultBusinessData.opportunities.length ? defaultBusinessData.opportunities : ["Enter business data to generate opportunities"];
}

export function prepareApprovalQueue() {
  return ["sendText", "sendEmail", "issueRefund", "pushToGithub", "changePricing"];
}
