import type { ScheduledAutomation } from "@/lib/agent/types";

export function getScheduledAutomations(): ScheduledAutomation[] {
  return [
    {
      id: "schedule-morning-brief",
      name: "Morning operator brief",
      status: "placeholder",
      cadence: "Daily at 7:30 AM",
      requiresApproval: false,
    },
    {
      id: "schedule-midday-brief",
      name: "Midday operations check",
      status: "placeholder",
      cadence: "Daily at 12:30 PM",
      requiresApproval: false,
    },
    {
      id: "schedule-nightly-wrap",
      name: "Nightly wrap-up",
      status: "placeholder",
      cadence: "Daily at 8:30 PM",
      requiresApproval: false,
    },
    {
      id: "schedule-system-health",
      name: "System health check",
      status: "ready",
      cadence: "Every 30 minutes",
      requiresApproval: false,
    },
    {
      id: "schedule-opportunity-scan",
      name: "Opportunity scan",
      status: "placeholder",
      cadence: "Daily after nightly wrap",
      requiresApproval: false,
    },
    {
      id: "schedule-approval-queue",
      name: "Approval queue preparation",
      status: "ready",
      cadence: "On command and before each briefing",
      requiresApproval: false,
    },
    {
      id: "schedule-missed-call-review",
      name: "Missed call recovery review",
      status: "paused",
      cadence: "Every 2 hours",
      requiresApproval: true,
    },
    {
      id: "schedule-cleaner-capacity",
      name: "Cleaner capacity check",
      status: "placeholder",
      cadence: "Weekdays at 4:00 PM",
      requiresApproval: false,
    },
  ];
}
