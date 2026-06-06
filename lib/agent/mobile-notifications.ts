import type { Briefing } from "@/lib/agent/types";

export function queueMobileBriefingNotification(briefing: Briefing) {
  return {
    id: `mobile-${briefing.id}`,
    status: "mock queued",
    title: briefing.title,
    message: `${briefing.title} is ready. ${briefing.dataLabel}.`,
  };
}

export function queueApprovalNotification(actionName: string) {
  return {
    id: `approval-${actionName}`,
    status: "mock queued",
    title: "Approval needed",
    message: `${actionName} requires owner approval before execution.`,
  };
}
