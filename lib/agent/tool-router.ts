import type { AgentCommandType, AgentToolRoute } from "@/lib/agent/types";
import type { JarvisActionName } from "@/lib/actions/action-types";

export function routeTool(command: string, type: AgentCommandType): AgentToolRoute {
  const normalized = command.toLowerCase();
  const actions = new Set<JarvisActionName>();

  if (normalized.includes("revenue")) actions.add("getTodayRevenue");
  if (normalized.includes("job") || normalized.includes("booking")) actions.add("getUpcomingJobs");
  if (normalized.includes("cleaner") || normalized.includes("availability")) actions.add("getCleanerAvailability");
  if (normalized.includes("message") || normalized.includes("inbox") || normalized.includes("calls")) actions.add("getUnreadMessages");
  if (normalized.includes("customer") && normalized.includes("text")) actions.add("draftCustomerText");
  if (normalized.includes("cleaner") && normalized.includes("text")) actions.add("draftCleanerText");
  if (normalized.includes("email")) actions.add("draftEmail");
  if (normalized.includes("schedule")) actions.add("draftScheduleChange");
  if (normalized.includes("refund")) actions.add(normalized.includes("issue") || normalized.includes("send") ? "issueRefund" : "draftRefundRequest");
  if (normalized.includes("cancel")) actions.add("cancelBooking");
  if (normalized.includes("pricing") || normalized.includes("price")) actions.add("changePricing");
  if (normalized.includes("github") || normalized.includes("push") || normalized.includes("code")) actions.add("pushToGithub");
  if (actions.size === 0 || normalized.includes("summarize") || normalized.includes("today")) actions.add("summarizeDay");

  const toolName =
    type === "code_action"
      ? "code"
      : type === "real_world_action"
        ? "automation"
        : type === "draft_action"
          ? "drafting"
          : type === "dashboard_query"
            ? "dashboard"
            : "knowledge";

  return {
    toolName,
    actionNames: [...actions],
    reason: `Command classified as ${type}; routed to ${toolName}.`,
  };
}
