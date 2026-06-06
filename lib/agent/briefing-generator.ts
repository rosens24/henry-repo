import { mockOperationalSnapshot } from "@/lib/mock-data/dashboard";
import type { Briefing } from "@/lib/agent/types";

function createBriefing(period: Briefing["period"], title: string, scheduledFor: string): Briefing {
  return {
    id: `briefing-${period}`,
    title,
    period,
    scheduledFor,
    revenue: mockOperationalSnapshot.revenue,
    newBookings: mockOperationalSnapshot.newBookings,
    missedCalls: mockOperationalSnapshot.missedCalls,
    newLeads: mockOperationalSnapshot.newLeads,
    openCustomerIssues: 4,
    cleanerAvailability: `${mockOperationalSnapshot.activeCleaners} mock-active cleaners`,
    systemHealth: "Website/API mock health: nominal",
    completedTasks: ["Dashboard refresh dry-run", "Mock health check", "Approval queue prepared"],
    approvalNeeded: ["Twilio follow-up texts", "GitHub push", "Refund request review"],
    opportunities: ["Recover missed calls", "Offer recurring clean upgrade", "Fill afternoon cleaner capacity"],
    dataLabel: "mock data",
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
  return [generateMorningBriefing(), generateMiddayBriefing(), generateNightlyBriefing()];
}

export function checkSystemHealth() {
  return {
    status: "mock healthy",
    website: "mock online",
    api: "mock online",
    integrations: "not connected",
  };
}

export function scanForOpportunities() {
  return ["Recover 5 missed calls", "Convert 9 new leads", "Prepare tomorrow capacity plan"];
}

export function prepareApprovalQueue() {
  return ["sendText", "sendEmail", "issueRefund", "pushToGithub", "changePricing"];
}
