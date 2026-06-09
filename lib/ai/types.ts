import type { ActionResult, UserRole } from "@/lib/actions/action-types";
import type { AgentRunResult } from "@/lib/agent/types";

export type AiStatus = "idle" | "listening" | "thinking" | "speaking";

export type MessageRole = "user" | "assistant";

export type CommandSource = "typed" | "voice" | "system";

export type JarvisMessage = {
  id: string;
  role: MessageRole;
  content: string;
  createdAt: string;
  source: CommandSource;
};

export type DashboardMetric = {
  id: string;
  label: string;
  value: string;
  detail: string;
  trend: "up" | "down" | "flat";
  intensity: number;
};

export type JarvisApiRequest = {
  command: string;
  source: "typed" | "voice";
  actorRole: UserRole;
  readOnlyMode: boolean;
};

export type JarvisApiResponse = {
  message: JarvisMessage;
  actions: ActionResult[];
  recommendedActions: ActionResult[];
  agent: AgentRunResult;
  openAiBridge: {
    connected: boolean;
    content: string;
    statusCode?: number;
  };
};
