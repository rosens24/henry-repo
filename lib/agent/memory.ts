import type { AgentExecutionLog, AgentMission, PendingApproval } from "@/lib/agent/types";

const recentMissions: AgentMission[] = [];
const recentLogs: AgentExecutionLog[] = [];
const pendingApprovals: PendingApproval[] = [];

export function rememberMission(mission: AgentMission) {
  recentMissions.unshift(mission);
  recentMissions.splice(8);
}

export function rememberLogs(logs: AgentExecutionLog[]) {
  recentLogs.unshift(...logs);
  recentLogs.splice(40);
}

export function rememberPendingApprovals(approvals: PendingApproval[]) {
  pendingApprovals.unshift(...approvals);
  pendingApprovals.splice(20);
}

export function getAgentMemory() {
  return {
    recentMissions: [...recentMissions],
    recentLogs: [...recentLogs],
    pendingApprovals: [...pendingApprovals],
  };
}
