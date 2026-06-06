import { mockOperationalSnapshot } from "@/lib/mock-data/dashboard";
import { createAuditLogEntry, recordAuditEntry } from "@/lib/security/audit-log";
import { hasPermission, permissionMessage } from "@/lib/security/permissions";
import { getGithubRepoStatus, getStripeTodayRevenue, getSupabaseStatus, type LiveReadResult } from "@/lib/integrations/real-data";
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
  dataLabel: "mock data" | "real data" = "mock data",
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
    dataLabel,
    confirmationRequired,
    permissionRequired,
    summary: finalSummary,
    payload,
  };
  const auditLogEntry = recordAuditEntry(createAuditLogEntry(baseResult));

  return { ...baseResult, auditLogEntry };
}

function makeReadResult(
  context: ActionContext,
  actionName: JarvisActionName,
  result: LiveReadResult,
  fallbackSummary: string,
  payload?: unknown,
) {
  return makeResult(context, actionName, 1, result.connected ? result.summary : fallbackSummary, ["customer"], result.payload ?? payload, result.dataLabel);
}

export const mockActions: SafeAction[] = [
  {
    name: "getTodayRevenue",
    level: 1,
    description: "Read mock revenue for today.",
    permissionRequired: ["customer"],
    confirmationRequired: false,
    async run(context) {
      const liveRevenue = await getStripeTodayRevenue();

      return makeReadResult(context, "getTodayRevenue", liveRevenue, `Fallback local estimate is ${mockOperationalSnapshot.revenue}. Connect Stripe for live revenue.`, {
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
      const supabase = await getSupabaseStatus();

      return makeResult(
        context,
        "getUpcomingJobs",
        1,
        supabase.connected
          ? "Supabase is connected, but no bookings table is configured yet. Add SUPABASE_BOOKINGS_TABLE to enable live upcoming jobs."
          : `${mockOperationalSnapshot.upcomingJobs} local placeholder jobs are upcoming. Connect Supabase for live bookings.`,
        ["cleaner"],
        supabase.payload,
        supabase.dataLabel,
      );
    },
  },
  {
    name: "getCleanerAvailability",
    level: 1,
    description: "Read mock cleaner availability.",
    permissionRequired: ["admin"],
    confirmationRequired: false,
    async run(context) {
      const supabase = await getSupabaseStatus();

      return makeResult(
        context,
        "getCleanerAvailability",
        1,
        supabase.connected
          ? "Supabase is connected, but no cleaners table is configured yet. Add SUPABASE_CLEANERS_TABLE to enable live cleaner availability."
          : `${mockOperationalSnapshot.activeCleaners} local placeholder cleaners are active. Connect Supabase for live cleaner availability.`,
        ["admin"],
        supabase.payload,
        supabase.dataLabel,
      );
    },
  },
  {
    name: "getUnreadMessages",
    level: 1,
    description: "Read mock unread message count.",
    permissionRequired: ["admin"],
    confirmationRequired: false,
    async run(context) {
      return makeResult(context, "getUnreadMessages", 1, "Live inbox is not connected yet. Add Gmail or Twilio credentials to read real unread messages.", ["admin"]);
    },
  },
  {
    name: "summarizeDay",
    level: 1,
    description: "Summarize the mock day.",
    permissionRequired: ["customer"],
    confirmationRequired: false,
    async run(context) {
      const [revenue, supabase, github] = await Promise.all([getStripeTodayRevenue(), getSupabaseStatus(), getGithubRepoStatus()]);
      const realSources = [revenue, supabase, github].filter((item) => item.connected);

      return makeResult(
        context,
        "summarizeDay",
        1,
        realSources.length
          ? `Live summary sources connected: ${realSources.map((item) => item.summary).join(" ")}`
          : `Local fallback summary: ${mockOperationalSnapshot.revenue} estimated revenue, ${mockOperationalSnapshot.newBookings} bookings, ${mockOperationalSnapshot.missedCalls} missed calls. Connect Stripe/Supabase/Twilio for live operations.`,
        ["customer"],
        { fallback: mockOperationalSnapshot, live: realSources.map((item) => item.payload) },
        realSources.length ? "real data" : "mock data",
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
        const github = name === "pushToGithub" ? await getGithubRepoStatus() : null;

        return makeResult(
          context,
          name,
          3,
          github?.connected
            ? `${name} can target the connected GitHub repo, but execution is blocked until explicit owner approval.`
            : `${name} requires owner approval and a connected live integration.`,
          ["owner"],
          github?.payload,
          github?.dataLabel ?? "mock data",
        );
      },
    }),
  ),
];
