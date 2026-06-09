import { createAuditLogEntry, recordAuditEntry } from "@/lib/security/audit-log";
import { hasPermission, permissionMessage } from "@/lib/security/permissions";
import { getGithubRepoStatus, getStripeTodayRevenue, getSupabaseStatus, type LiveReadResult } from "@/lib/integrations/real-data";
import { formatRevenue, getCedarNeckDealGoal, getCleanzCrmGoal } from "@/lib/business/business-data";
import { getBusinessData } from "@/lib/business/data-store";
import { henryIvProfile } from "@/lib/profile/henry-profile";
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
  fallbackDataLabel: "mock data" | "real data" = "mock data",
) {
  return makeResult(context, actionName, 1, result.connected ? result.summary : fallbackSummary, ["customer"], result.payload ?? payload, result.connected ? result.dataLabel : fallbackDataLabel);
}

export const mockActions: SafeAction[] = [
  {
    name: "getTodayRevenue",
    level: 1,
    description: "Read entered revenue for today.",
    permissionRequired: ["customer"],
    confirmationRequired: false,
    async run(context) {
      const liveRevenue = await getStripeTodayRevenue();
      const businessData = await getBusinessData();

      return makeReadResult(
        context,
        "getTodayRevenue",
        liveRevenue,
        `Entered revenue is ${formatRevenue(businessData.revenue)}. Connect Stripe to automate payment reads.`,
        { revenue: businessData.revenue },
        "real data",
      );
    },
  },
  {
    name: "getUpcomingJobs",
    level: 1,
    description: "Read entered upcoming jobs.",
    permissionRequired: ["cleaner"],
    confirmationRequired: false,
    async run(context) {
      const supabase = await getSupabaseStatus();
      const businessData = await getBusinessData();

      return makeResult(
        context,
        "getUpcomingJobs",
        1,
        supabase.connected
          ? "Supabase is connected, but no bookings table is configured yet. Add SUPABASE_BOOKINGS_TABLE to enable live upcoming jobs."
          : `${businessData.upcomingJobs} entered jobs are upcoming. Connect Supabase for automated live bookings.`,
        ["cleaner"],
        supabase.payload ?? businessData,
        supabase.connected ? supabase.dataLabel : "real data",
      );
    },
  },
  {
    name: "getCleanerAvailability",
    level: 1,
    description: "Read entered cleaner availability.",
    permissionRequired: ["admin"],
    confirmationRequired: false,
    async run(context) {
      const supabase = await getSupabaseStatus();
      const businessData = await getBusinessData();

      return makeResult(
        context,
        "getCleanerAvailability",
        1,
        supabase.connected
          ? "Supabase is connected, but no cleaners table is configured yet. Add SUPABASE_CLEANERS_TABLE to enable live cleaner availability."
          : `${businessData.activeCleaners} active cleaners entered. ${businessData.cleanerAvailability}`,
        ["admin"],
        supabase.payload ?? businessData,
        supabase.connected ? supabase.dataLabel : "real data",
      );
    },
  },
  {
    name: "getUnreadMessages",
    level: 1,
    description: "Read unread message count.",
    permissionRequired: ["admin"],
    confirmationRequired: false,
    async run(context) {
      return makeResult(context, "getUnreadMessages", 1, "Live inbox is not connected yet. Add Gmail or Twilio credentials to read real unread messages.", ["admin"]);
    },
  },
  {
    name: "sourceRealEstateDeals",
    level: 1,
    description: "Prepare a Cedar Neck Realty acquisition sourcing brief for single-family and multifamily deals.",
    permissionRequired: ["admin"],
    confirmationRequired: false,
    async run(context) {
      const cedarNeck = henryIvProfile.businesses.find((business) => business.name === "Cedar Neck Realty");
      const businessData = await getBusinessData();
      const dealGoal = getCedarNeckDealGoal(businessData);

      return makeResult(
        context,
        "sourceRealEstateDeals",
        1,
        `Cedar Neck Realty acquisition mode is ready. ${dealGoal.completed}/${dealGoal.currentGoal} deals are logged for this monthly target. Source and rank single-family and multifamily opportunities by seller motivation, value-add potential, asking-price gap, rent upside, deferred maintenance, and follow-up urgency. Live property data is not connected yet.`,
        ["admin"],
        {
          business: cedarNeck,
          command: context.command,
          dealGoal,
          savedDeals: businessData.cedarNeckDeals,
          dealTypes: ["single-family", "multifamily"],
          sourcingLanes: ["off-market owner outreach", "broker follow-up", "distressed/value-add watchlist", "expired or stale listings", "referral pipeline"],
          qualificationChecklist: ["address", "unit count", "asking price or seller expectation", "rent roll", "expenses", "occupancy", "repairs", "seller motivation", "next follow-up"],
        },
      );
    },
  },
  {
    name: "reviewCleanzCrm",
    level: 1,
    description: "Review Cleanz sales CRM progress and next calls.",
    permissionRequired: ["admin"],
    confirmationRequired: false,
    async run(context) {
      const businessData = await getBusinessData();
      const crmGoal = getCleanzCrmGoal(businessData);
      const followUps = businessData.cleanzCrm.filter((company) => ["follow_up", "proposal"].includes(company.status));

      return makeResult(
        context,
        "reviewCleanzCrm",
        1,
        `Cleanz CRM has ${crmGoal.completed}/${crmGoal.currentGoal} companies logged for this monthly target. ${crmGoal.remaining} left before the goal steps to ${crmGoal.nextGoalAfterHit}. ${followUps.length} companies need follow-up or proposal attention.`,
        ["admin"],
        { crmGoal, companies: businessData.cleanzCrm, followUps },
        "real data",
      );
    },
  },
  {
    name: "reviewHealthOs",
    level: 1,
    description: "Review the owner's health operating system.",
    permissionRequired: ["customer"],
    confirmationRequired: false,
    async run(context) {
      const businessData = await getBusinessData();

      return makeResult(
        context,
        "reviewHealthOs",
        1,
        "Health OS loaded: keep food simple, protect mental clarity, move daily, train consistently, and review weekly. This is owner-entered local guidance, not medical advice.",
        ["customer"],
        { healthOs: businessData.healthOs },
        "real data",
      );
    },
  },
  {
    name: "draftAcquisitionOutreach",
    level: 2,
    description: "Draft Cedar Neck Realty acquisition outreach without sending it.",
    permissionRequired: ["admin"],
    confirmationRequired: false,
    async run(context) {
      return makeResult(
        context,
        "draftAcquisitionOutreach",
        2,
        "Cedar Neck Realty acquisition outreach drafted locally. Nothing was sent. Use it for seller, owner, broker, or agent follow-up after reviewing the target property and offer strategy.",
        ["admin"],
        {
          draftPurpose: "real estate acquisition outreach",
          command: context.command,
          suggestedStructure: ["direct intro", "property-specific reason for outreach", "simple purchase interest", "request for call or property details", "clear Cedar Neck Realty sign-off"],
        },
      );
    },
  },
  {
    name: "summarizeDay",
    level: 1,
    description: "Summarize the entered day.",
    permissionRequired: ["customer"],
    confirmationRequired: false,
    async run(context) {
      const [revenue, supabase, github] = await Promise.all([getStripeTodayRevenue(), getSupabaseStatus(), getGithubRepoStatus()]);
      const businessData = await getBusinessData();
      const crmGoal = getCleanzCrmGoal(businessData);
      const dealGoal = getCedarNeckDealGoal(businessData);
      const realSources = [revenue, supabase, github].filter((item) => item.connected);

      return makeResult(
        context,
        "summarizeDay",
        1,
        realSources.length
          ? `Live summary sources connected: ${realSources.map((item) => item.summary).join(" ")}`
          : `Entered summary: ${formatRevenue(businessData.revenue)} revenue, ${businessData.newBookings} bookings, ${businessData.missedCalls} missed calls, ${businessData.newLeads} leads, ${businessData.upcomingJobs} upcoming jobs, Cleanz CRM ${crmGoal.completed}/${crmGoal.currentGoal}, and Cedar Neck deals ${dealGoal.completed}/${dealGoal.currentGoal}.`,
        ["customer"],
        { entered: businessData, live: realSources.map((item) => item.payload), goals: { cleanz: crmGoal, cedarNeck: dealGoal } },
        "real data",
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
        return makeResult(context, name, 2, `${name} prepared as a local draft. Nothing was sent or changed.`, ["admin"], {
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
