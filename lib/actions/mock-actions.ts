import { mockOperationalSnapshot } from "@/lib/mock-data/dashboard";
import { createAuditLogEntry, recordAuditEntry } from "@/lib/security/audit-log";
import { hasPermission, permissionMessage } from "@/lib/security/permissions";
import type {
  ActionContext,
  ActionLevel,
  ActionResult,
  ActionStatus,
  JarvisActionName,
  SafeAction,
  UserRole,
} from "@/lib/actions/action-types";

function makeResult(
  context: ActionContext,
  actionName: JarvisActionName,
  level: ActionLevel,
  summary: string,
  permissionRequired: UserRole[],
  payload?: unknown,
): ActionResult {
  const confirmationRequired = level === 3;
  const allowed = hasPermission(context.actorRole, permissionRequired);
  const blockedByReadOnly = context.readOnlyMode && level === 3;
  const status: ActionStatus = !allowed || blockedByReadOnly
    ? "blocked"
    : confirmationRequired
      ? "requires_approval"
      : level === 2
        ? "drafted"
        : "completed";
  const finalSummary = !allowed
    ? permissionMessage(actionName, permissionRequired)
    : blockedByReadOnly
      ? `${actionName} is blocked because read-only mode is enabled. Approval and live integration are required.`
      : summary;
  const baseResult = {
    actionName,
    level,
    status,
    dataLabel: "mock data" as const,
    confirmationRequired,
    permissionRequired,
    summary: finalSummary,
    payload,
  };
  const auditLogEntry = recordAuditEntry(createAuditLogEntry(baseResult));

  return { ...baseResult, auditLogEntry };
}

export const mockActions: SafeAction[] = [
  {
    name: "getTodayRevenue",
    level: 1,
    description: "Read mock revenue for today.",
    permissionRequired: ["customer"],
    confirmationRequired: false,
    async run(context) {
      return makeResult(context, "getTodayRevenue", 1, `Mock revenue is ${mockOperationalSnapshot.revenue}.`, ["customer"], {
        revenue: mockOperationalSnapshot.revenue,
      });
    },
  },
  {
    name: "getUpcomingJobs",
    level: 1,
    description: "Read mock upcoming jobs.",
    permissionRequired: ["cleaner"],
    confirmationRequired: false,
    async run(context) {
      return makeResult(context, "getUpcomingJobs", 1, `${mockOperationalSnapshot.upcomingJobs} mock jobs are upcoming.`, ["cleaner"]);
    },
  },
  {
    name: "getCleanerAvailability",
    level: 1,
    description: "Read mock cleaner availability.",
    permissionRequired: ["admin"],
    confirmationRequired: false,
    async run(context) {
      return makeResult(context, "getCleanerAvailability", 1, `${mockOperationalSnapshot.activeCleaners} cleaners are mock-active.`, ["admin"]);
    },
  },
  {
    name: "getUnreadMessages",
    level: 1,
    description: "Read mock unread message count.",
    permissionRequired: ["admin"],
    confirmationRequired: false,
    async run(context) {
      return makeResult(context, "getUnreadMessages", 1, "Mock inbox shows 7 unread customer messages.", ["admin"]);
    },
  },
  {
    name: "summarizeDay",
    level: 1,
    description: "Summarize the mock day.",
    permissionRequired: ["customer"],
    confirmationRequired: false,
    async run(context) {
      return makeResult(
        context,
        "summarizeDay",
        1,
        `Mock summary: ${mockOperationalSnapshot.revenue} revenue, ${mockOperationalSnapshot.newBookings} bookings, ${mockOperationalSnapshot.missedCalls} missed calls.`,
        ["customer"],
        mockOperationalSnapshot,
      );
    },
  },
  ...(["draftCustomerText", "draftCleanerText", "draftEmail", "draftScheduleChange", "draftRefundRequest"] as JarvisActionName[]).map(
    (name) => ({
      name,
      level: 2 as const,
      description: `Prepare ${name} in draft-only mode.`,
      permissionRequired: ["admin"] as UserRole[],
      confirmationRequired: false,
      async run(context: ActionContext) {
        return makeResult(context, name, 2, `${name} prepared as mock draft. Nothing was sent or changed.`, ["admin"], {
          draft: context.command,
        });
      },
    }),
  ),
  ...(["sendText", "sendEmail", "issueRefund", "cancelBooking", "updateCleanerPay", "pushToGithub", "changePricing"] as JarvisActionName[]).map(
    (name) => ({
      name,
      level: 3 as const,
      description: `${name} requires approval and a real integration.`,
      permissionRequired: ["owner"] as UserRole[],
      confirmationRequired: true,
      async run(context: ActionContext) {
        return makeResult(context, name, 3, `${name} requires owner approval. Live integration is not connected.`, ["owner"]);
      },
    }),
  ),
];
