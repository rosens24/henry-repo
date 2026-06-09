import { executeAgentMission } from "@/lib/agent/executor";
import { planMission } from "@/lib/agent/planner";
import { appendHenryFeedTurn } from "@/lib/ai/conversation-store";
import { getOpenAiOperatorResponse } from "@/lib/ai/openai-bridge";
import type { ActionResult } from "@/lib/actions/action-types";
import type { JarvisApiRequest, JarvisApiResponse } from "@/lib/ai/types";

export async function runJarvisCommand(request: JarvisApiRequest): Promise<JarvisApiResponse> {
  const context = {
    actorRole: request.actorRole,
    readOnlyMode: request.readOnlyMode,
    command: request.command,
  };
  const mission = planMission(request.command, request.readOnlyMode);
  const agent = await executeAgentMission(mission, context);
  const recommendedActions = recommendNextActions(agent.actions);
  const openAiBridge = await getOpenAiOperatorResponse({ command: request.command, agent });
  const responseContent = openAiBridge.connected
    ? openAiBridge.content
    : formatExecutiveResponse(agent.actions, recommendedActions, agent.mission.command, openAiBridge.content);
  const message = {
    id: crypto.randomUUID(),
    role: "assistant" as const,
    content: responseContent,
    createdAt: new Date().toISOString(),
    source: "system" as const,
  };

  await appendHenryFeedTurn({
    user: request.command,
    assistant: responseContent,
    source: request.source,
    channel: request.source === "voice" ? "browser_voice" : "chat",
    metadata: {
      actorRole: request.actorRole,
      readOnlyMode: request.readOnlyMode,
      openAiConnected: openAiBridge.connected,
      missionId: agent.mission.id,
      pendingApprovalCount: agent.pendingApprovals.length,
    },
  });

  return {
    actions: agent.actions,
    recommendedActions,
    agent,
    openAiBridge,
    message,
  };
}

function recommendNextActions(actions: ActionResult[]) {
  if (actions.some((action) => action.level === 3)) {
    return actions.filter((action) => action.level === 3);
  }

  return [];
}

function formatExecutiveResponse(actions: ActionResult[], recommendedActions: ActionResult[], command: string, bridgeStatus: string) {
  if (command.toLowerCase().includes("push to xenomorph")) {
    return `Developer handoff staged for XENOMORPH. No code was pushed. Approval is required before any repository action. ${bridgeStatus}`;
  }

  const summaries = actions.map((action) => action.summary).join(" ");
  const dataLabel = actions.every((action) => action.dataLabel === "mock data") ? "Live integrations are not connected yet." : "Real data included.";
  const approvalNote = recommendedActions.length
    ? ` Approval needed: ${recommendedActions.map((action) => action.actionName).join(", ")}.`
    : "";

  return `${dataLabel} ${summaries}${approvalNote} ${bridgeStatus}`.trim();
}
