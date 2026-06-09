import { planRollback } from "@/lib/agent/rollback";
import { routeTool } from "@/lib/agent/tool-router";
import type { AgentCommandType, AgentMission, JarvisMode } from "@/lib/agent/types";

export function classifyCommand(command: string): AgentCommandType {
  const normalized = command.toLowerCase();

  if (normalized.includes("push") || normalized.includes("github") || normalized.includes("code")) return "code_action";
  if (normalized.includes("send") || normalized.includes("refund") || normalized.includes("cancel") || normalized.includes("delete") || normalized.includes("charge")) return "real_world_action";
  if (normalized.includes("health") || normalized.includes("food") || normalized.includes("exercise") || normalized.includes("mental") || normalized.includes("body")) return "dashboard_query";
  if (normalized.includes("crm") || normalized.includes("companies") || normalized.includes("company") || normalized.includes("sales call")) return "dashboard_query";
  if (normalized.includes("deal") || normalized.includes("acquisition") || normalized.includes("multifamily") || normalized.includes("multi family") || normalized.includes("single family") || normalized.includes("cedar neck")) return "dashboard_query";
  if (normalized.includes("draft") || normalized.includes("write") || normalized.includes("prepare")) return "draft_action";
  if (normalized.includes("revenue") || normalized.includes("job") || normalized.includes("booking") || normalized.includes("cleaner") || normalized.includes("message")) return "dashboard_query";

  return "question";
}

export function resolveMode(type: AgentCommandType, readOnlyMode: boolean): JarvisMode {
  if (type === "code_action") return "developer";
  if (type === "real_world_action") return "approval_required";
  if (type === "draft_action") return "draft";
  if (readOnlyMode) return "read_only";

  return "manual_override";
}

export function planMission(command: string, readOnlyMode: boolean): AgentMission {
  const type = classifyCommand(command);
  const mode = resolveMode(type, readOnlyMode);
  const toolRoute = routeTool(command, type);
  const missionId = crypto.randomUUID();

  return {
    id: missionId,
    command,
    type,
    mode,
    toolRoute,
    dryRun: true,
    permissionSummary: "Permission gate pending.",
    approvalRequired: false,
    rollbackPlan: planRollback(toolRoute.actionNames),
    createdAt: new Date().toISOString(),
    plan: [
      { id: "understand", label: "Understand command", status: "complete", detail: `Classified as ${type}.` },
      { id: "route", label: "Route tool", status: "complete", detail: toolRoute.reason },
      { id: "permission", label: "Check permissions", status: "pending", detail: "Role and sensitivity check queued." },
      { id: "dry-run", label: "Run safety check", status: "pending", detail: "Read-only check before any approval-gated action." },
      { id: "approval", label: "Human approval gate", status: "pending", detail: "Sensitive actions stop here." },
      { id: "report", label: "Report result", status: "pending", detail: "Return executive summary and logs." },
    ],
  };
}
