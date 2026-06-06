import type { ActionResult, JarvisActionName, UserRole } from "@/lib/actions/action-types";

export type AgentCommandType = "question" | "dashboard_query" | "draft_action" | "real_world_action" | "code_action";

export type JarvisMode = "read_only" | "draft" | "approval_required" | "manual_override" | "developer";

export type AutonomyLevel = "monitor_only" | "draft_only" | "approval_required_execution" | "safe_full_auto";

export type AgentToolName =
  | "knowledge"
  | "dashboard"
  | "drafting"
  | "automation"
  | "code"
  | "scheduler";

export type AgentToolRoute = {
  toolName: AgentToolName;
  actionNames: JarvisActionName[];
  reason: string;
};

export type AgentPlanStep = {
  id: string;
  label: string;
  status: "pending" | "running" | "blocked" | "complete";
  detail: string;
};

export type AgentMission = {
  id: string;
  command: string;
  type: AgentCommandType;
  mode: JarvisMode;
  toolRoute: AgentToolRoute;
  plan: AgentPlanStep[];
  dryRun: boolean;
  permissionSummary: string;
  approvalRequired: boolean;
  rollbackPlan: string[];
  createdAt: string;
};

export type AgentExecutionLog = {
  id: string;
  missionId: string;
  message: string;
  level: "info" | "warning" | "blocked" | "success";
  createdAt: string;
};

export type PendingApproval = {
  id: string;
  missionId: string;
  actionName: JarvisActionName;
  permissionRequired: UserRole[];
  reason: string;
  createdAt: string;
};

export type ScheduledAutomation = {
  id: string;
  name: string;
  status: "placeholder" | "paused" | "ready";
  cadence: string;
  requiresApproval: boolean;
};

export type Briefing = {
  id: string;
  title: string;
  period: "morning" | "midday" | "nightly";
  scheduledFor: string;
  revenue: string;
  newBookings: number;
  missedCalls: number;
  newLeads: number;
  openCustomerIssues: number;
  cleanerAvailability: string;
  systemHealth: string;
  completedTasks: string[];
  approvalNeeded: string[];
  opportunities: string[];
  dataLabel: "mock data" | "real data";
};

export type BotConnectorName = "gmail" | "calendar" | "stripe" | "twilio" | "supabase" | "github" | "vercel" | "cloudflare";

export type CleanzAgentName =
  | "CEO Agent"
  | "Operations Agent"
  | "Sales Agent"
  | "Marketing Agent"
  | "Finance Agent"
  | "Customer Success Agent"
  | "Developer Agent"
  | "Recruiting Agent"
  | "Scheduling Agent";

export type CleanzAgentStatus = {
  name: CleanzAgentName;
  domain: string;
  health: "online" | "mock" | "blocked";
  activeMission: string;
  taskQueue: string[];
  reportingCadence: string;
  permissionScope: string;
  memoryStatus: "mock memory" | "connected";
  executionHistory: string[];
};

export type BotConnectorStatus = {
  name: BotConnectorName;
  mode: "live" | "not_connected";
  readOnlyReady: boolean;
  draftReady: boolean;
  executionReady: boolean;
  permissionChecks: boolean;
  auditLogs: boolean;
  dryRun: boolean;
  errorHandling: boolean;
  detail: string;
};

export type ToolStatus = {
  name: AgentToolName;
  status: "ready" | "mock" | "blocked" | "not_connected";
  detail: string;
};

export type AgentRunResult = {
  mission: AgentMission;
  actions: ActionResult[];
  pendingApprovals: PendingApproval[];
  executionLogs: AgentExecutionLog[];
  scheduledAutomations: ScheduledAutomation[];
  briefings: Briefing[];
  botConnectors: BotConnectorStatus[];
  agentNetwork: CleanzAgentStatus[];
  toolStatus: ToolStatus[];
  securityMode: {
    mode: JarvisMode;
    readOnlyMode: boolean;
    actorRole: UserRole;
    dangerousAutonomyAllowed: false;
  };
};
