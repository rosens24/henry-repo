import { dangerousActions } from "@/lib/security/permissions";
import type { AutonomyLevel } from "@/lib/agent/types";
import type { JarvisActionName } from "@/lib/actions/action-types";

const safeFullAutoActions = new Set<JarvisActionName>([
  "getTodayRevenue",
  "getUpcomingJobs",
  "getCleanerAvailability",
  "getUnreadMessages",
  "summarizeDay",
]);

export function getAutonomyLevel(actionName: JarvisActionName): AutonomyLevel {
  if (safeFullAutoActions.has(actionName)) return "safe_full_auto";
  if (actionName.startsWith("draft")) return "draft_only";
  if (dangerousActions.has(actionName)) return "approval_required_execution";

  return "monitor_only";
}

export function canRunWithoutApproval(actionName: JarvisActionName) {
  const level = getAutonomyLevel(actionName);

  return level === "monitor_only" || level === "safe_full_auto" || level === "draft_only";
}

export function autonomyPolicySummary() {
  return [
    "Monitor-only: metrics, issue detection, summaries.",
    "Draft-only: texts, emails, replies, cleaner messages, code-change drafts.",
    "Approval-required: messages, refunds, bookings, pricing, calendar, GitHub.",
    "Safe full-auto: reports, refreshes, syncing placeholders, health checks, reminders, mock tests.",
    "Never autonomous: passwords, API keys, payments, refunds, deletes, customer/cleaner messages, email, pricing, code pushes.",
  ];
}
