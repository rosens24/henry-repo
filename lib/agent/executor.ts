import { runSafeAction } from "@/lib/actions/action-registry";
import { createPendingApprovals } from "@/lib/agent/approval-gate";
import { checkAgentPermissions } from "@/lib/agent/permissions-gate";
import { getScheduledAutomations } from "@/lib/agent/scheduler";
import { getDailyBriefings } from "@/lib/agent/briefing-generator";
import { getCleanzAgentNetwork } from "@/lib/agent/agent-network";
import { rememberLogs, rememberMission, rememberPendingApprovals } from "@/lib/agent/memory";
import { getBotConnectorStatuses } from "@/lib/bots/connectors";
import type { AgentExecutionLog, AgentMission, AgentRunResult, ToolStatus } from "@/lib/agent/types";
import type { ActionContext } from "@/lib/actions/action-types";

export async function executeAgentMission(mission: AgentMission, context: ActionContext): Promise<AgentRunResult> {
  const permission = checkAgentPermissions(mission.toolRoute.actionNames, context.actorRole, context.readOnlyMode);
  const updatedMission: AgentMission = {
    ...mission,
    permissionSummary: permission.summary,
    approvalRequired: permission.approvalRequired,
    plan: mission.plan.map((step) => {
      if (step.id === "permission") return { ...step, status: permission.allowed ? "complete" : permission.approvalRequired ? "blocked" : "blocked", detail: permission.summary };
      if (step.id === "approval") return { ...step, status: permission.approvalRequired ? "blocked" : "complete", detail: permission.approvalRequired ? "Waiting for human approval." : "No sensitive action selected." };
      return step;
    }),
  };
  const actions = await Promise.all(mission.toolRoute.actionNames.map((actionName) => runSafeAction(actionName, context)));
  const approvals = permission.approvalRequired ? createPendingApprovals(mission.id, mission.toolRoute.actionNames.filter((actionName) => actionName !== "summarizeDay")) : [];
  const executionLogs = buildLogs(updatedMission, permission.allowed, approvals.length);

  rememberMission(updatedMission);
  rememberLogs(executionLogs);
  rememberPendingApprovals(approvals);

  return {
    mission: {
      ...updatedMission,
      plan: updatedMission.plan.map((step) => {
        if (step.id === "dry-run") return { ...step, status: "complete", detail: "Dry-run completed with mock actions only." };
        if (step.id === "report") return { ...step, status: "complete", detail: "Operator report generated." };
        return step;
      }),
    },
    actions,
    pendingApprovals: approvals,
    executionLogs,
    scheduledAutomations: getScheduledAutomations(),
    briefings: getDailyBriefings(),
    botConnectors: getBotConnectorStatuses(),
    agentNetwork: getCleanzAgentNetwork(),
    toolStatus: getToolStatus(),
    securityMode: {
      mode: mission.mode,
      readOnlyMode: context.readOnlyMode,
      actorRole: context.actorRole,
      dangerousAutonomyAllowed: false,
    },
  };
}

function buildLogs(mission: AgentMission, permissionAllowed: boolean, approvalCount: number): AgentExecutionLog[] {
  return [
    {
      id: crypto.randomUUID(),
      missionId: mission.id,
      message: `Mission planned as ${mission.type}; routed to ${mission.toolRoute.toolName}.`,
      level: "info",
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      missionId: mission.id,
      message: permissionAllowed ? "Permission gate passed for dry-run." : mission.permissionSummary,
      level: permissionAllowed ? "success" : "blocked",
      createdAt: new Date().toISOString(),
    },
    {
      id: crypto.randomUUID(),
      missionId: mission.id,
      message: approvalCount > 0 ? `${approvalCount} approval item staged. No real action executed.` : "No approval required. Mock dry-run only.",
      level: approvalCount > 0 ? "warning" : "info",
      createdAt: new Date().toISOString(),
    },
  ];
}

function getToolStatus(): ToolStatus[] {
  return [
    { name: "knowledge", status: "mock", detail: "Local executive response logic only." },
    { name: "dashboard", status: "mock", detail: "Mock Cleanz metrics connected." },
    { name: "drafting", status: "mock", detail: "Drafts are local placeholders." },
    { name: "automation", status: "blocked", detail: "Real-world actions require approval and integrations." },
    { name: "code", status: "blocked", detail: "GitHub pushes are disabled without approval." },
    { name: "scheduler", status: "not_connected", detail: "Scheduling is placeholder only." },
  ];
}
